// Sitemap com lastmod real (datas do conteúdo, não do build) e imagens da página Origens.
// O painel /admin e a página 404 ficam fora. Itens em rascunho não entram em nenhuma página.
import type { APIRoute } from "astro";
import { rotas, abs } from "../lib/rotas";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const urls = (await rotas()).map((r) => [
    "  <url>",
    `    <loc>${esc(abs(r.path))}</loc>`,
    `    <lastmod>${r.atualizado}</lastmod>`,
    ...(r.imagens ?? []).map((i) => `    <image:image><image:loc>${esc(i.url)}</image:loc></image:image>`),
    "  </url>",
  ].join("\n"));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
