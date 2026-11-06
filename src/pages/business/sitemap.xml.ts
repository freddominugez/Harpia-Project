import type { APIRoute } from 'astro';
import { businessRotas } from '../../lib/business-rotas';
import { abs } from '../../lib/rotas';
export const GET: APIRoute = async () => new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(await businessRotas(abs)).map(r => `<url><loc>${abs(r.path)}</loc><lastmod>${r.atualizado}</lastmod></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
