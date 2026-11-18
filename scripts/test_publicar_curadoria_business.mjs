import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { prepareBusinessPublication, applyBusinessPublication } from './publicar_curadoria_business.mjs';

const originalSource = JSON.parse(fs.readFileSync('src/content/business/fontes/hbr.json', 'utf8'));
const SOURCE_URL = 'https://hbr.org/2026/11/uma-pauta-editorial-verificavel';
const record = {
  titulo: 'Uma pauta editorial verificável sobre decisões de mercado',
  resumo: 'A leitura examina como uma decisão de mercado pode ser discutida com objetivos, comparação e contexto explícitos. A ficha registra o argumento central e orienta o leitor a conferir a publicação original. Seus exemplos dependem da situação estudada e não demonstram resultados para empresas de outros setores.',
  fonte: 'hbr', url: SOURCE_URL, tipo: 'artigo', trilha: 'estrategia', autores: 'Autora identificada',
  data: '2026-11-18', data_precisa: true, idioma: 'en', acesso: 'Conferir no original',
  evidencia: 'análise executiva', limites: 'Aplicação depende do contexto e do método descritos na fonte original.',
  status: 'em-revisao', justificativa: 'Leitura pertinente à discussão de decisões de mercado, com fonte e limites registrados.',
  revisor: 'Agente verificador Business', revisado_em: '2026-11-18', referencias: [SOURCE_URL],
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'harpya-business-gate-'));
  const acervo = path.join(root, 'src/content/business/acervo');
  const fontes = path.join(root, 'src/content/business/fontes');
  const approvals = path.join(root, 'curadoria/business/aprovacoes');
  for (const dir of [acervo, fontes, approvals]) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(fontes, 'hbr.json'), JSON.stringify(originalSource));
  const itemPath = 'src/content/business/acervo/pauta-editorial.json';
  const itemFile = path.join(root, itemPath);
  const bytes = Buffer.from(JSON.stringify(record, null, 2) + '\n');
  fs.writeFileSync(itemFile, bytes);
  const entry = {
    path: itemPath, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    sha256_publicado: crypto.createHash('sha256').update(JSON.stringify({ ...record, status: 'publicado' }, null, 2) + '\n').digest('hex'),
    verificacao: { responsavel: 'Agente verificador Business', evidencias: [SOURCE_URL],
      alegacoes: [{ texto: 'O texto original apresenta uma decisão de mercado.', url: SOURCE_URL, resultado: 'qualificada' }] },
    selecao: { responsavel: 'Agente classificador Business', nota: 8, justificativa: 'Pauta relevante e verificável para a trilha de estratégia do Harpya Business.' },
  };
  const manifestFile = path.join(approvals, '2026-11-18.json');
  const save = () => fs.writeFileSync(manifestFile, JSON.stringify({ data: '2026-11-18', items: [entry] }, null, 2) + '\n');
  save();
  return { root, itemFile, manifestFile, entry, save, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test('valida sem escrever e promove o item somente após aprovação completa', () => {
  const f = fixture();
  try {
    const plan = prepareBusinessPublication(f.manifestFile, f.root);
    assert.equal(JSON.parse(fs.readFileSync(f.itemFile)).status, 'em-revisao');
    applyBusinessPublication(plan);
    assert.equal(JSON.parse(fs.readFileSync(f.itemFile)).status, 'publicado');
    const after = fs.readFileSync(f.itemFile);
    const replay = prepareBusinessPublication(f.manifestFile, f.root);
    assert.equal(replay[0].alreadyPublished, true);
    applyBusinessPublication(replay);
    assert.deepEqual(fs.readFileSync(f.itemFile), after);
  } finally { f.cleanup(); }
});

test('recupera publicação interrompida entre dois itens do mesmo manifesto', () => {
  const f = fixture();
  try {
    const secondUrl = 'https://hbr.org/2026/11/segunda-pauta-verificavel';
    const secondRecord = { ...record, titulo: 'Segunda pauta editorial verificável sobre decisões', url: secondUrl, referencias: [secondUrl] };
    const secondFile = path.join(f.root, 'src/content/business/acervo/segunda-pauta.json');
    const secondBytes = Buffer.from(JSON.stringify(secondRecord, null, 2) + '\n');
    fs.writeFileSync(secondFile, secondBytes);
    const secondEntry = structuredClone(f.entry);
    secondEntry.path = 'src/content/business/acervo/segunda-pauta.json';
    secondEntry.sha256 = crypto.createHash('sha256').update(secondBytes).digest('hex');
    secondEntry.sha256_publicado = crypto.createHash('sha256').update(JSON.stringify({ ...secondRecord, status: 'publicado' }, null, 2) + '\n').digest('hex');
    secondEntry.verificacao.evidencias = [secondUrl];
    secondEntry.verificacao.alegacoes[0].url = secondUrl;
    fs.writeFileSync(f.manifestFile, JSON.stringify({ data: '2026-11-18', items: [f.entry, secondEntry] }, null, 2) + '\n');
    const firstPass = prepareBusinessPublication(f.manifestFile, f.root);
    fs.writeFileSync(firstPass[0].filename, firstPass[0].output); // simula interrupção após o primeiro item
    const recovery = prepareBusinessPublication(f.manifestFile, f.root);
    assert.deepEqual(recovery.map(x => x.alreadyPublished), [true, false]);
    applyBusinessPublication(recovery);
    assert.deepEqual([f.itemFile, secondFile].map(file => JSON.parse(fs.readFileSync(file)).status), ['publicado', 'publicado']);
  } finally { f.cleanup(); }
});

test('recusa manifesto sem revisão independente, hash íntegro ou evidência da alegação', () => {
  const f = fixture();
  try {
    f.entry.selecao.responsavel = f.entry.verificacao.responsavel;
    f.save();
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /distintos/);
    f.entry.selecao.responsavel = 'Agente classificador Business';
    f.entry.verificacao.alegacoes[0].resultado = 'não verificada';
    f.save();
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /Alegação sem comprovação/);
    f.entry.verificacao.alegacoes[0].resultado = 'confirmada';
    f.entry.sha256 = '0'.repeat(64);
    f.save();
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /SHA-256 divergente/);
    f.entry.sha256 = crypto.createHash('sha256').update(fs.readFileSync(f.itemFile)).digest('hex');
    f.entry.sha256_publicado = '0'.repeat(64);
    f.save();
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /Hash publicado não corresponde/);
  } finally { f.cleanup(); }
});

