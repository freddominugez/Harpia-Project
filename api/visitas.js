import { createHmac } from 'node:crypto';

const ORIGINS = new Set(['https://www.harpya.org', 'https://harpya.org', 'http://localhost:4321']);
const BOT = /bot\b|crawler|spider|headless|lighthouse|preview|facebookexternalhit|slurp|bingpreview/i;
export function validView(req) {
  return ORIGINS.has(req.headers.origin) && !BOT.test(req.headers['user-agent'] || '') &&
    req.headers['sec-fetch-site'] !== 'cross-site';
}

export default async function handler(req, res) {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    res.end(JSON.stringify(body));
  };
  if (!['GET', 'POST'].includes(req.method)) return send(405, { error: 'Método não permitido.' });
  const { HARPYA_STATS_URL: base, HARPYA_STATS_KEY: key, HARPYA_STATS_SECRET: secret } = process.env;
  if (!base || !key || !secret) return send(503, { error: 'Contador indisponível.' });
  try {
    let rpc = 'harpya_views_read';
    let parameters = {};
    if (req.method === 'POST' && validView(req)) {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body) {
        let raw = '';
        for await (const chunk of req) { raw += chunk; if (raw.length > 1024) return send(413, { error: 'Pedido muito grande.' }); }
        body = JSON.parse(raw);
      }
      if (typeof body?.event_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.event_id)) return send(400, { error: 'Evento inválido.' });
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const day = new Date().toISOString().slice(0, 10);
      rpc = 'harpya_views_record';
      parameters = { p_secret: secret, p_event_id: body.event_id, p_rate_key: createHmac('sha256', secret).update(`${day}:${ip}`).digest('hex') };
    } else if (req.method === 'POST' && !ORIGINS.has(req.headers.origin)) return send(403, { error: 'Origem não autorizada.' });
    const response = await fetch(`${base}/rest/v1/rpc/${rpc}`, {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters), signal: AbortSignal.timeout(7000), cache: 'no-store',
    });
    if (!response.ok) return send(503, { error: 'Contador temporariamente indisponível.' });
    const result = await response.json();
    if (!Number.isSafeInteger(result?.views) || result.views < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(result.started_on)) return send(503, { error: 'Contador indisponível.' });
    return send(200, result);
  } catch (error) { return send(error instanceof SyntaxError ? 400 : 503, { error: 'Não foi possível consultar o contador.' }); }
}
