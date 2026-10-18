// Feed RSS de novidades: caminhos atualizados e itens publicados (vídeos, artigos, livros).
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "../config";
import { VIDEOS, urlVideo } from "../lib/videos";
import { ARTIGOS, LIVROS } from "../lib/conteudo";
import { URL_SITE } from "../lib/rotas";
import { COMECANDO, SERIE } from "../data/comecando";
import { ANALISES, urlAnalise } from "../data/analises";

type D = { adicionado_em?: string };

export const GET: APIRoute = async () => {
  const caminhos = await getCollection("caminhos");
  const itens = [
    ...ANALISES.map((a) => ({ title: a.titulo, link: `${URL_SITE}${urlAnalise(a)}`, pubDate: new Date(`${a.data}T12:00:00Z`), description: a.resumo, categories: ["Análises", a.serie] })),
    ...COMECANDO.map((a) => ({ title: `${SERIE}, artigo ${a.numero}: ${a.titulo}`, link: `${URL_SITE}/comecando/${a.slug}/`, pubDate: new Date(`${a.data}T12:00:00Z`), description: a.descricao, categories: ["Começando"] })),
    ...caminhos.map((c) => ({ title: `Caminho ${c.data.numero}: ${c.data.titulo}`, link: `${URL_SITE}/estudos/caminhos/${c.id}/`, pubDate: new Date(`${c.data.atualizado}T12:00:00Z`), description: c.data.resumo, categories: ["Caminhos"] })),
    ...(VIDEOS as (typeof VIDEOS[number] & D)[]).map((v) => ({ title: `Vídeo: ${v.titulo}`, link: urlVideo(v.id), pubDate: new Date(`${v.adicionado_em ?? "2026-10-12"}T12:00:00Z`), description: `${v.canal}. ${v.resumo}`, categories: ["Vídeos", v.nivel] })),
    ...(ARTIGOS as (typeof ARTIGOS[number] & D)[]).map((a) => ({ title: `Artigo: ${a.titulo}`, link: a.url, pubDate: new Date(`${a.adicionado_em ?? "2026-10-12"}T12:00:00Z`), description: `${a.autores}, ${a.ano}. ${a.rotulo}.`, categories: ["Biblioteca"] })),
    ...(LIVROS as (typeof LIVROS[number] & D)[]).map((l) => ({ title: `Livro: ${l.titulo}`, link: l.url || `${URL_SITE}/biblioteca/`, pubDate: new Date(`${l.adicionado_em ?? "2026-10-12"}T12:00:00Z`), description: `${l.autores}. ${l.nota}`, categories: ["Biblioteca"] })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime() || a.title.localeCompare(b.title)).slice(0, 60);
  return rss({
    title: `${SITE.nome}: novidades`,
    description: SITE.descricao,
    site: URL_SITE,
    items: itens,
    customData: `<language>pt-BR</language><copyright>Conteúdo CC BY 4.0 · ${SITE.autor}</copyright>`,
    trailingSlash: true,
  });
};
