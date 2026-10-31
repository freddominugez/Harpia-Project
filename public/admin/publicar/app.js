const REPO = '/repos/freddominugez/Harpia-Project';
const COLLECTIONS = new Set(['noticias', 'videos', 'artigos', 'livros', 'fontes', 'linha-do-tempo', 'aprendizado']);

export function readDrafts(entries, collection) {
  if (!COLLECTIONS.has(collection)) throw new Error('Coleção inválida.');
  return entries.filter(entry => entry.type === 'blob' && entry.name.endsWith('.json')).flatMap(entry => {
    const content = JSON.parse(entry.object.text);
    if (content.status !== 'rascunho') return [];
    return [{ path: `src/content/${collection}/${entry.name}`, oid: entry.object.oid, content,
      title: content.titulo || content.nome || entry.name,
      summary: content.resumo || content.descricao || '', url: content.fonte_url || content.url || '' }];
  });
}

export function publicationChanges(selected, current) {
  if (!selected.length) throw new Error('Marque pelo menos um rascunho.');
  const byPath = new Map(current.map(entry => [entry.path, entry]));
  const paths = new Set();
  return selected.map(entry => {
    const fresh = byPath.get(entry.path);
    if (paths.has(entry.path) || !fresh || fresh.oid !== entry.oid || fresh.content.status !== 'rascunho') {
      throw new Error('Um item foi alterado desde sua revisão. Atualize a lista e confira a seleção novamente.');
    }
    paths.add(entry.path);
    return { path: entry.path, mode: '100644', type: 'blob',
      content: `${JSON.stringify({ ...fresh.content, status: 'publicado' }, null, 2)}\n` };
  });
}

