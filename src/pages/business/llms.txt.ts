import type { APIRoute } from 'astro';
import { businessRotas } from '../../lib/business-rotas';
import { abs, mdDe } from '../../lib/rotas';
export const GET: APIRoute = async () => new Response(`# Harpya Business\n\n> Marketing, estratégia e administração com evidências e fontes de referência.\n\nGuias autorais e fichas de curadoria, com links aos originais e limites. Vídeos candidatos não são conteúdo publicado.\n\n${(await businessRotas(abs)).map(r => `- [${r.titulo}](${abs(mdDe(r.path))}): ${r.descricao}`).join('\n')}\n\nTexto completo: ${abs('/business/llms-full.txt')}\nRSS: ${abs('/business/rss.xml')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
