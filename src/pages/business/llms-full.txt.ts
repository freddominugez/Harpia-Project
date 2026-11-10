import type { APIRoute } from 'astro';
import { businessRotas } from '../../lib/business-rotas';
import { abs } from '../../lib/rotas';
export const GET: APIRoute = async () => new Response((await businessRotas(abs)).map(r => `# ${r.titulo}\n\nURL: ${abs(r.path)}\n\n${r.markdown()}`).join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
