// Configuração do Astro para o Projeto Harpya.
// Site estático: a Vercel detecta o Astro e publica a pasta dist/ sem ajustes.
import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Links externos no markdown abrem em nova aba, com rel="noopener noreferrer".
function rehypeLinksExternos() {
  const visitar = (no) => {
    if (no.type === "element" && no.tagName === "a") {
      const href = String(no.properties?.href ?? "");
      if (/^https?:\/\//.test(href) && !/^https:\/\/(www\.)?harpya\.org/.test(href)) {
        no.properties.target = "_blank";
        no.properties.rel = ["noopener", "noreferrer"];
      }
    }
    (no.children ?? []).forEach(visitar);
  };
  return (arvore) => visitar(arvore);
}

export default defineConfig({
  // Domínio canônico: o apex harpya.org redireciona (308) para www.
  site: "https://www.harpya.org",
  // Sitemap, robots.txt, RSS, llms.txt e imagens OG são rotas próprias em src/pages (ver docs/SEO_GEO.md).
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeLinksExternos],
  },
});
