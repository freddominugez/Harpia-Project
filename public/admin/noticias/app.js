// Página /admin/noticias/: fila de rascunhos ordenada pela nota de qualidade, com leitura
// completa, publicação, volta a rascunho e descarte. Cada ação é um commit em main.
import { createGitHubClient } from '../session.js';
import { escolher, pontuar, NOTA_MINIMA, POR_DIA } from './score.js';

const REPO = '/repos/freddominugez/Harpia-Project';
const PASTA = 'src/content/noticias';
const TEMAS = { letramento: 'Letramento em IA', brasil: 'Brasil e regulação', abertos: 'Código e modelos abertos', pesquisa: 'Pesquisa e fronteira' };

/** Dia corrente em Fortaleza (UTC-3), o mesmo relógio do robô. */
export const hojeEmFortaleza = (agora = new Date()) => new Date(agora.getTime() - 3 * 3600000).toISOString().slice(0, 10);

/** Lê as entradas do GitHub (GraphQL) como notícias com slug, caminho e SHA. */
export function lerNoticias(entries) {
  return entries.filter((e) => e.type === 'blob' && e.name.endsWith('.json')).map((e) => ({
    slug: e.name.slice(0, -5), path: `${PASTA}/${e.name}`, sha: e.object.oid, ...JSON.parse(e.object.text),
  }));
}

/** Slugs que o robô já publicou (registros em curadoria/noticias/publicacao). */
export function publicadosPeloRobo(entries) {
  return entries.filter((e) => e.type === 'blob' && e.name.endsWith('.json'))
    .flatMap((e) => { try { return JSON.parse(e.object.text).publicadas.map((p) => p.slug); } catch { return []; } });
}

const base64 = (texto) => { let b = ''; for (const byte of new TextEncoder().encode(texto)) b += String.fromCharCode(byte); return btoa(b); };

/** Corpo do pedido à API de conteúdo do GitHub para cada ação. O SHA impede gravar sobre uma versão que mudou. */
export function pedido(acao, noticia) {
  const { slug, path, sha, ...conteudo } = noticia;
  if (acao === 'descartar') return { method: 'DELETE', body: { message: `Painel: descarta noticias ${slug}`, sha, branch: 'main' } };
  const status = acao === 'publicar' ? 'publicado' : acao === 'recolher' ? 'rascunho' : null;
  if (!status) throw new Error('Ação inválida.');
  if (conteudo.status === status) throw new Error('A notícia já está nesse estado. Atualize a lista.');
  return { method: 'PUT', body: {
    message: `Painel: ${acao === 'publicar' ? 'publica' : 'volta a rascunho'} noticias ${slug}`, sha, branch: 'main',
    content: base64(`${JSON.stringify({ ...conteudo, status }, null, 2)}\n`),
  } };
}

if (typeof document !== 'undefined') iniciar();

