// /llms-full.txt: todas as páginas em markdown, em sequência, num arquivo só.
import type { APIRoute } from "astro";
import { SITE } from "../config";
import { rotas } from "../lib/rotas";
import { gemeo } from "../lib/gemeos";

export const GET: APIRoute = async () => {
  const todas = await rotas();
  const corpo = [`# ${SITE.nome}: texto completo\n\n> ${SITE.descricao}\n\nAutor: ${SITE.autor}. Licença: CC BY 4.0.`, ...todas.map(gemeo)].join("\n\n---\n\n");
  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
