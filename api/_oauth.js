// Autenticação do painel /admin.
// Modo 1 (preferido quando configurado): tela própria de e-mail e senha em /auth. A senha é
// conferida contra um hash scrypt guardado na Vercel e, se bater, o painel recebe o token do
// GitHub guardado no servidor. Variáveis: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, GITHUB_CMS_TOKEN.
// Modo 1b: link de acesso por e-mail (magic link). O painel pede o link ao Supabase Auth do
// projeto By Vulcan, que envia o e-mail; na volta, /callback confere no Supabase quem clicou
// e só entrega o token se o e-mail estiver em ADMIN_MAGIC_EMAILS.
// Variáveis: HARPYA_AUTH_URL, HARPYA_AUTH_KEY, ADMIN_MAGIC_EMAILS, GITHUB_CMS_TOKEN.
// Modo 2: "Sign In with GitHub" pelo OAuth App, descrito abaixo.
// O Sveltia CMS abre uma janela em /auth; aqui ela vai ao GitHub, volta em /callback,
// troca o código por um token e entrega o token à janela do painel por postMessage.
// Mesmo protocolo do sveltia-cms-auth (MIT, github.com/sveltia/sveltia-cms-auth),
// adaptado para funções da Vercel. Segredos só em variáveis de ambiente:
//   GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET (OAuth App do GitHub, ver docs/PAINEL_ADMIN.md).
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

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

const ESTILO = `body{font-family:system-ui,sans-serif;background:#f6f5f2;color:#1c1b19;display:grid;place-items:center;min-height:100vh;margin:0}main{background:#fff;padding:28px;border-radius:10px;box-shadow:0 2px 12px #0001;width:min(340px,90vw);display:grid;gap:14px}form{display:grid;gap:12px}label{display:grid;gap:4px;font-size:14px}input{font:inherit;padding:9px 10px;border:1px solid #bbb;border-radius:6px}button{font:inherit;padding:10px;border:0;border-radius:6px;background:#1c1b19;color:#fff;cursor:pointer}.aviso{color:#a12;font-size:14px;margin:0}.nota{color:#55524c;font-size:13px;margin:0}.ou{color:#55524c;font-size:13px;margin:0;text-align:center;border-top:1px solid #ddd;padding-top:14px}h1{font-size:18px;margin:0}p{margin:0;line-height:1.45}`;

