// Mantido para quem já cadastrou /sitemap-index.xml: aponta para o sitemap único.
import type { APIRoute } from "astro";
import { rotas } from "../lib/rotas";

export const GET: APIRoute = async () => {
  const ultima = (await rotas()).map((r) => r.atualizado).sort().at(-1);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>https://www.harpya.org/sitemap.xml</loc><lastmod>${ultima}</lastmod></sitemap>\n</sitemapindex>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
