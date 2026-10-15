// Autenticação do painel /admin.
// Modo 1 (preferido quando configurado): tela própria de e-mail e senha em /auth. A senha é
// conferida contra um hash scrypt guardado na Vercel e, se bater, o painel recebe o token do
// GitHub guardado no servidor. Variáveis: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, GITHUB_CMS_TOKEN.
// Modo 2: "Sign In with GitHub" pelo OAuth App, descrito abaixo.
// O Sveltia CMS abre uma janela em /auth; aqui ela vai ao GitHub, volta em /callback,
// troca o código por um token e entrega o token à janela do painel por postMessage.
// Mesmo protocolo do sveltia-cms-auth (MIT, github.com/sveltia/sveltia-cms-auth),
// adaptado para funções da Vercel. Segredos só em variáveis de ambiente:
//   GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET (OAuth App do GitHub, ver docs/PAINEL_ADMIN.md).
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// O token só é entregue a uma página servida por um destes endereços.
const ORIGENS = ["https://www.harpya.org", "https://harpya.org", "http://localhost:4321"];
// Escopos que o painel pode pedir; repositório público pede só "public_repo".
const ESCOPOS = ["public_repo", "repo", "user", "read:user", "user:email"];
const PADRAO = "public_repo";

const escopo = (pedido) => {
  const lista = String(pedido ?? "").split(/[\s,]+/).filter(Boolean);
  return lista.length && lista.every((e) => ESCOPOS.includes(e)) ? lista.join(",") : PADRAO;
};

const cabecalhos = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