const topo = (titulo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${titulo}</title><style>${ESTILO}</style></head>`;

function formulario(res, aviso = "", status = 200) {
  const comLink = linkConfigurado();
  const comSenha = senhaConfigurada();
  res.writeHead(status, {
    ...cabecalhos,
    // no-referrer faz o navegador enviar Origin: null no POST do formulário.
    // Preserva a origem no próprio site sem enviar referências a outros sites.
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
  });
  const porLink = comLink ? `<form method="post" action="/auth/" autocomplete="on"><input type="hidden" name="modo" value="link">
<label>E-mail<input type="email" name="email" autocomplete="username" required autofocus></label>
<button type="submit">Receber link de acesso</button>
<p class="nota">O link chega por e-mail e vale por 1 hora. Abra-o neste mesmo navegador.</p></form>` : "";
  const porSenha = comSenha ? `<form method="post" action="/auth/" autocomplete="on"><input type="hidden" name="modo" value="senha">
<label>E-mail<input type="email" name="email" autocomplete="username" required${comLink ? "" : " autofocus"}></label>
<label>Senha<input type="password" name="senha" autocomplete="current-password" required></label>
<button type="submit">Entrar</button></form>` : "";
  res.end(`${topo("Harpya · entrar no painel")}
<body><main><h1>Painel do Harpya</h1>${aviso ? `<p class="aviso" role="alert">${escapar(aviso)}</p>` : ""}
${porLink}${comLink && comSenha ? `<p class="ou">ou entre com a senha</p>` : ""}${porSenha}</main></body></html>`);
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

async function entrar(req, res) {
  if (req.method !== "POST") return formulario(res);
  // Só aceita envio feito pelo próprio formulário do site.
  const origem = req.headers.origin;
  if (origem && !ORIGENS.includes(origem)) return formulario(res, "Origem não autorizada.", 403);
  const { email = "", senha = "", modo = "senha" } = await lerCorpo(req);
  if (modo === "link" && linkConfigurado()) return pedirLink(res, email);
  if (!senhaConfigurada()) return formulario(res, "Entre com o link enviado por e-mail.", 400);
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, GITHUB_CMS_TOKEN } = process.env;
  const emailOk = iguais(String(email).trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const senhaOk = senhaConfere(senha, ADMIN_PASSWORD_HASH); // roda sempre, para não revelar qual campo errou
  if (!emailOk || !senhaOk) {
    await esperar(1000); // freio contra tentativas em sequência
    return formulario(res, "E-mail ou senha incorretos.", 401);
  }
  return pagina(res, { token: GITHUB_CMS_TOKEN });
}

// ---------- Modo 1b: link de acesso por e-mail ----------

// O Supabase só redireciona para endereços liberados em Auth → URL Configuration.
const RETORNO_LINK = "https://www.harpya.org/callback/";
const COOKIE_LINK = "harpya-link";
const CANAL = "harpya-login";

const linkConfigurado = () => {
  const { HARPYA_AUTH_URL, HARPYA_AUTH_KEY, ADMIN_MAGIC_EMAILS, GITHUB_CMS_TOKEN } = process.env;
  return Boolean(HARPYA_AUTH_URL && HARPYA_AUTH_KEY && ADMIN_MAGIC_EMAILS && GITHUB_CMS_TOKEN);
};

/** O e-mail está na lista ADMIN_MAGIC_EMAILS (separada por vírgula; maiúsculas não importam)? */
export function emailAutorizado(email, lista = process.env.ADMIN_MAGIC_EMAILS) {
  const alvo = String(email ?? "").trim().toLowerCase();
  if (!alvo) return false;
  return String(lista ?? "").split(/[\s,;]+/).filter(Boolean).some((e) => iguais(e.toLowerCase(), alvo));
}

const supabase = (caminho, corpo, extra = {}) =>
  fetch(`${process.env.HARPYA_AUTH_URL.replace(/\/+$/, "")}/auth/v1/${caminho}`, {
    method: "POST",
    headers: { apikey: process.env.HARPYA_AUTH_KEY, "Content-Type": "application/json", ...extra },
    body: JSON.stringify(corpo),
  });

const cookieLink = (valor, segundos) => `${COOKIE_LINK}=${valor}; HttpOnly; Max-Age=${segundos}; Path=/; SameSite=Lax; Secure`;

/** Página com script próprio (nonce) e nada além dele. */
function paginaLink(res, status, corpo, { script = "", cookie } = {}) {
  const nonce = randomBytes(16).toString("base64");
  res.writeHead(status, {
    ...cabecalhos,
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-ancestors 'none'`,
    ...(cookie ? { "Set-Cookie": cookie } : {}),
  });
  res.end(`${topo("Harpya · login")}<body><main><h1>Painel do Harpya</h1>${corpo}</main>${script ? `<script nonce="${nonce}">${script}</script>` : ""}</body></html>`);
}

/** Pede o envio do link e deixa a janela do painel esperando o clique. */
async function pedirLink(res, email) {
  const alvo = String(email).trim().toLowerCase();
  // O verificador (PKCE) fica só neste navegador: o link só funciona em quem pediu.
  const verificador = randomBytes(32).toString("base64url");
  if (emailAutorizado(alvo)) {
    try {
      const r = await supabase(`otp?redirect_to=${encodeURIComponent(RETORNO_LINK)}`, {
        email: alvo,
        create_user: false,
        code_challenge: createHash("sha256").update(verificador).digest("base64url"),
        code_challenge_method: "s256",
      });
      if (r.status === 429) return formulario(res, "Um link já foi pedido há pouco. Aguarde um minuto e tente de novo.", 429);
      if (!r.ok) return formulario(res, "Não foi possível enviar o link agora. Tente de novo em instantes.", 502);
    } catch {
      return formulario(res, "Não foi possível enviar o link agora. Tente de novo em instantes.", 502);
    }
  } else {
    await esperar(1000); // mesma tela para e-mail fora da lista, sem revelar quem tem acesso
  }
  return paginaLink(res, 200, `<p id="estado" role="status">Se <strong>${escapar(alvo)}</strong> tiver acesso ao painel, o link acabou de ser enviado.</p><p class="nota">Abra o e-mail neste mesmo navegador e clique no link. Deixe esta janela aberta: o painel entra sozinho.</p>`, {
    cookie: cookieLink(verificador, 3600),
    script: `(() => {
  const origens = ${JSON.stringify(ORIGENS)};
  const canal = new BroadcastChannel(${JSON.stringify(CANAL)});
  canal.addEventListener("message", ({ data }) => {
    if (!data || data.tipo !== "token" || typeof data.token !== "string") return;
    if (!window.opener || window.opener.closed) return; // sem painel esperando: a aba do link assume
    canal.postMessage({ tipo: "recebido" });
    canal.close();
    const msg = "authorization:github:success:" + JSON.stringify({ provider: "github", token: data.token });
    window.addEventListener("message", ({ data: pedido, origin }) => {
      if (pedido !== "authorizing:github" || !origens.includes(origin)) return;
      window.opener.postMessage(msg, origin);
    });
    window.opener.postMessage("authorizing:github", "*");
    document.getElementById("estado").textContent = "Login concluído.";
  });
})();`,
  });
}

