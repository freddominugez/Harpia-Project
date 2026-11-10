import type { APIRoute } from 'astro';
import { businessRotas } from '../../lib/business-rotas';
export const GET: APIRoute = async () => new Response(JSON.stringify((await businessRotas(path => path)).map(r => ({ title: r.titulo, url: r.path, section: r.secao, description: r.descricao }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