/** Página que conversa com a janela do painel e se fecha. */
function pagina(res, { token, erro, codigo }) {
  const estado = erro ? "error" : "success";
  const conteudo = erro ? { provider: "github", error: erro, errorCode: codigo } : { provider: "github", token };
  const msg = JSON.stringify(`authorization:github:${estado}:${JSON.stringify(conteudo)}`).replace(/</g, "\\u003c");
  const origens = JSON.stringify(ORIGENS);
  res.writeHead(200, { ...cabecalhos, "Set-Cookie": "harpya-oauth=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure" });
  res.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Harpya · login</title></head><body><p>Concluindo o login...</p><script>
(() => {
  const origens = ${origens};
  const temToken = ${token ? "true" : "false"};
  window.addEventListener("message", ({ data, origin }) => {
    if (data !== "authorizing:github") return;
    // A origem da mensagem é definida pelo navegador: o token só vai para o painel do Harpya.
    if (temToken && !origens.includes(origin)) return;
    window.opener && window.opener.postMessage(${msg}, origin);
  });
  window.opener && window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`);
}

// ---------- Modo 1: e-mail e senha ----------

const senhaConfigurada = () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, GITHUB_CMS_TOKEN } = process.env;
  return Boolean(ADMIN_EMAIL && ADMIN_PASSWORD_HASH && GITHUB_CMS_TOKEN);
};

const iguais = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Confere a senha contra "scrypt$N$r$p$sal_base64$hash_base64" (ver scripts/gerar_hash_senha.mjs). */
export function senhaConfere(senha, guardado) {
  const partes = String(guardado ?? "").split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;
  const [, n, r, p, sal, hash] = partes;
  const esperado = Buffer.from(hash, "base64");
  if (!esperado.length) return false;
  try {
    const obtido = scryptSync(String(senha), Buffer.from(sal, "base64"), esperado.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024,
    });
    return timingSafeEqual(obtido, esperado);
  } catch {
    return false;
  }
}

const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function formulario(res, aviso = "", status = 200) {
  res.writeHead(status, {
    ...cabecalhos,
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
  });
  res.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Harpya · entrar no painel</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f5f2;color:#1c1b19;display:grid;place-items:center;min-height:100vh;margin:0}form{background:#fff;padding:28px;border-radius:10px;box-shadow:0 2px 12px #0001;width:min(340px,90vw);display:grid;gap:12px}label{display:grid;gap:4px;font-size:14px}input{font:inherit;padding:9px 10px;border:1px solid #bbb;border-radius:6px}button{font:inherit;padding:10px;border:0;border-radius:6px;background:#1c1b19;color:#fff;cursor:pointer}.aviso{color:#a12;font-size:14px;margin:0}h1{font-size:18px;margin:0}</style></head>
<body><form method="post" action="/auth" autocomplete="on"><h1>Painel do Harpya</h1>${aviso ? `<p class="aviso" role="alert">${escapar(aviso)}</p>` : ""}
<label>E-mail<input type="email" name="email" autocomplete="username" required autofocus></label>
<label>Senha<input type="password" name="senha" autocomplete="current-password" required></label>
<button type="submit">Entrar</button></form></body></html>`);
}

async function lerCorpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return Object.fromEntries(new URLSearchParams(req.body));
  let texto = "";
  for await (const parte of req) {
    texto += parte;
    if (texto.length > 4096) break;
  }
  return Object.fromEntries(new URLSearchParams(texto));
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function entrarComSenha(req, res) {
  if (req.method !== "POST") return formulario(res);
  // Só aceita envio feito pelo próprio formulário do site.
  const origem = req.headers.origin;
  if (origem && !ORIGENS.includes(origem)) return formulario(res, "Origem não autorizada.", 403);
  const { email = "", senha = "" } = await lerCorpo(req);
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, GITHUB_CMS_TOKEN } = process.env;
  const emailOk = iguais(String(email).trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const senhaOk = senhaConfere(senha, ADMIN_PASSWORD_HASH); // roda sempre, para não revelar qual campo errou
  if (!emailOk || !senhaOk) {
    await esperar(1000); // freio contra tentativas em sequência
    return formulario(res, "E-mail ou senha incorretos.", 401);
  }
  return pagina(res, { token: GITHUB_CMS_TOKEN });
}

// ---------- Modo 2: OAuth do GitHub ----------

export async function iniciar(req, res) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  const url = new URL(req.url, "https://www.harpya.org");
  if ((url.searchParams.get("provider") ?? "github") !== "github") {
    return pagina(res, { erro: "Só o login pelo GitHub é aceito.", codigo: "UNSUPPORTED_BACKEND" });
  }
  if (senhaConfigurada()) return entrarComSenha(req, res);
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return pagina(res, { erro: "Login pelo GitHub ainda não configurado (faltam GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET na Vercel).", codigo: "MISCONFIGURED_CLIENT" });
  }
  const estado = randomBytes(16).toString("hex");
  const params = new URLSearchParams({ client_id: GITHUB_CLIENT_ID, scope: escopo(url.searchParams.get("scope")), state: estado });
  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params}`,
    "Cache-Control": "no-store",
    "Set-Cookie": `harpya-oauth=${estado}; HttpOnly; Max-Age=600; Path=/; SameSite=Lax; Secure`,
  });
  res.end();
}

export async function concluir(req, res) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  const url = new URL(req.url, "https://www.harpya.org");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const cookie = (req.headers.cookie ?? "").match(/(?:^|;\s*)harpya-oauth=([0-9a-f]{32})\b/)?.[1] ?? "";
  if (!code || !state) {
    return pagina(res, { erro: url.searchParams.get("error_description") ?? "O GitHub não devolveu o código de autorização.", codigo: "AUTH_CODE_REQUEST_FAILED" });
  }
  if (!cookie || cookie.length !== state.length || !timingSafeEqual(Buffer.from(cookie), Buffer.from(state))) {
    return pagina(res, { erro: "Sessão de login expirada ou inválida. Tente de novo.", codigo: "CSRF_DETECTED" });
  }
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return pagina(res, { erro: "Login pelo GitHub ainda não configurado.", codigo: "MISCONFIGURED_CLIENT" });
  }
  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
    });
    const dados = await r.json();
    if (!dados.access_token) {
      return pagina(res, { erro: dados.error_description ?? dados.error ?? "O GitHub recusou o código.", codigo: "TOKEN_REQUEST_FAILED" });
    }
    return pagina(res, { token: dados.access_token });
  } catch {
    return pagina(res, { erro: "Não foi possível falar com o GitHub. Tente de novo.", codigo: "TOKEN_REQUEST_FAILED" });
  }
}
