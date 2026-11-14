// Nota de qualidade das NotícIAs, escolha do dia, robô de publicação e ações da página do painel.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pontuar, escolher, fontePrimaria, NOTA_MINIMA, VALIDADE_DIAS } from '../public/admin/noticias/score.js';
import { executar, hojeEmFortaleza } from './publicar_noticias.mjs';
import { pedido, lerNoticias, publicadosPeloRobo } from '../public/admin/noticias/app.js';

const HOJE = '2026-11-14';
const boa = (extra = {}) => ({
  slug: 'boa', titulo: 'Ministério publica diretrizes para uso de IA nas escolas públicas', categoria: 'brasil', icone: 'balanca',
  resumo: 'O texto define prazos para as redes de ensino e exige formação de professores antes da adoção de ferramentas de IA em sala de aula.',
  data: '2026-11-13',
  corpo: [
    'Segundo o ministério, as diretrizes publicadas em 13 de novembro valem para as 27 redes estaduais e dão 180 dias para a adaptação dos currículos.',
    'O documento afirma que 62% dos professores ouvidos na consulta pública pediram formação antes de usar as ferramentas, de acordo com o relatório anexo.',
    'A pasta informou que o orçamento previsto é de 40 milhões de reais em 2027, mas ainda não há detalhamento por estado, e a amostra da consulta é pequena.',
    'Entidades de professores declararam apoio ao texto, com a ressalva de que o prazo é curto para redes sem equipe técnica própria.',
  ],
  harpia: 'É política pública com prazo, orçamento e fonte primária: dá para conferir o que foi prometido e cobrar depois, que é o tipo de letramento que o projeto defende.',
  fontes: [
    { veiculo: 'MEC', titulo: 'Diretrizes', url: 'https://www.gov.br/mec/diretrizes' },
    { veiculo: 'Agência Brasil', titulo: 'Cobertura', url: 'https://agenciabrasil.ebc.com.br/x' },
    { veiculo: 'Folha', titulo: 'Cobertura', url: 'https://www1.folha.uol.com.br/y' },
  ],
  status: 'rascunho', origem: 'curadoria-diaria', adicionado_em: HOJE, verificado_em: HOJE, ordem: 999, ...extra,
});
const fraca = (extra = {}) => boa({
  slug: 'fraca', titulo: 'Empresa lança produto revolucionário', categoria: 'abertos',
  corpo: ['Uma empresa apresentou um produto novo que promete mudar o mercado inteiro.', 'O lançamento foi descrito como incrível pelos próprios executivos da companhia.'],
  harpia: 'Mostra o ritmo acelerado dos lançamentos no setor.', fontes: [{ veiculo: 'Blog', titulo: 'Post', url: 'https://blog.exemplo.com/p' }], ...extra,
});

test('fonte primária é reconhecida pelo domínio', () => {
  for (const url of ['https://www.gov.br/mec/x', 'https://arxiv.org/abs/1', 'https://digital-strategy.ec.europa.eu/x', 'https://www.mit.edu/x', 'https://github.com/a/b']) assert.equal(fontePrimaria(url), true, url);
  for (const url of ['https://techcrunch.com/x', 'https://governo.exemplo.com/x', 'nada']) assert.equal(fontePrimaria(url), false, url);
});

test('a nota soma os seis critérios e fica entre 0 e 100', () => {
  const nota = pontuar(boa(), { hoje: HOJE });
  assert.deepEqual(nota.criterios.map((c) => c.id), ['fontes', 'atualidade', 'substancia', 'rigor', 'forma', 'variedade']);
  assert.equal(nota.criterios.reduce((s, c) => s + c.max, 0), 100);
  assert.equal(nota.total, nota.criterios.reduce((s, c) => s + c.pontos, 0));
  assert.ok(nota.total >= 90, `esperava nota alta, veio ${nota.total}`);
  assert.deepEqual(nota.bloqueios, []);
});

test('texto raso, fonte única e tom promocional derrubam a nota', () => {
  const nota = pontuar(fraca(), { hoje: HOJE });
  assert.ok(nota.total < NOTA_MINIMA, `esperava abaixo de ${NOTA_MINIMA}, veio ${nota.total}`);
  assert.match(nota.criterios.find((c) => c.id === 'rigor').nota, /promociona/);
});