function iniciar() {
  const $ = (id) => document.getElementById(id);
  const novo = (tag, props = {}, ...filhos) => { const el = Object.assign(document.createElement(tag), props); el.append(...filhos); return el; };
  const github = createGitHubClient();
  let noticias = [];
  let doRobo = [];
  let aba = 'fila';
  let ocupado = false;
  let pendente = null;
  $('meta').textContent = POR_DIA; $('minimo').textContent = NOTA_MINIMA;

  const mensagem = (texto, erro = false) => { $('message').textContent = texto; $('message').dataset.error = String(erro); };
  const travar = (valor) => { ocupado = valor; document.body.setAttribute('aria-busy', String(valor)); document.querySelectorAll('#lista button, #reload').forEach((b) => { b.disabled = valor; }); };

  async function pasta(expressao) {
    const r = await github.api('/graphql', { method: 'POST', body: JSON.stringify({
      query: 'query($e:String!){repository(owner:"freddominugez",name:"Harpia-Project"){object(expression:$e){... on Tree{entries{name type object{... on Blob{text oid}}}}}}}',
      variables: { e: expressao },
    }) });
    if (r.errors) throw new Error('Não foi possível carregar as notícias. Clique em Atualizar.');
    return r.data?.repository?.object?.entries ?? [];
  }

  async function carregar() {
    if (ocupado) return;
    travar(true); mensagem('Carregando notícias…');
    try {
      const [arquivos, registros] = await Promise.all([pasta(`main:${PASTA}`), pasta('main:curadoria/noticias/publicacao')]);
      noticias = lerNoticias(arquivos); doRobo = publicadosPeloRobo(registros);
      $('login').hidden = true; $('resumo').hidden = false; $('tabs').hidden = false;
      mensagem(''); desenhar();
    } catch (erro) {
      if (erro.status === 401) $('login').hidden = false;
      mensagem(erro.message, true);
    } finally { travar(false); }
  }

  function cartao(noticia, nota, { proxima = false, apto = false } = {}) {
    const nivel = nota.bloqueios.length ? 'baixa' : nota.total >= 75 ? 'alta' : nota.total >= NOTA_MINIMA ? 'media' : 'baixa';
    const publicada = noticia.status === 'publicado';
    const selos = [novo('span', { className: 'selo', textContent: TEMAS[noticia.categoria] ?? noticia.categoria }), novo('span', { textContent: `Fato de ${noticia.data.split('-').reverse().join('/')}` })];
    if (proxima) selos.push(novo('span', { className: 'selo robo', textContent: 'O robô publica na próxima rodada' }));
    if (!publicada && doRobo.includes(noticia.slug)) selos.push(novo('span', { className: 'selo', textContent: 'Voltou a rascunho: o robô não republica' }));
    for (const b of nota.bloqueios) selos.push(novo('span', { className: 'selo bloqueio', textContent: b }));
    if (!publicada && !nota.bloqueios.length && !apto && nota.total < NOTA_MINIMA) selos.push(novo('span', { className: 'selo bloqueio', textContent: `Abaixo da nota ${NOTA_MINIMA}: só sai se você publicar` }));

    const criterios = novo('ul', { className: 'criterios' }, ...nota.criterios.map((c) => {
      const barra = novo('i', {}, Object.assign(novo('u'), { style: `width:${Math.round(100 * c.pontos / c.max)}%` }));
      return novo('li', {}, novo('span', {}, novo('b', { textContent: c.nome }), `${c.pontos}/${c.max}`), barra, novo('em', { textContent: c.nota }));
    }));
    const fontes = novo('ul', {}, ...noticia.fontes.map((f) => novo('li', {}, `${f.veiculo}: `, novo('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer', textContent: f.titulo }))));
    const texto = novo('details', {}, novo('summary', { textContent: 'Ler a notícia e conferir as fontes' }), novo('div', { className: 'texto' },
      ...noticia.corpo.map((p) => novo('p', { textContent: p })), novo('p', { className: 'harpia' }, novo('strong', { textContent: 'Por que importa: ' }), noticia.harpia), fontes));

    const acoes = novo('div', { className: 'acoes' });
    const botao = (rotulo, acao, classe = '') => { const b = novo('button', { textContent: rotulo, className: classe }); b.addEventListener('click', () => confirmar(acao, noticia)); acoes.append(b); };
    if (publicada) { botao('Voltar para rascunho', 'recolher'); acoes.append(novo('a', { href: `/noticias/${noticia.slug}/`, target: '_blank', rel: 'noopener', textContent: 'Ver no site ↗' })); }
    else { botao('Publicar agora', 'publicar', 'primary'); botao('Descartar', 'descartar', 'danger'); }
    acoes.append(novo('a', { href: `/admin/#/collections/noticias/entries/${noticia.slug}`, target: '_top', textContent: 'Editar texto no CMS' }));

    return novo('article', { className: `item${proxima ? ' proxima' : ''}` },
      novo('div', { className: 'nota' }, novo('b', { textContent: nota.total }), novo('small', { textContent: 'de 100' })),
      novo('div', {}, novo('div', { className: 'meta' }, ...selos), novo('h2', { textContent: noticia.titulo }), novo('p', { className: 'resumo', textContent: noticia.resumo }), criterios, texto, acoes));
  }

  function desenhar() {
    const hoje = hojeEmFortaleza();
    const { fila, escolhidos } = escolher(noticias, { hoje, excluir: doRobo });
    const publicadas = noticias.filter((n) => n.status === 'publicado').sort((a, b) => b.data.localeCompare(a.data));
    const aptos = fila.filter((r) => r.apto).length;
    $('n-aptos').textContent = aptos; $('n-dias').textContent = Math.floor(aptos / POR_DIA);
    $('n-fora').textContent = fila.length - aptos; $('n-ar').textContent = publicadas.length;
    $('n-aptos').parentElement.dataset.alerta = String(aptos < POR_DIA * 2);
    document.querySelectorAll('#tabs [data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === aba)));
    const proximas = new Set(escolhidos.map((r) => r.item.slug));
    const itens = aba === 'fila'
      ? fila.map((r) => cartao(r.item, r, { proxima: proximas.has(r.item.slug), apto: r.apto }))
      : publicadas.map((n) => cartao(n, pontuar(n, { hoje, publicadas: publicadas.filter((p) => p !== n) })));
    $('lista').replaceChildren(...(itens.length ? itens : [novo('p', { className: 'vazio', textContent: aba === 'fila' ? 'Nenhum rascunho na fila. O robô não terá o que publicar até a curadoria gravar novos.' : 'Nenhuma notícia no ar.' })]));
    if (aba === 'fila' && aptos < POR_DIA * 2) mensagem(`Fila curta: ${aptos} rascunho${aptos === 1 ? '' : 's'} apto${aptos === 1 ? '' : 's'} para uma meta de ${POR_DIA} por dia.`, true);
  }

  const TEXTOS = {
    publicar: ['Publicar esta notícia agora?', 'Ela entra no site assim que a hospedagem processar o commit, em cerca de um minuto.', 'Publicar'],
    recolher: ['Voltar esta notícia para rascunho?', 'Ela sai do site, do RSS e da busca. O robô não volta a publicá-la sozinho.', 'Voltar para rascunho'],
    descartar: ['Descartar esta notícia?', 'O arquivo é apagado do repositório. A fonte continua no registro da curadoria, então o tema não volta a ser proposto.', 'Descartar'],
  };
  function confirmar(acao, noticia) {
    if (ocupado) return;
    pendente = { acao, noticia };
    const [titulo, texto, rotulo] = TEXTOS[acao];
    $('confirmation-title').textContent = titulo;
    $('confirmation-text').replaceChildren(novo('strong', { textContent: noticia.titulo }), novo('br'), texto);
    $('confirm').textContent = rotulo;
    $('confirmation').showModal();
  }

  $('cancel').addEventListener('click', () => $('confirmation').close());
  $('confirm').addEventListener('click', async () => {
    if (!pendente || ocupado) return;
    const { acao, noticia } = pendente; pendente = null; $('confirmation').close();
    travar(true); mensagem('Gravando…');
    try {
      const { method, body } = pedido(acao, noticia);
      await github.api(`${REPO}/contents/${noticia.path}`, { method, body: JSON.stringify(body) });
      travar(false); await carregar();
      mensagem({ publicar: 'Publicada. O site atualiza em cerca de um minuto.', recolher: 'Voltou para rascunho. O site atualiza em cerca de um minuto.', descartar: 'Descartada.' }[acao]);
    } catch (erro) {
      travar(false);
      if (erro.status === 401) $('login').hidden = false;
      mensagem(erro.status === 409 ? 'A notícia mudou desde que a lista foi carregada. Clique em Atualizar e confira de novo.' : erro.message, true);
    }
  });
  $('tabs').addEventListener('click', (evento) => { const b = evento.target.closest('[data-tab]'); if (b) { aba = b.dataset.tab; desenhar(); } });
  $('reload').addEventListener('click', carregar);
  $('login').addEventListener('click', async () => { try { await github.login(); await carregar(); } catch (erro) { mensagem(erro.message, true); } });

  if (github.hasToken()) carregar();
  else { $('login').hidden = false; mensagem('Entre para ver a fila de notícias.'); }
}
