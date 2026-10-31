import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDrafts, publicationChanges, checkPublicationAccess } from '../public/admin/publicar/app.js';

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