test('a atualidade cai com os dias e fato vencido é bloqueado', () => {
  const pontos = (data) => pontuar(boa({ data }), { hoje: HOJE }).criterios.find((c) => c.id === 'atualidade').pontos;
  assert.deepEqual([pontos('2026-11-14'), pontos('2026-11-12'), pontos('2026-11-10'), pontos('2026-11-07'), pontos('2026-10-31')], [20, 20, 16, 12, 5]);
  const vencida = new Date(Date.parse(`${HOJE}T00:00:00Z`) - (VALIDADE_DIAS + 1) * 86400000).toISOString().slice(0, 10);
  assert.match(pontuar(boa({ data: vencida }), { hoje: HOJE }).bloqueios.join(' '), /dias atrás/);
  assert.match(pontuar(boa({ data: '2026-11-20' }), { hoje: HOJE }).bloqueios.join(' '), /futuro/);
});

test('bloqueia fonte sem https e fonte repetida de notícia no ar', () => {
  assert.match(pontuar(boa({ fontes: [{ veiculo: 'X', titulo: 'Y', url: 'http://exemplo.com/a' }] }), { hoje: HOJE }).bloqueios.join(' '), /https/);
  const noAr = boa({ slug: 'no-ar', status: 'publicado' });
  assert.match(pontuar(boa(), { hoje: HOJE, publicadas: [noAr] }).bloqueios.join(' '), /mesma fonte/);
});

test('travessão custa pontos de forma', () => {
  const com = pontuar(boa({ resumo: `${boa().resumo} — sim` }), { hoje: HOJE }).criterios.find((c) => c.id === 'forma');
  const sem = pontuar(boa(), { hoje: HOJE }).criterios.find((c) => c.id === 'forma');
  assert.equal(sem.pontos - com.pontos, 3);
});

test('escolhe os melhores, respeita a nota mínima e varia o tema', () => {
  const outra = (slug, categoria, fontes) => boa({ slug, categoria, fontes: fontes.map((url) => ({ veiculo: 'V', titulo: 'T', url })) });
  const itens = [
    outra('a-brasil', 'brasil', ['https://www.gov.br/a', 'https://um.com/a', 'https://dois.com/a']),
    outra('b-brasil', 'brasil', ['https://www.gov.br/b', 'https://um.com/b', 'https://dois.com/b']),
    outra('c-pesquisa', 'pesquisa', ['https://arxiv.org/c', 'https://um.com/c']),
    fraca(),
  ];
  const { fila, escolhidos } = escolher(itens, { hoje: HOJE });
  assert.deepEqual(fila.map((r) => r.total), [...fila.map((r) => r.total)].sort((a, b) => b - a));
  assert.deepEqual(escolhidos.map((r) => r.item.slug), ['a-brasil', 'c-pesquisa']); // 5 pontos abaixo, mas de outro tema
  assert.equal(fila.find((r) => r.item.slug === 'fraca').apto, false);
  assert.deepEqual(escolher(itens, { hoje: HOJE, excluir: ['a-brasil'] }).escolhidos.map((r) => r.item.slug), ['b-brasil', 'c-pesquisa']);
  assert.equal(escolher([fraca()], { hoje: HOJE }).escolhidos.length, 0);
});

function repositorio(itens) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'harpya-noticias-'));
  fs.mkdirSync(path.join(raiz, 'src/content/noticias'), { recursive: true });
  for (const { slug, ...conteudo } of itens) fs.writeFileSync(path.join(raiz, 'src/content/noticias', `${slug}.json`), JSON.stringify(conteudo, null, 2));
  return raiz;
}
const estado = (raiz, slug) => JSON.parse(fs.readFileSync(path.join(raiz, 'src/content/noticias', `${slug}.json`), 'utf8')).status;
const variada = (n, categoria) => boa({ slug: `n${n}`, categoria, fontes: [{ veiculo: 'G', titulo: 'T', url: `https://www.gov.br/${n}` }, { veiculo: 'U', titulo: 'T', url: `https://um.com/${n}` }] });