/** Volta do clique no link: confere no Supabase quem clicou e entrega o token do painel. */
async function concluirLink(req, res, url) {
  const apagar = cookieLink("", 0);
  const recusar = (status, texto) => paginaLink(res, status, `<p class="aviso" role="alert">${escapar(texto)}</p><p class="nota"><a href="/admin/">Voltar ao painel</a></p>`, { cookie: apagar });
  const code = url.searchParams.get("code");
  if (!code) return recusar(400, "O link expirou ou já foi usado. Peça um novo no painel.");
  const verificador = (req.headers.cookie ?? "").match(/(?:^|;\s*)harpya-link=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];
  if (!verificador) return recusar(400, "Abra o link no mesmo navegador em que você pediu o acesso, ou peça um novo no painel.");
  let dados;
  try {
    const r = await supabase("token?grant_type=pkce", { auth_code: code, code_verifier: verificador });
    dados = await r.json();
    if (!r.ok || !dados?.access_token) return recusar(400, "O link expirou ou já foi usado. Peça um novo no painel.");
  } catch {
    return recusar(502, "Não foi possível conferir o link agora. Tente de novo em instantes.");
  }
  // A sessão no Supabase serviu só para provar o e-mail: é encerrada em seguida.
  try {
    await supabase("logout?scope=local", {}, { Authorization: `Bearer ${dados.access_token}` });
  } catch { /* sem efeito no login do painel */ }
  if (!emailAutorizado(dados.user?.email)) return recusar(403, "Este e-mail não tem acesso ao painel.");
  const token = JSON.stringify(process.env.GITHUB_CMS_TOKEN).replace(/</g, "\\u003c");
  return paginaLink(res, 200, `<p id="estado" role="status">Concluindo o login...</p>`, {
    cookie: apagar,
    script: `(() => {
  history.replaceState(null, "", "/callback/");
  const token = ${token};
  const estado = document.getElementById("estado");
  const canal = new BroadcastChannel(${JSON.stringify(CANAL)});
  let entregue = false;
  canal.addEventListener("message", ({ data }) => {
    if (!data || data.tipo !== "recebido") return;
    entregue = true;
    canal.close();
    estado.textContent = "Login concluído. Volte à janela do painel; esta aba pode ser fechada.";
    window.close();
  });
  canal.postMessage({ tipo: "token", token });
  // Sem janela do painel esperando, esta aba guarda a sessão e abre o painel.
  setTimeout(() => {
    if (entregue) return;
    canal.close();
    try { localStorage.setItem("sveltia-cms.user", JSON.stringify({ backendName: "github", token })); } catch { /* sem armazenamento */ }
    location.replace("/admin/");
  }, 1500);
})();`,
  });
}

// ---------- Modo 2: OAuth do GitHub ----------

export async function iniciar(req, res) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  const url = new URL(req.url, "https://www.harpya.org");
  if ((url.searchParams.get("provider") ?? "github") !== "github") {
    return pagina(res, { erro: "Só o login pelo GitHub é aceito.", codigo: "UNSUPPORTED_BACKEND" });
  }
  if (senhaConfigurada() || linkConfigurado()) return entrar(req, res);
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
  // O GitHub sempre devolve "state"; sem ele, quem voltou foi o link enviado por e-mail.
  if (linkConfigurado() && !state) return concluirLink(req, res, url);
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
