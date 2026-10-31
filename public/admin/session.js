export function createGitHubClient() {
  let token = '';
  try { token = JSON.parse(localStorage.getItem('sveltia-cms.user'))?.token || ''; } catch { /* sessão indisponível */ }
  async function api(path, options = {}) {
    if (!token) throw Object.assign(new Error('Entre para continuar.'), { status: 401 });
    const response = await fetch(`https://api.github.com${path}`, { ...options, cache: 'no-store', headers: {
      Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers,
    } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) token = '';
      throw Object.assign(new Error(response.status === 401 ? 'Entre novamente para continuar.' : `O GitHub recusou a alteração: ${data.message || response.status}.`), { status: response.status });
    }
    return data;
  }
  function login() {
    const popup = window.open('/auth/?provider=github', 'harpya-admin-login', 'width=520,height=650');
    if (!popup) return Promise.reject(new Error('Permita a janela de login no navegador.'));
    return new Promise((resolve, reject) => {
      let timer;
      const cleanup = () => { clearInterval(timer); window.removeEventListener('message', receive); };
      const receive = event => {
        if (event.source !== popup || event.origin !== location.origin) return;
        if (event.data === 'authorizing:github') return popup.postMessage('authorizing:github', event.origin);
        if (typeof event.data !== 'string' || !event.data.startsWith('authorization:github:')) return;
        try {
          if (!event.data.startsWith('authorization:github:success:')) throw new Error('Não foi possível entrar.');
          const data = JSON.parse(event.data.slice('authorization:github:success:'.length));
          if (!data.token || typeof data.token !== 'string') throw new Error('Login inválido.');
          token = data.token; cleanup(); popup.close(); resolve();
        } catch (error) { cleanup(); reject(error); }
      };
      window.addEventListener('message', receive);
      timer = setInterval(() => { if (popup.closed) { cleanup(); reject(new Error('Login cancelado.')); } }, 400);
    });
  }
  return { api, login, hasToken: () => !!token };
}
