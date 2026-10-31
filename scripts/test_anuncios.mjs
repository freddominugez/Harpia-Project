import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAd, saveAd } from '../public/admin/anuncios/model.js';
const data = { titulo: 'Apoie a pesquisa', anunciante: 'Parceiro', texto: 'Exemplo de anúncio', imagem: '', imagem_alt: '', url: 'https://example.com', status: 'publicado' };
test('bloqueia links executáveis e publicação incompleta', () => {
  assert.throws(() => validateAd({ ...data, url: 'javascript:alert(1)' }), /https/);
  assert.throws(() => validateAd({ ...data, imagem: 'data:image/svg+xml,<svg/>' }), /imagem/);
  assert.throws(() => validateAd({ ...data, anunciante: '' }), /Preencha/);
  assert.throws(() => validateAd({ ...data, imagem: 'https://example.com/image.png', imagem_alt: '' }), /descrição/);
  assert.equal(validateAd({ ...data, imagem: 'https://example.com/image.png', imagem_alt: 'Descrição' }).status, 'publicado');
});
function fixture({ conflict = false, changed = false } = {}) {
  const calls = []; let attempt = 0, head = 'head1';
  return { calls, api: async (path, options) => {
    const body = options ? JSON.parse(options.body) : undefined; calls.push({ path, body });
    if (path.includes('/git/ref/heads/')) return { object: { sha: head } };
    if (path.includes('/contents/')) return { sha: path.includes('ref=commit') ? 'saved-blob' : changed ? 'someone-else' : 'original-blob' };
    if (path.endsWith('/git/blobs')) return { sha: 'image-blob' };
    if (path.includes('/git/commits/')) return { tree: { sha: `tree-${head}` } };
    if (path.endsWith('/git/trees')) return { sha: 'new-tree' };
    if (path.endsWith('/git/commits')) return { sha: `commit${++attempt}` };
    if (path.includes('/git/refs/heads/')) {
      assert.equal(body.force, false);
      if (conflict && attempt === 1) { head = 'head2'; throw Object.assign(new Error('Conflict'), { status: 422 }); }
      return {};
    }
    throw new Error(path);
  } };
}
test('imagem e anúncio são enviados em um único commit sem forçar main', async () => {
  const { api, calls } = fixture();
  const result = await saveAd(api, 'topo', { ...data, imagem_alt: 'Banner' }, 'original-blob', { extension: 'png', base64: 'aGVsbG8=' });
  const tree = calls.find(call => call.path.endsWith('/git/trees')).body.tree;
  assert.equal(tree.length, 2);
  assert.equal(tree[0].path, 'src/content/anuncios/topo.json');
  assert.equal(JSON.parse(tree[0].content).imagem, result.data.imagem);
  assert.equal(tree[1].sha, 'image-blob');
  assert.equal(tree[1].path, `public${result.data.imagem}`);
  assert.equal(result.sha, 'saved-blob');
});
test('não sobrescreve anúncio alterado em outra janela', async () => {
  const { api, calls } = fixture({ changed: true });
  await assert.rejects(saveAd(api, 'topo', data, 'original-blob'), /outra janela/);
  assert.ok(calls.every(call => !call.body));
});
test('refaz somente sobre avanço concorrente preservando os arquivos novos', async () => {
  const { api, calls } = fixture({ conflict: true });
  await saveAd(api, 'lateral-direita', data, 'original-blob');
  assert.deepEqual(calls.filter(call => call.path.endsWith('/git/trees')).map(call => call.body.base_tree), ['tree-head1', 'tree-head2']);
});
test('rascunho retira anúncio sem apagar o arquivo nem criar outra posição', async () => {
  const { api, calls } = fixture();
  await saveAd(api, 'lateral-esquerda', { ...data, status: 'rascunho' }, 'original-blob');
  const files = calls.find(call => call.path.endsWith('/git/trees')).body.tree;
  assert.equal(files.length, 1);
  assert.equal(JSON.parse(files[0].content).status, 'rascunho');
  await assert.rejects(saveAd(api, '../api', data, 'original-blob'), /inválida/);
});
