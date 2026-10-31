import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDrafts, publicationChanges, checkPublicationAccess, publishSelection, githubError } from '../public/admin/publicar/app.js';

const blob = (name, status, oid = name) => ({ name, type: 'blob', object: {
  oid, text: JSON.stringify({ titulo: name, status, resumo: 'Texto revisado', ordem: 4 }),
} });
const drafts = readDrafts([blob('a.json', 'rascunho'), blob('b.json', 'rascunho'), blob('c.json', 'publicado')], 'noticias');

test('lista somente rascunhos de coleções autorizadas', () => {
  assert.equal(drafts.length, 2);
  assert.throws(() => readDrafts([], '../api'), /inválida/);
});
test('publica somente os itens marcados e preserva os outros campos', () => {
  const changes = publicationChanges([drafts[0]], drafts);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, 'src/content/noticias/a.json');
  assert.deepEqual(JSON.parse(changes[0].content), { ...drafts[0].content, status: 'publicado' });
  assert.equal(drafts[0].content.status, 'rascunho');
  assert.equal(drafts[1].content.status, 'rascunho');
});
test('exige seleção e nova revisão quando um item muda, some ou deixa de ser rascunho', () => {
  assert.throws(() => publicationChanges([], drafts), /Marque/);
  assert.throws(() => publicationChanges(drafts, [drafts[0]]), /alterado/);
  assert.throws(() => publicationChanges([drafts[0]], [{ ...drafts[0], oid: 'changed' }]), /alterado/);
  assert.throws(() => publicationChanges([drafts[0]], [{ ...drafts[0], content: { status: 'publicado' } }]), /alterado/);
  assert.throws(() => publicationChanges([drafts[0], drafts[0]], drafts), /alterado/);
});

test('confere gravação com árvore idêntica, sem criar commit ou alterar branch', async () => {
  const calls = [];
  await checkPublicationAccess(async (path, options) => {
    calls.push([path, options]);
    if (path.endsWith('/git/ref/heads/main')) return { object: { sha: 'head' } };
    if (path.endsWith('/git/commits/head')) return { tree: { sha: 'base' } };
    if (path.endsWith('/git/trees/base')) return { tree: [{ path: 'README.md', mode: '100644', type: 'blob', sha: 'existing-blob' }] };
    return { sha: 'base' };
  });
  assert.equal(calls.length, 4);
  assert.deepEqual(JSON.parse(calls[3][1].body), { base_tree: 'base', tree: [{ path: 'README.md', mode: '100644', type: 'blob', sha: 'existing-blob' }] });
  assert.equal(calls[3][1].method, 'POST');
});
test('propaga recusa de gravação antes de oferecer publicação', async () => {
  await assert.rejects(checkPublicationAccess(async path => {
    if (path.endsWith('/git/ref/heads/main')) return { object: { sha: 'head' } };
    if (path.endsWith('/git/commits/head')) return { tree: { sha: 'base' } };
    if (path.endsWith('/git/trees/base')) return { tree: [{ path: 'README.md', mode: '100644', type: 'blob', sha: 'existing-blob' }] };
    throw new Error('Contents: write necessário');
  }), /Contents: write/);
});

function publicationAPI({ conflict = false, changedContent = false, rejection, alwaysConflict = false } = {}) {
  let head = 'head0';
  let number = 0;
  const calls = [];
  const revisions = [];
  const api = async (path, options) => {
    const body = options ? JSON.parse(options.body) : undefined;
    calls.push({ path, body });
    if (path.endsWith('/git/ref/heads/main')) return { object: { sha: head } };
    if (path.includes('/git/commits/')) return { tree: { sha: `tree-${path.split('/').at(-1)}` } };
    if (path.endsWith('/git/trees')) return { sha: `new-tree${number}` };
    if (path.endsWith('/git/commits')) return { sha: `commit${++number}` };
    if (path.endsWith('/git/refs/heads/main')) {
      assert.equal(body.force, false);
      if (rejection) throw githubError(422, { message: rejection });
      if (alwaysConflict || (conflict && number === 1)) {
        head = `head${number}`;
        throw githubError(422, { message: 'Update is not a fast forward' });
      }
      head = body.sha;
      return { object: { sha: head } };
    }
    throw new Error(`Unexpected API call: ${path}`);
  };
  const fetchDrafts = async (_collection, revision) => {
    revisions.push(revision);
    return changedContent && revision !== 'head0' ? [{ ...drafts[0], oid: 'changed' }] : drafts;
  };
  return { api, fetchDrafts, calls, revisions };
}

test('refaz a publicação sobre a versão nova após um avanço concorrente de main', async () => {
  const fixture = publicationAPI({ conflict: true });
  let retries = 0;
  const commit = await publishSelection(fixture.api, fixture.fetchDrafts, 'noticias', [drafts[0]], { onRetry: () => retries++ });
  assert.equal(commit.sha, 'commit2');
  assert.equal(retries, 1);
  assert.deepEqual(fixture.revisions, ['head0', 'head1']);
  const trees = fixture.calls.filter(call => call.path.endsWith('/git/trees'));
  assert.deepEqual(trees.map(call => call.body.base_tree), ['tree-head0', 'tree-head1']);
  assert.ok(trees.every(call => call.body.tree.length === 1 && call.body.tree[0].path === drafts[0].path));
  const commits = fixture.calls.filter(call => call.path.endsWith('/git/commits'));
  assert.deepEqual(commits.map(call => call.body.parents), [['head0'], ['head1']]);
});

test('interrompe se o item selecionado mudar durante a nova tentativa', async () => {
  const fixture = publicationAPI({ conflict: true, changedContent: true });
  await assert.rejects(publishSelection(fixture.api, fixture.fetchDrafts, 'noticias', [drafts[0]]), /alterado/);
  assert.equal(fixture.calls.filter(call => call.path.endsWith('/git/refs/heads/main')).length, 1);
});

test('não repete uma recusa 422 quando main não mudou e mantém a causa do GitHub', async () => {
  const fixture = publicationAPI({ rejection: 'Protected branch update failed' });
  await assert.rejects(publishSelection(fixture.api, fixture.fetchDrafts, 'noticias', [drafts[0]]), /Protected branch update failed/);
  assert.equal(fixture.calls.filter(call => call.path.endsWith('/git/refs/heads/main')).length, 1);
});

test('limita as novas tentativas e nunca força a atualização da branch', async () => {
  const fixture = publicationAPI({ alwaysConflict: true });
  await assert.rejects(publishSelection(fixture.api, fixture.fetchDrafts, 'noticias', [drafts[0]]), /Outras alterações/);
  assert.equal(fixture.calls.filter(call => call.path.endsWith('/git/refs/heads/main')).length, 3);
});
