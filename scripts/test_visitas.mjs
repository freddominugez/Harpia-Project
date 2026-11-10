import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/visitas.js';

const id = '5b741d95-3f6b-4c83-8b2b-ec7e6cced456';
process.env.HARPYA_STATS_URL = 'https://test.supabase.co';
process.env.HARPYA_STATS_KEY = 'publishable-test';
process.env.HARPYA_STATS_SECRET = 'server-only-test-secret';
async function invoke(req, fetcher) {
  const original = globalThis.fetch;
  globalThis.fetch = fetcher;
  const result = {};
  try { await handler(req, { writeHead: (status, headers) => Object.assign(result, { status, headers }), end: text => { result.body = JSON.parse(text); } }); }
  finally { globalThis.fetch = original; }
  return result;
}
const request = { method: 'POST', headers: { origin: 'https://www.harpya.org', 'user-agent': 'Mozilla/5.0', 'x-forwarded-for': '192.0.2.1' }, body: { event_id: id } };
test('registra o evento sem repassar IP em texto e sem expor a chave na resposta', async () => {
  const response = await invoke(request, async (url, options) => {
    assert.ok(url.endsWith('/harpya_views_record'));
    const body = JSON.parse(options.body);
    assert.equal(body.p_event_id, id);
    assert.match(body.p_rate_key, /^[0-9a-f]{64}$/);
    assert.ok(!options.body.includes('192.0.2.1'));
    return { ok: true, json: async () => ({ views: 5, started_on: '2026-10-31' }) };
  });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { views: 5, started_on: '2026-10-31' });
  assert.equal(response.headers['Cache-Control'], 'no-store');
});
test('rejeita origem externa antes de acessar o banco', async () => {
  const response = await invoke({ ...request, headers: { ...request.headers, origin: 'https://evil.example' } }, () => assert.fail('No database request expected'));
  assert.equal(response.status, 403);
});
test('robôs identificáveis leem o total sem incrementar', async () => {
  const response = await invoke({ ...request, headers: { ...request.headers, 'user-agent': 'Googlebot' } }, async url => {
    assert.ok(url.endsWith('/harpya_views_read'));
    return { ok: true, json: async () => ({ views: 4, started_on: '2026-10-31' }) };
  });
  assert.equal(response.body.views, 4);
});
test('erro do banco não é transformado em contagem inventada', async () => {
  const response = await invoke({ method: 'GET', headers: {} }, async () => ({ ok: false }));
  assert.equal(response.status, 503);
  assert.equal(response.body.views, undefined);
});
test('evento inválido não chega ao banco', async () => {
  const response = await invoke({ ...request, body: { event_id: 'invalid' } }, () => assert.fail('No database request expected'));
  assert.equal(response.status, 400);
});