test('robô: publica 2 por dia, registra e não repete no mesmo dia', () => {
  const raiz = repositorio([variada(1, 'brasil'), variada(2, 'pesquisa'), variada(3, 'abertos'), variada(4, 'letramento'), fraca()]);
  const primeira = executar({ raiz, hoje: HOJE });
  assert.equal(primeira.escolhidos.length, 2);
  for (const r of primeira.escolhidos) assert.equal(estado(raiz, r.item.slug), 'publicado');
  assert.equal(estado(raiz, 'fraca'), 'rascunho');
  const registro = JSON.parse(fs.readFileSync(path.join(raiz, 'curadoria/noticias/publicacao', `${HOJE}.json`), 'utf8'));
  assert.equal(registro.publicadas.length, 2);
  assert.equal(registro.faltaram, 0);
  assert.ok(registro.publicadas.every((p) => p.nota >= NOTA_MINIMA && p.criterios.fontes > 0));
  assert.equal(executar({ raiz, hoje: HOJE }).escolhidos.length, 0); // meta do dia já cumprida
  assert.equal(executar({ raiz, hoje: '2026-11-15' }).escolhidos.length, 2); // dia seguinte
});

test('robô: não republica o que voltou a rascunho e avisa quando falta', () => {
  const raiz = repositorio([variada(1, 'brasil'), fraca()]);
  const { escolhidos, registro } = executar({ raiz, hoje: HOJE });
  assert.deepEqual(escolhidos.map((r) => r.item.slug), ['n1']);
  assert.equal(registro.faltaram, 1);
  const arquivo = path.join(raiz, 'src/content/noticias/n1.json');
  fs.writeFileSync(arquivo, JSON.stringify({ ...JSON.parse(fs.readFileSync(arquivo, 'utf8')), status: 'rascunho' }));
  assert.equal(executar({ raiz, hoje: '2026-11-15' }).escolhidos.length, 0);
  assert.equal(estado(raiz, 'n1'), 'rascunho');
});

test('robô: simulação não grava nada', () => {
  const raiz = repositorio([variada(1, 'brasil')]);
  assert.equal(executar({ raiz, hoje: HOJE, simular: true }).escolhidos.length, 1);
  assert.equal(estado(raiz, 'n1'), 'rascunho');
  assert.equal(fs.existsSync(path.join(raiz, 'curadoria')), false);
});

test('o dia do robô é o de Fortaleza', () => {
  assert.equal(hojeEmFortaleza(new Date('2026-11-15T02:30:00Z')), '2026-11-14');
  assert.equal(hojeEmFortaleza(new Date('2026-11-15T03:00:00Z')), '2026-11-15');
});

test('página: lê as entradas do GitHub e monta os pedidos de cada ação', () => {
  const { slug, ...conteudo } = boa();
  const [noticia] = lerNoticias([{ type: 'blob', name: 'boa.json', object: { oid: 'abc', text: JSON.stringify(conteudo) } }, { type: 'tree', name: 'pasta' }]);
  assert.equal(noticia.slug, 'boa'); assert.equal(noticia.path, 'src/content/noticias/boa.json'); assert.equal(noticia.sha, 'abc');
  const publicar = pedido('publicar', noticia);
  assert.equal(publicar.method, 'PUT'); assert.equal(publicar.body.sha, 'abc'); assert.equal(publicar.body.branch, 'main');
  const gravado = JSON.parse(Buffer.from(publicar.body.content, 'base64').toString('utf8'));
  assert.deepEqual(gravado, { ...conteudo, status: 'publicado' }); // sem slug, caminho ou SHA; acentos preservados
  assert.equal(JSON.parse(Buffer.from(pedido('recolher', { ...noticia, status: 'publicado' }).body.content, 'base64').toString('utf8')).status, 'rascunho');
  assert.deepEqual(Object.keys(pedido('descartar', noticia).body).sort(), ['branch', 'message', 'sha']);
  assert.throws(() => pedido('publicar', { ...noticia, status: 'publicado' }), /já está/);
  assert.throws(() => pedido('outra', noticia), /inválida/);
  assert.deepEqual(publicadosPeloRobo([{ type: 'blob', name: '2026-11-14.json', object: { text: '{"publicadas":[{"slug":"x"}]}' } }, { type: 'blob', name: 'ruim.json', object: { text: '{' } }]), ['x']);
});
