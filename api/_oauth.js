// Autenticação do painel /admin com "Sign In with GitHub".
// O Sveltia CMS abre uma janela em /auth; aqui ela vai ao GitHub, volta em /callback,
// troca o código por um token e entrega o token à janela do painel por postMessage.
// Mesmo protocolo do sveltia-cms-auth (MIT, github.com/sveltia/sveltia-cms-auth),
// adaptado para funções da Vercel. Segredos só em variáveis de ambiente:
//   GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET (OAuth App do GitHub, ver docs/PAINEL_ADMIN.md).
import { randomBytes, timingSafeEqual } from "node:crypto";

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

export function iniciar(req, res) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  const url = new URL(req.url, "https://www.harpya.org");
  if ((url.searchParams.get("provider") ?? "github") !== "github") {
    return pagina(res, { erro: "Só o login pelo GitHub é aceito.", codigo: "UNSUPPORTED_BACKEND" });
  }
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
