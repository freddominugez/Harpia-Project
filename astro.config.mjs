// Configuração do Astro para o Projeto Harpya.
// Site estático: a Vercel detecta o Astro e publica a pasta dist/ sem ajustes.
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  // Troque pelo domínio final quando ele existir (ex.: https://harpya.org).
  site: "https://www.harpya.org",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