test('recusa fonte suspensa, URL duplicada e caminho fora do acervo', () => {
  const f = fixture();
  try {
    fs.writeFileSync(path.join(f.root, 'src/content/business/fontes/hbr.json'), JSON.stringify({ ...originalSource, status: 'suspenso' }));
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /Fonte institucional não aprovada/);
    fs.writeFileSync(path.join(f.root, 'src/content/business/fontes/hbr.json'), JSON.stringify(originalSource));
    fs.writeFileSync(path.join(f.root, 'src/content/business/acervo/duplicado.json'), JSON.stringify({ ...record, status: 'publicado' }));
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /URL do item duplicada/);
    fs.rmSync(path.join(f.root, 'src/content/business/acervo/duplicado.json'));
    f.entry.path = '../outside.json';
    f.save();
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /Caminho do item Business inválido/);
  } finally { f.cleanup(); }
});

test('filme Business exige revisão, metadados e imagem licenciada quando houver', () => {
  const f = fixture();
  try {
    const directory = path.join(f.root, 'src/content/business/filmes');
    fs.mkdirSync(directory, { recursive: true });
    const film = {
      titulo: 'Um documentário de teste sobre decisões de negócios', direcao: 'Diretora Teste', ano: 2026,
      resumo: 'Documentário de teste que examina decisões empresariais e discute como evidências e contexto influenciam a interpretação de resultados.',
      porque_ver: 'Ajuda a discutir como decisões de negócios são apresentadas e verificadas.',
      limites: 'Uma obra audiovisual não substitui pesquisa revisada por pares.',
      url: 'https://filmes.example.org/documentario', assistir_url: '', imagem: '',
      revisor: 'Agente verificador Business', revisado_em: '2026-11-18',
      status: 'rascunho', origem: 'curadoria-diaria', adicionado_em: '2026-11-18', verificado_em: '2026-11-18',
    };
    const bytes = Buffer.from(JSON.stringify(film, null, 2) + '\n');
    const filename = path.join(directory, 'documentario-teste.json');
    fs.writeFileSync(filename, bytes);
    f.entry.path = 'src/content/business/filmes/documentario-teste.json';
    f.entry.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    f.entry.sha256_publicado = crypto.createHash('sha256').update(JSON.stringify({ ...film, status: 'publicado' }, null, 2) + '\n').digest('hex');
    f.entry.verificacao.evidencias = [film.url];
    f.entry.verificacao.alegacoes = [{ texto: 'A obra possui direção e ano declarados.', url: film.url, resultado: 'confirmada' }];
    f.save();
    const plan = prepareBusinessPublication(f.manifestFile, f.root);
    assert.equal(plan.length, 1);
    applyBusinessPublication(plan);
    assert.equal(prepareBusinessPublication(f.manifestFile, f.root)[0].alreadyPublished, true);
    fs.writeFileSync(filename, bytes);
    film.imagem = '/img/filmes/capa-inexistente.jpg';
    film.imagem_credito = 'Estúdio';
    film.imagem_fonte = film.url;
    film.imagem_licenca = 'Uso autorizado';
    const withImage = Buffer.from(JSON.stringify(film, null, 2) + '\n');
    fs.writeFileSync(filename, withImage);
    f.entry.sha256 = crypto.createHash('sha256').update(withImage).digest('hex');
    f.save();
    assert.throws(() => prepareBusinessPublication(f.manifestFile, f.root), /Imagem de filme sem arquivo/);
  } finally { f.cleanup(); }
});