// Confere a permissão de gravação sem criar commit nem alterar o conteúdo do site.
// Reenvia uma entrada existente, com o mesmo SHA, para produzir uma árvore idêntica.
export async function checkPublicationAccess(api) {
  const head = await api(`${REPO}/git/ref/heads/main`);
  const parent = await api(`${REPO}/git/commits/${head.object.sha}`);
  const current = await api(`${REPO}/git/trees/${parent.tree.sha}`);
  const entry = current.tree?.find(item => item.type === 'blob');
  if (!entry) throw new Error('Não foi possível verificar a gravação. Nenhum arquivo foi alterado.');
  const { path, mode, type, sha } = entry;
  await api(`${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({
    base_tree: parent.tree.sha, tree: [{ path, mode, type, sha }],
  }) });
}

if (typeof document !== 'undefined') initialize();

function initialize() {
  const $ = id => document.getElementById(id);
  let token = '';
  let entries = [];
  const selection = new Set();
  let busy = false;
  let writeAllowed = false;
  let popup;
  let loginTimer;
  let loadVersion = 0;

  // Reutiliza a sessão já aberta no painel; não grava uma segunda cópia do token.
  try { token = JSON.parse(localStorage.getItem('sveltia-cms.user'))?.token || ''; } catch { /* login manual */ }

  function message(text, error = false) {
    $('message').textContent = text;
    $('message').dataset.error = String(error);
  }

  function controls() {
    $('publish').disabled = busy || !writeAllowed || !selection.size;
    $('publish').textContent = busy ? 'Aguarde…' : `Publicar selecionados${selection.size ? ` (${selection.size})` : ''}`;
    $('count').textContent = `${selection.size} selecionado${selection.size === 1 ? '' : 's'}`;
    $('all').disabled = busy || !entries.length;
    $('all').checked = !!entries.length && selection.size === entries.length;
    $('all').indeterminate = selection.size > 0 && selection.size < entries.length;
    $('collection').disabled = busy;
    $('reload').disabled = busy || !token;
    document.querySelectorAll('#entries input').forEach(input => { input.disabled = busy; });
    document.body.setAttribute('aria-busy', String(busy));
  }

  async function api(path, options = {}) {
    const response = await fetch(`https://api.github.com${path}`, {
      ...options, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) {
      if (response.status === 401) { token = ''; $('login').hidden = false; }
      const data = await response.json().catch(() => ({}));
      if (response.status === 403 && data.message === 'Resource not accessible by personal access token' && options.method === 'POST' && path.endsWith('/git/trees')) {
        writeAllowed = false;
        $('permission-help').hidden = false;
        throw new Error('O token do painel permite leitura, mas não tem permissão para publicar. No GitHub, ajuste Contents para Read and write e clique em Atualizar lista.');
      }
      const advice = response.status === 401 ? 'Entre novamente para continuar.' :
        response.status === 409 || response.status === 422 ? 'O conteúdo mudou ou a publicação não foi permitida. Atualize a lista e tente novamente.' :
        'Não foi possível acessar o repositório. Verifique sua conexão e a permissão de publicação.';
      throw new Error(advice);
    }
    return response.json();
  }

  async function fetchDrafts(collection, revision = 'main') {
    const result = await api('/graphql', { method: 'POST', body: JSON.stringify({
      query: 'query($expression:String!){repository(owner:"freddominugez",name:"Harpia-Project"){object(expression:$expression){... on Tree{entries{name type object{... on Blob{text oid}}}}}}}',
      variables: { expression: `${revision}:src/content/${collection}` },
    }) });
    const files = result.data?.repository?.object?.entries;
    if (result.errors || !files) throw new Error('Não foi possível carregar os rascunhos. Atualize a lista.');
    return readDrafts(files, collection);
  }

  function render() {
    $('entries').replaceChildren();
    for (const entry of entries) {
      const row = document.createElement('div'); row.className = 'entry';
      const label = document.createElement('label'); label.className = 'entry'; label.style.cssText = 'border:0;padding:0;flex:1';
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = entry.path;
      checkbox.addEventListener('change', () => { checkbox.checked ? selection.add(entry.path) : selection.delete(entry.path); controls(); });
      const text = document.createElement('span'); text.textContent = entry.title;
      const summary = document.createElement('span'); summary.className = 'summary'; summary.textContent = entry.summary;
      const detail = document.createElement('small'); detail.textContent = 'Rascunho';
      text.append(summary, detail); label.append(checkbox, text); row.append(label);
      if (/^https?:\/\//i.test(entry.url)) {
        const link = document.createElement('a'); link.href = entry.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'Ver fonte'; link.setAttribute('aria-label', `Ver fonte: ${entry.title}`); row.append(link);
      }
      $('entries').append(row);
    }
    controls();
  }

  async function load() {
    if (!token || busy) return;
    const version = ++loadVersion;
    selection.clear(); entries = []; writeAllowed = false; $('permission-help').hidden = true; render();
    busy = true; controls(); message('Carregando rascunhos…');
    try {
      const drafts = await fetchDrafts($('collection').value);
      if (version !== loadVersion) return;
      entries = drafts; render();
      message('Verificando permissão de publicação…');
      await checkPublicationAccess(api);
      writeAllowed = true;
      message(entries.length ? `${entries.length} rascunhos disponíveis. Marque os itens que deseja publicar.` : 'Nenhum rascunho nesta coleção.');
    } catch (error) { message(error.message, true); }
    finally { busy = false; controls(); }
  }

  $('login').addEventListener('click', () => {
    popup = window.open('/auth/?provider=github', 'harpya-publicar-login', 'width=520,height=650');
    if (!popup) return message('Permita a janela de login no navegador e tente novamente.', true);
    $('login').disabled = true;
    clearInterval(loginTimer);
    loginTimer = setInterval(() => {
      if (popup.closed) { clearInterval(loginTimer); $('login').disabled = false; }
    }, 500);
  });
  window.addEventListener('message', async event => {
    if (!popup || event.source !== popup || event.origin !== window.location.origin) return;
    if (event.data === 'authorizing:github') { popup.postMessage('authorizing:github', event.origin); return; }
    if (typeof event.data !== 'string' || !event.data.startsWith('authorization:github:')) return;
    try {
      if (!event.data.startsWith('authorization:github:success:')) throw new Error('Não foi possível entrar. Tente novamente.');
      const data = JSON.parse(event.data.slice('authorization:github:success:'.length));
      if (typeof data.token !== 'string' || !data.token) throw new Error('Login inválido.');
      token = data.token; popup.close(); clearInterval(loginTimer); $('login').disabled = false; $('login').hidden = true;
      await load();
    } catch (error) { message(error.message, true); }
  });
  $('collection').addEventListener('change', load);
  $('reload').addEventListener('click', load);
  $('all').addEventListener('change', () => {
    selection.clear();
    if ($('all').checked) entries.forEach(entry => selection.add(entry.path));
    document.querySelectorAll('#entries input').forEach(input => { input.checked = selection.has(input.value); });
    controls();
  });
  $('publish').addEventListener('click', () => {
    if (busy || !writeAllowed || !selection.size) return;
    $('confirmation-items').replaceChildren(...entries.filter(entry => selection.has(entry.path)).map(entry => {
      const item = document.createElement('li'); item.textContent = entry.title; return item;
    }));
    $('confirmation').showModal();
  });
  $('cancel').addEventListener('click', () => $('confirmation').close());
  $('confirm').addEventListener('click', async () => {
    if (busy || !writeAllowed || !selection.size) return;
    $('confirmation').close(); busy = true; controls(); message('Publicando os itens selecionados…');
    let committed = false;
    try {
      const selected = entries.filter(entry => selection.has(entry.path));
      const head = await api(`${REPO}/git/ref/heads/main`);
      const revision = head.object.sha;
      const current = await fetchDrafts($('collection').value, revision);
      const changes = publicationChanges(selected, current);
      const parent = await api(`${REPO}/git/commits/${revision}`);
      const tree = await api(`${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree: changes }) });
      const commit = await api(`${REPO}/git/commits`, { method: 'POST', body: JSON.stringify({
        message: `Painel: publica ${selected.length} itens de ${$('collection').selectedOptions[0].textContent}`,
        tree: tree.sha, parents: [revision],
      }) });
      await api(`${REPO}/git/refs/heads/main`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
      committed = true;
      entries = entries.filter(entry => !selection.has(entry.path)); selection.clear(); render();
      message(`${selected.length} itens enviados para publicação. O site será atualizado quando a hospedagem concluir o processamento.`);
    } catch (error) {
      message(committed ? 'Os itens foram enviados. Atualize a lista para conferir.' : `${error.message} A publicação não foi confirmada. Atualize a lista antes de tentar novamente.`, true);
    } finally { busy = false; controls(); }
  });
  controls();
  if (token) load();
  else { $('login').hidden = false; message('Entre para carregar os rascunhos e publicar.'); }
}
