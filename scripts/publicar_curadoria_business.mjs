// Gate de publicação Business. O texto e a verificação independente chegam
// como arquivos e manifesto; este programa não inventa nem coleta conteúdo.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateBusinessPublication } from '../public/admin/business/editorial-validation.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED_STATUS = new Set(['em-revisao', 'aprovado']);
const APPROVED_CLAIMS = new Set(['confirmada', 'qualificada']);

function fail(message) { throw new Error(message); }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function validHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443');
  } catch { return false; }
}
function words(value) { return String(value || '').trim().split(/\s+/).filter(Boolean).length; }
function publicationState(entry, digest, status, stagedStatuses) {
  if (!/^[a-f0-9]{64}$/.test(entry.sha256 || '') || !/^[a-f0-9]{64}$/.test(entry.sha256_publicado || '')) {
    fail(`Manifesto exige hashes antes e depois da publicação: ${entry.path}`);
  }
  if (status === 'publicado' && digest === entry.sha256_publicado) return true;
  if (stagedStatuses.has(status) && digest === entry.sha256) return false;
  fail(`Estado ou SHA-256 divergente: ${entry.path}`);
}
function publicationResult(entry, filename, data, alreadyPublished) {
  const output = `${JSON.stringify({ ...data, status: 'publicado' }, null, 2)}\n`;
  const outputHash = crypto.createHash('sha256').update(output).digest('hex');
  if (outputHash !== entry.sha256_publicado) fail(`Hash publicado não corresponde ao conteúdo: ${entry.path}`);
  return { filename, data, output, expectedHash: alreadyPublished ? entry.sha256_publicado : entry.sha256, alreadyPublished };
}
function loadSources(root = ROOT) {
  const directory = path.join(root, 'src/content/business/fontes');
  return fs.readdirSync(directory).filter(name => name.endsWith('.json')).map(name => ({
    id: name.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')),
  }));
}
function existingUrls(root = ROOT) {
  const directory = path.join(root, 'src/content/business/acervo');
  const urls = new Map();
  for (const name of fs.readdirSync(directory).filter(name => name.endsWith('.json'))) {
    const record = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
    if (record.url) {
      const key = record.url.replace(/\/$/, '');
      if (!urls.has(key)) urls.set(key, new Set());
      urls.get(key).add(name);
    }
  }
  return urls;
}

function requireReview(entry, data, permitted) {
  if (!object(entry.verificacao) || !object(entry.selecao)) fail(`Verificação e seleção ausentes: ${entry.path}`);
  const reviewer = String(entry.verificacao.responsavel || '').trim();
  const selector = String(entry.selecao.responsavel || '').trim();
  if (reviewer.length < 3 || selector.length < 3 || reviewer === selector) fail(`Verificador e classificador distintos são obrigatórios: ${entry.path}`);
  if (String(data.revisor || '').trim() !== reviewer) fail(`Revisor do item diverge do manifesto: ${entry.path}`);
  if (!Number.isFinite(entry.selecao.nota) || entry.selecao.nota < 7 || entry.selecao.nota > 10 ||
      String(entry.selecao.justificativa || '').trim().length < 30) fail(`Seleção insuficiente: ${entry.path}`);
  const proof = entry.verificacao.evidencias;
  const claims = entry.verificacao.alegacoes;
  if (!Array.isArray(proof) || proof.length === 0 || !Array.isArray(claims) || claims.length === 0) fail(`Evidências e alegações são obrigatórias: ${entry.path}`);
  if (!proof.includes(data.url)) fail(`Original deve constar entre as evidências: ${entry.path}`);
  for (const url of proof) if (!validHttps(url) || !permitted.has(url)) fail(`Evidência sem referência no item: ${entry.path}`);
  for (const claim of claims) {
    if (!object(claim) || String(claim.texto || '').trim().length < 12 || !proof.includes(claim.url) ||
        !APPROVED_CLAIMS.has(claim.resultado)) fail(`Alegação sem comprovação: ${entry.path}`);
  }
}

export function validateBusinessManifestEntry(entry, sources, urls, root = ROOT) {
  if (!object(entry) || typeof entry.path !== 'string' ||
      !/^src\/content\/business\/acervo\/[a-z0-9][a-z0-9-]{0,119}\.json$/.test(entry.path)) {
    fail('Caminho do item Business inválido.');
  }
  const filename = path.resolve(root, entry.path);
  if (!filename.startsWith(path.join(root, 'src/content/business/acervo') + path.sep)) fail('Caminho fora do acervo Business.');
  if (!fs.existsSync(filename) || fs.lstatSync(filename).isSymbolicLink()) fail(`Arquivo ausente ou simbólico: ${entry.path}`);
  const bytes = fs.readFileSync(filename);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  const data = JSON.parse(bytes.toString('utf8'));
  const alreadyPublished = publicationState(entry, digest, data.status, ALLOWED_STATUS);
  const permitted = new Set([data.url, ...(data.referencias || []), ...(data.evidencias_revisao || [])]);
  requireReview(entry, data, permitted);
  if (data.tipo === 'noticia') {
    if (data.resumo.length < 120 || data.resumo.length > 200 || data.corpo?.length < 3 || data.corpo?.length > 5) fail(`Notícia fora do padrão editorial Business: ${entry.path}`);
  } else if (['artigo', 'relatorio', 'livro'].includes(data.tipo) && (words(data.resumo) < 40 || words(data.resumo) > 65)) {
    fail(`Resumo da ficha Business deve ter 40 a 65 palavras: ${entry.path}`);
  }
  if (data.tipo === 'video' && (data.resumo.length < 20 || data.resumo.length > 240)) fail(`Resumo de vídeo fora do padrão: ${entry.path}`);
  const urlKey = data.url.replace(/\/$/, '');
  if (urls.get(urlKey)?.size !== 1 || !urls.get(urlKey).has(path.basename(filename))) fail(`URL do item duplicada ou fora do acervo: ${entry.path}`);
  validateBusinessPublication('business/acervo', data, sources);
  return publicationResult(entry, filename, data, alreadyPublished);
}

