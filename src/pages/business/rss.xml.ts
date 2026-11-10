import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { businessRotas } from '../../lib/business-rotas';
import { abs, URL_SITE } from '../../lib/rotas';
export const GET: APIRoute = async () => rss({ title: 'Harpya Business: estudos e leituras', description: 'Novidades da curadoria de marketing, estratégia e administração.', site: URL_SITE, items: (await businessRotas(abs)).filter(r => r.path.includes('/estudos/') || r.path.includes('/leituras/')).map(r => ({ title: r.titulo, link: abs(r.path), description: r.descricao, pubDate: new Date(`${r.atualizado}T12:00:00Z`) })), customData: '<language>pt-BR</language>' });
