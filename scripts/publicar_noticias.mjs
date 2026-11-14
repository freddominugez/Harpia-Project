// Robô de publicação das NotícIAs: publica as melhores do dia pela nota de qualidade.
// Uso: node scripts/publicar_noticias.mjs [--quantidade 2] [--minimo 60] [--hoje AAAA-MM-DD] [--simular]
// Lê src/content/noticias/*.json, pontua os rascunhos (public/admin/noticias/score.js),
// troca o status dos escolhidos para "publicado" e anota tudo em curadoria/noticias/publicacao/<dia>.json.
// Rodar de novo no mesmo dia só completa o que faltar para a meta; nunca republica o que voltou a rascunho.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escolher, NOTA_MINIMA, POR_DIA } from '../public/admin/noticias/score.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Dia corrente em Fortaleza (UTC-3, sem horário de verão). */
export const hojeEmFortaleza = (agora = new Date()) => new Date(agora.getTime() - 3 * 3600000).toISOString().slice(0, 10);

export function executar({ raiz = RAIZ, hoje = hojeEmFortaleza(), quantidade = POR_DIA, minimo = NOTA_MINIMA, simular = false } = {}) {
  const pasta = path.join(raiz, 'src/content/noticias');
  const registros = path.join(raiz, 'curadoria/noticias/publicacao');
  const itens = fs.readdirSync(pasta).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ slug: f.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')) }));

  // O que o robô já publicou: conta para a meta de hoje e nunca volta sozinho ao site.
  const anteriores = fs.existsSync(registros) ? fs.readdirSync(registros).filter((f) => f.endsWith('.json')) : [];
  const jaPublicados = anteriores.flatMap((f) => JSON.parse(fs.readFileSync(path.join(registros, f), 'utf8')).publicadas.map((p) => p.slug));
  const arquivoHoje = path.join(registros, `${hoje}.json`);
  const registro = fs.existsSync(arquivoHoje) ? JSON.parse(fs.readFileSync(arquivoHoje, 'utf8')) : { dia: hoje, meta: quantidade, nota_minima: minimo, publicadas: [] };

  const faltam = Math.max(0, quantidade - registro.publicadas.length);
  const { fila, escolhidos } = escolher(itens, { hoje, quantidade: faltam, minimo, excluir: jaPublicados });

  for (const { item, total, criterios } of escolhidos) {
    const { slug, ...conteudo } = item;
    if (!simular) fs.writeFileSync(path.join(pasta, `${slug}.json`), `${JSON.stringify({ ...conteudo, status: 'publicado' }, null, 2)}\n`);
    registro.publicadas.push({ slug, titulo: item.titulo, categoria: item.categoria, nota: total, criterios: Object.fromEntries(criterios.map((c) => [c.id, c.pontos])) });
  }
  const escolhidosSet = new Set(escolhidos.map((r) => r.item.slug));
  registro.meta = quantidade;
  registro.nota_minima = minimo;
  registro.fila = fila.filter((r) => !escolhidosSet.has(r.item.slug))
    .map((r) => ({ slug: r.item.slug, nota: r.total, apto: r.apto, ...(r.bloqueios.length ? { bloqueios: r.bloqueios } : {}) }));
  registro.faltaram = Math.max(0, quantidade - registro.publicadas.length);
  if (!simular && (escolhidos.length || !fs.existsSync(arquivoHoje))) {
    fs.mkdirSync(registros, { recursive: true });
    fs.writeFileSync(arquivoHoje, `${JSON.stringify(registro, null, 2)}\n`);
  }
  return { hoje, escolhidos, registro };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const valor = (nome) => { const i = args.indexOf(`--${nome}`); return i >= 0 ? args[i + 1] : undefined; };
  const numero = (nome, padrao) => { const v = valor(nome); if (v === undefined) return padrao; const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new Error(`--${nome} inválido: ${v}`); return n; };
  const hoje = valor('hoje') ?? hojeEmFortaleza();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hoje)) throw new Error(`--hoje inválido: ${hoje}`);
  const simular = args.includes('--simular');
  const { escolhidos, registro } = executar({ hoje, quantidade: numero('quantidade', POR_DIA), minimo: numero('minimo', NOTA_MINIMA), simular });
  const linhas = [`## NotícIAs de ${hoje}${simular ? ' (simulação)' : ''}`, ''];
  if (escolhidos.length) {
    linhas.push('| Nota | Tema | Notícia |', '|---|---|---|');
    for (const r of escolhidos) linhas.push(`| ${r.total} | ${r.item.categoria} | [${r.item.titulo}](https://www.harpya.org/noticias/${r.item.slug}/) |`);
  } else linhas.push(registro.publicadas.length >= registro.meta ? 'Meta do dia já cumprida.' : 'Nenhum rascunho apto.');
  if (registro.faltaram) linhas.push('', `**Faltaram ${registro.faltaram} para a meta de ${registro.meta}.** Nenhum outro rascunho alcança a nota ${registro.nota_minima} sem bloqueio.`);
  const aptos = registro.fila.filter((r) => r.apto).length;
  linhas.push('', `Rascunhos aptos na fila: ${aptos}${aptos < registro.meta * 2 ? ' (fila curta: menos de dois dias de reserva)' : ''}.`);
  const texto = linhas.join('\n');
  console.log(texto);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${texto}\n`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `publicadas=${escolhidos.length}\nfaltaram=${registro.faltaram}\n`);
}
