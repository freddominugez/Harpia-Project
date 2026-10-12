// Configuração do Astro para o Projeto Harpya.
// Site estático: a Vercel detecta o Astro e publica a pasta dist/ sem ajustes.
import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  // Domínio canônico: o apex harpya.org redireciona (308) para www.
  site: "https://www.harpya.org",
  // Sitemap, robots.txt, RSS, llms.txt e imagens OG são rotas próprias em src/pages (ver docs/SEO_GEO.md).
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
