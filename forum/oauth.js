// Intermediário de login do Google para o Waline, hospedado aqui mesmo para que nenhum
// serviço de terceiros veja os dados de quem entra no fórum. Substitui o padrão do
// Waline (oauth.lithub.cc). Mesmo protocolo do walinejs/auth (MIT), só com Google.
//
//   GET /oauth/google?redirect=&state=       -> vai para a tela de consentimento do Google
//   GET /oauth/google?code=&state=           -> (navegador) volta para o Waline com o código
//   GET /oauth/google?code=&state= (@waline) -> (servidor do Waline) devolve o perfil em JSON
//
// Variáveis: GOOGLE_ID, GOOGLE_SECRET, SERVER_URL (https://forum.harpya.org).
const SERVER = (process.env.SERVER_URL || "https://forum.harpya.org").replace(/\/$/, "");
const CALLBACK = `${SERVER}/oauth/google`;
// Só devolve o código para o próprio servidor do fórum, e o token só para páginas do Harpya.
const HOSTS_FINAIS = new Set(["www.harpya.org", "harpya.org", "forum.harpya.org"]);

function redirecionamentoValido(redirect) {
  try {
    const u = new URL(redirect);
    if (u.origin !== SERVER || u.pathname !== "/api/oauth") return false;
    const final = u.searchParams.get("redirect");
    if (!final) return true;
    const f = new URL(final, SERVER);
    return f.protocol === "https:" && HOSTS_FINAIS.has(f.hostname);
  } catch {
    return false;
  }
}

const json = (res, status, corpo) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(corpo));
};
const ir = (res, url) => {
  res.statusCode = 302;
  res.setHeader("Location", url);
  res.setHeader("Cache-Control", "no-store");
  res.end();
};

module.exports = async (req, res) => {
  const { GOOGLE_ID, GOOGLE_SECRET } = process.env;
  const url = new URL(req.url, SERVER);
  if (!/^\/oauth\/google\/?$/.test(url.pathname)) return json(res, 404, { error: "não encontrado" });
  if (!GOOGLE_ID || !GOOGLE_SECRET) return json(res, 503, { error: "login do Google não configurado" });

  const code = url.searchParams.get("code");
  const stateBruto = url.searchParams.get("state") || "";

  // 1. Início: manda para o Google, guardando o destino no state.
  if (!code) {
    const redirect = url.searchParams.get("redirect") || "";
    if (!redirecionamentoValido(redirect)) return json(res, 400, { error: "redirecionamento não permitido" });
    const state = new URLSearchParams({ redirect, state: url.searchParams.get("state") || "" }).toString();
    const p = new URLSearchParams({
      client_id: GOOGLE_ID,
      redirect_uri: CALLBACK,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return ir(res, `https://accounts.google.com/o/oauth2/v2/auth?${p}`);
  }

  const st = new URLSearchParams(stateBruto);
  const redirect = st.get("redirect");
  const stateWaline = st.get("state") || "";

  // 2. Volta do Google no navegador: repassa o código ao servidor do Waline.
  if (redirect && req.headers["user-agent"] !== "@waline") {
    if (!redirecionamentoValido(redirect)) return json(res, 400, { error: "redirecionamento não permitido" });
    const destino = new URL(redirect);
    destino.searchParams.set("code", code);
    destino.searchParams.set("state", stateWaline);
    return ir(res, destino.toString());
  }

  // 3. Chamada do servidor do Waline: troca o código pelo perfil.
  try {
    const t = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ client_id: GOOGLE_ID, client_secret: GOOGLE_SECRET, code, grant_type: "authorization_code", redirect_uri: CALLBACK }),
    }).then((r) => r.json());
    if (!t.access_token) return json(res, 400, { error: t.error_description || t.error || "o Google recusou o código" });
    const u = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json());
    if (!u.sub || !u.email || u.email_verified === false) return json(res, 400, { error: "conta do Google sem e-mail verificado" });
    return json(res, 200, { id: u.sub, name: u.name || u.email.split("@")[0], email: u.email, url: "", avatar: u.picture || "" });
  } catch {
    return json(res, 502, { error: "falha ao falar com o Google" });
  }
};
