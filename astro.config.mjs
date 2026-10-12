// Configuração do Astro para o Projeto Harpia.
// Site estático: a Vercel detecta o Astro e publica a pasta dist/ sem ajustes.
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  // Troque pelo domínio final quando ele existir (ex.: https://harpia.byvulcan.com).
  site: "https://harpia-project.vercel.app",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
