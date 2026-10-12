// Gêmeos em markdown: /index.md, /origens.md, /estudos/caminhos/<slug>.md...
// Mesmo conteúdo da página em texto limpo, para leitores e modelos de linguagem.
// Cada página HTML aponta para o seu com <link rel="alternate" type="text/markdown">.
import type { APIRoute, GetStaticPaths } from "astro";
import { rotas, rotaDe, mdDe } from "../lib/rotas";
import { gemeo } from "../lib/gemeos";

export const getStaticPaths: GetStaticPaths = async () =>
  (await rotas()).map((r) => ({ params: { rota: mdDe(r.path).replace(/^\//, "").replace(/\.md$/, "") }, props: { path: r.path } }));

export const GET: APIRoute = async ({ props }) => {
  const r = (await rotaDe(props.path as string))!;
  return new Response(gemeo(r), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
