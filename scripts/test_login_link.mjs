// Login do painel por link enviado por e-mail (api/_oauth.js, modo 1b).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const AMBIENTE = {
  HARPYA_AUTH_URL: 'https://auth.exemplo.test/',
  HARPYA_AUTH_KEY: 'chave-publica',
  ADMIN_MAGIC_EMAILS: 'Dona@Exemplo.org, outro@exemplo.org',
  GITHUB_CMS_TOKEN: 'token-do-painel',
};
for (const chave of ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']) delete process.env[chave];
Object.assign(process.env, AMBIENTE);

const { iniciar, concluir, emailAutorizado } = await import('../api/_oauth.js');

function resposta() {
  return {
    status: 0, cabecalhos: {}, corpo: '',
    writeHead(status, cabecalhos) { this.status = status; this.cabecalhos = cabecalhos; },
    end(corpo = '') { this.corpo = corpo; },
  };
}

const pedido = (email, extra = {}) => ({
  method: 'POST', url: '/api/auth?provider=github',
  headers: { origin: 'https://www.harpya.org' }, body: { modo: 'link', email }, ...extra,
});

/** Troca o fetch global e devolve a lista de chamadas feitas. */
function simular(responder) {
  const chamadas = [];
  globalThis.fetch = async (url, opcoes) => {
    const chamada = { url: String(url), headers: opcoes.headers, corpo: JSON.parse(opcoes.body) };
    chamadas.push(chamada);
    const { status = 200, dados = {} } = responder(chamada) ?? {};
    return { ok: status < 400, status, json: async () => dados };
  };
  return chamadas;
}

test('lista de e-mails ignora maiúsculas e espaços', () => {
  assert.equal(emailAutorizado(' dona@exemplo.org '), true);
  assert.equal(emailAutorizado('OUTRO@exemplo.org'), true);
  assert.equal(emailAutorizado('intruso@exemplo.org'), false);
  assert.equal(emailAutorizado(''), false);
  assert.equal(emailAutorizado('dona@exemplo.org', ''), false);
});

test('a tela de entrada oferece o link', async () => {
  const res = resposta();
  await iniciar({ method: 'GET', url: '/api/auth?provider=github', headers: {} }, res);
  assert.equal(res.status, 200);
  assert.match(res.corpo, /name="modo" value="link"/);
  assert.doesNotMatch(res.corpo, /name="senha"/);
});

test('e-mail autorizado: pede o link ao Supabase com PKCE e guarda o verificador', async () => {
  const chamadas = simular(() => ({}));
  const res = resposta();
  await iniciar(pedido('DONA@exemplo.org'), res);
  assert.equal(chamadas.length, 1);
  const [{ url, headers, corpo }] = chamadas;
  assert.equal(url, 'https://auth.exemplo.test/auth/v1/otp?redirect_to=https%3A%2F%2Fwww.harpya.org%2Fcallback%2F');
  assert.equal(headers.apikey, 'chave-publica');
  assert.equal(corpo.email, 'dona@exemplo.org');
  assert.equal(corpo.create_user, false);
  const verificador = res.cabecalhos['Set-Cookie'].match(/^harpya-link=([A-Za-z0-9_-]{43});/)[1];
  assert.match(res.cabecalhos['Set-Cookie'], /HttpOnly;.*SameSite=Lax; Secure$/);
  assert.equal(corpo.code_challenge, createHash('sha256').update(verificador).digest('base64url'));
  assert.equal(res.status, 200);
  assert.doesNotMatch(res.corpo, /token-do-painel/);
});

test('e-mail fora da lista: mesma tela, nenhum e-mail enviado', async () => {
  const chamadas = simular(() => ({}));
  const res = resposta();
  await iniciar(pedido('intruso@exemplo.org'), res);
  assert.equal(chamadas.length, 0);
  assert.equal(res.status, 200);
  assert.match(res.corpo, /intruso@exemplo\.org/);
  assert.doesNotMatch(res.corpo, /token-do-painel/);
});

test('pedido vindo de outro site é recusado', async () => {
  const chamadas = simular(() => ({}));
  const res = resposta();
  await iniciar(pedido('dona@exemplo.org', { headers: { origin: 'https://malicioso.test' } }), res);
  assert.equal(res.status, 403);
  assert.equal(chamadas.length, 0);
});

test('limite de envio do Supabase vira aviso', async () => {
  simular(() => ({ status: 429 }));
  const res = resposta();
  await iniciar(pedido('dona@exemplo.org'), res);
  assert.equal(res.status, 429);
  assert.match(res.corpo, /Aguarde um minuto/);
});

const VERIFICADOR = 'v'.repeat(43);
const volta = (consulta, cookie = `harpya-link=${VERIFICADOR}`) => ({
  method: 'GET', url: `/api/callback?${consulta}`, headers: cookie ? { cookie } : {},
});

test('clique no link: confere o código, encerra a sessão e entrega o token', async () => {
  const chamadas = simular(({ url }) => url.includes('/token') ? { dados: { access_token: 'sessao', user: { email: 'Dona@exemplo.org' } } } : {});
  const res = resposta();
  await concluir(volta('code=abc123'), res);
  assert.equal(chamadas[0].url, 'https://auth.exemplo.test/auth/v1/token?grant_type=pkce');
  assert.deepEqual(chamadas[0].corpo, { auth_code: 'abc123', code_verifier: VERIFICADOR });
  assert.equal(chamadas[1].url, 'https://auth.exemplo.test/auth/v1/logout?scope=local');
  assert.equal(chamadas[1].headers.Authorization, 'Bearer sessao');
  assert.equal(res.status, 200);
  assert.match(res.corpo, /"token-do-painel"/);
  assert.match(res.cabecalhos['Set-Cookie'], /^harpya-link=; HttpOnly; Max-Age=0/);
  const nonce = res.cabecalhos['Content-Security-Policy'].match(/script-src 'nonce-([^']+)'/)[1];
  assert.ok(res.corpo.includes(`<script nonce="${nonce}">`));
});

test('conta válida no Supabase, mas fora da lista: sem token', async () => {
  simular(({ url }) => url.includes('/token') ? { dados: { access_token: 'sessao', user: { email: 'intruso@exemplo.org' } } } : {});
  const res = resposta();
  await concluir(volta('code=abc123'), res);
  assert.equal(res.status, 403);
  assert.doesNotMatch(res.corpo, /token-do-painel/);
});

test('link aberto em outro navegador (sem verificador): sem token e sem consulta', async () => {
  const chamadas = simular(() => ({}));
  const res = resposta();
  await concluir(volta('code=abc123', ''), res);
  assert.equal(res.status, 400);
  assert.equal(chamadas.length, 0);
  assert.match(res.corpo, /mesmo navegador/);
  assert.doesNotMatch(res.corpo, /token-do-painel/);
});

test('código recusado ou link expirado: sem token', async () => {
  simular(() => ({ status: 400, dados: { error_code: 'flow_state_not_found' } }));
  let res = resposta();
  await concluir(volta('code=usado'), res);
  assert.equal(res.status, 400);
  assert.doesNotMatch(res.corpo, /token-do-painel/);
  res = resposta();
  await concluir(volta('error=access_denied&error_code=otp_expired'), res);
  assert.equal(res.status, 400);
  assert.match(res.corpo, /expirou/);
  assert.doesNotMatch(res.corpo, /token-do-painel/);
});
