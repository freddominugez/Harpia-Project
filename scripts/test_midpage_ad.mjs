import { test } from 'node:test';
import assert from 'node:assert/strict';
import { midpageOffset } from '../src/lib/midpage-ad.mjs';

test('insere no meio de um artigo, sem separar título e parágrafo', () => {
  const html = '<article class="prose"><h1>Título</h1>' +
    '<p>Primeiro parágrafo com conteúdo de introdução.</p>'.repeat(4) +
    '<h2>Outra seção</h2><p>Segundo parágrafo com conteúdo de continuação.</p>'.repeat(4) + '</article>';
  const offset = midpageOffset(html);
  assert.ok(offset > html.length * .25 && offset < html.length * .8);
  assert.ok(!/<h[1-6]>[^<]*<\/h[1-6]>$/.test(html.slice(0, offset)));
  assert.ok(/^<(p|h2)>/.test(html.slice(offset)));
});

test('não entra em tabelas, figuras SVG, links, scripts ou grades de cards', () => {
  const atomic = [
    '<table><tbody><tr><td>Conteúdo muito longo com dados.</td></tr></tbody></table>',
    '<figure><svg><text>Dados ilustrados</text></svg><figcaption>Legenda</figcaption></figure>',
    '<a href="https://example.com"><div class="prose"><p>Primeira parte</p><p>Segunda parte</p></div></a>',
    '<div class="g3"><article class="card"><h2>Card</h2><p>Resumo</p></article></div>',
    '<script>const template = "<p>Texto dentro de código</p>";</script>',
  ];
  for (const block of atomic) {
    const start = '<article class="prose"><p>Introdução</p>';
    const html = start + block + '<p>Continuação com mais texto.</p></article>';
    const offset = midpageOffset(html);
    assert.ok(offset <= start.length || offset >= start.length + block.length, block);
  }
});

test('arquivo oculto de notícias não recebe o banner nem altera o ponto da leitura', () => {
  const visible = '<div class="home-editorial"><section><p>Abertura da página.</p></section><section><p>Notícias recentes.</p></section><section><p>Leituras e referências.</p></section></div>';
  const archive = '<section hidden><div class="prose">' + '<p>Arquivo antigo</p>'.repeat(100) + '</div></section>';
  const html = archive + visible;
  assert.equal(midpageOffset(html), archive.length + midpageOffset(visible));
});

test('texto em português, emoji e HTML de um único bloco permanecem íntegros', () => {
  const html = '<div class="prose"><p>Eletrônica 🦅: chips, ciência e IA.</p><p>Mais leituras sobre inteligência artificial.</p></div>';
  assert.equal(html.slice(midpageOffset(html)), '<p>Mais leituras sobre inteligência artificial.</p></div>');
  const single = '<section><h1>Página curta</h1></section>';
  assert.equal(midpageOffset(single), single.length);
});
