import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDrafts, publicationChanges } from '../public/admin/publicar/app.js';

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