export function validateBusinessFilmEntry(entry, root = ROOT) {
  if (!object(entry) || typeof entry.path !== 'string' ||
      !/^src\/content\/business\/filmes\/[a-z0-9][a-z0-9-]{0,119}\.json$/.test(entry.path)) fail('Caminho do filme Business inválido.');
  const directory = path.join(root, 'src/content/business/filmes');
  const filename = path.resolve(root, entry.path);
  if (!filename.startsWith(directory + path.sep) || !fs.existsSync(filename) || fs.lstatSync(filename).isSymbolicLink()) fail(`Filme ausente ou simbólico: ${entry.path}`);
  const bytes = fs.readFileSync(filename);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  const data = JSON.parse(bytes.toString('utf8'));
  const alreadyPublished = publicationState(entry, digest, data.status, new Set(['rascunho']));
  if (String(data.titulo || '').trim().length < 5 || String(data.direcao || '').trim().length < 2 ||
      !Number.isInteger(data.ano) || data.ano < 1895 || data.ano > 2100 ||
      String(data.resumo || '').length < 60 || String(data.resumo || '').length > 200 ||
      String(data.porque_ver || '').length < 40 || String(data.limites || '').length < 20 ||
      !validHttps(data.url) || (data.assistir_url && !validHttps(data.assistir_url)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.revisado_em || '') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.adicionado_em || '') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.verificado_em || '') ||
      !['manual', 'curadoria-diaria'].includes(data.origem)) fail(`Filme fora do schema editorial: ${entry.path}`);
  if (data.imagem) {
    if (!/^\/img\/filmes\/[A-Za-z0-9._-]+$/.test(data.imagem) || !data.imagem_credito || !data.imagem_licenca ||
        !validHttps(data.imagem_fonte) || !fs.existsSync(path.join(root, 'public', data.imagem))) fail(`Imagem de filme sem arquivo, origem ou licença: ${entry.path}`);
  }
  requireReview(entry, data, new Set([data.url, data.assistir_url, data.imagem_fonte].filter(Boolean)));
  const duplicates = new Set();
  for (const name of fs.readdirSync(directory).filter(name => name.endsWith('.json'))) {
    const item = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
    if (item.url?.replace(/\/$/, '') === data.url.replace(/\/$/, '')) duplicates.add(name);
  }
  if (duplicates.size !== 1 || !duplicates.has(path.basename(filename))) fail(`URL de filme duplicada: ${entry.path}`);
  return publicationResult(entry, filename, data, alreadyPublished);
}

export function prepareBusinessPublication(manifestPath, root = ROOT) {
  const approvals = path.join(root, 'curadoria/business/aprovacoes');
  if (!manifestPath.startsWith(approvals + path.sep) || !/^\d{4}-\d{2}-\d{2}\.json$/.test(path.basename(manifestPath)) || fs.lstatSync(manifestPath).isSymbolicLink()) {
    fail('Manifesto deve estar em curadoria/business/aprovacoes/AAAA-MM-DD.json.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!object(manifest) || !Array.isArray(manifest.items) || manifest.items.length === 0 || manifest.items.length > 10) fail('Manifesto Business exige 1 a 10 itens.');
  if (manifest.data !== path.basename(manifestPath, '.json')) fail('Data do manifesto deve corresponder ao nome do arquivo.');
  const sources = loadSources(root);
  const urls = existingUrls(root);
  const paths = new Set();
  return manifest.items.map(entry => {
    if (paths.has(entry.path)) fail(`Item repetido no manifesto: ${entry.path}`);
    paths.add(entry.path);
    return entry.path?.startsWith('src/content/business/filmes/')
      ? validateBusinessFilmEntry(entry, root)
      : validateBusinessManifestEntry(entry, sources, urls, root);
  });
}

export function applyBusinessPublication(plan) {
  // A reexecução reconhece itens já publicados e completa os restantes.
  // Reconfira todos os hashes antes de qualquer escrita para detectar corridas.
  for (const item of plan) {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(item.filename)).digest('hex');
    if (digest !== item.expectedHash) fail(`Arquivo mudou após validação: ${item.filename}`);
  }
  for (const item of plan) if (!item.alreadyPublished) fs.writeFileSync(item.filename, item.output);
}

function main(argv) {
  const index = argv.indexOf('--manifest');
  if (index < 0 || !argv[index + 1] || argv.some(arg => !['--manifest', '--apply', argv[index + 1]].includes(arg))) {
    fail('Uso: node scripts/publicar_curadoria_business.mjs --manifest CAMINHO.json [--apply]');
  }
  const plan = prepareBusinessPublication(path.resolve(argv[index + 1]));
  if (argv.includes('--apply')) applyBusinessPublication(plan);
  for (const item of plan) console.log(`${item.alreadyPublished ? 'JA_PUBLICADO' : argv.includes('--apply') ? 'PUBLICADO' : 'APTO'} ${path.relative(ROOT, item.filename)} ${item.data.url}`);
  console.log(`Business: ${plan.length} item(ns) validados; ${argv.includes('--apply') ? plan.filter(x => !x.alreadyPublished).length + ' promovido(s)' : 'sem alteração'}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
