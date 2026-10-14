// Índice completo de referências. Derivado do conteúdo publicado a cada build.
import fs from "node:fs";
import { getCollection } from "astro:content";
import { FONTES, ARTIGOS, LIVROS, FEEDS } from "./conteudo";
import { VIDEOS, urlVideo } from "./videos";
import { CAPITULOS, PESSOAS } from "../data/origens";
import { COMECANDO, corpoDe } from "../data/comecando";
import { temPagina } from "./pautas";
import { SITE } from "../config";

export type Referencia = { nome: string; url: string; credito: string; paginas: { titulo: string; href: string }[] };
export type GrupoFontes = { id: string; titulo: string; itens: Referencia[] };
let cache: Promise<GrupoFontes[]> | undefined;

export function fontesDoSite(): Promise<GrupoFontes[]> {
  return cache ??= reunir();
}

async function reunir(): Promise<GrupoFontes[]> {
  const grupos = new Map<string, GrupoFontes>();
  const gruposDaUrl = new Map<string, Referencia>();
  const adicionar = (grupo: string, id: string, nome: string, endereco: string, credito = "", titulo = "", href = "") => {
    if (!endereco) return;
    let url: string;
    try {
      const u = new URL(endereco.replace(/&amp;/g, "&"));
      if (!/^https?:$/.test(u.protocol) || ["www.harpya.org", "harpya.org"].includes(u.hostname)) return;
      url = u.href;
    } catch { return; }
    let item = gruposDaUrl.get(url);
    if (!item) {
      if (!grupos.has(grupo)) grupos.set(grupo, { id, titulo: grupo, itens: [] });
      item = { nome: nome || url, url, credito, paginas: [] };
      grupos.get(grupo)!.itens.push(item);
      gruposDaUrl.set(url, item);
    }
    if (titulo && href && !item.paginas.some((p) => p.href === href)) item.paginas.push({ titulo, href });
  };
  const lerLinks = (texto: string, grupo: string, id: string, titulo: string, href: string) => {
    // URLs em Markdown podem conter parênteses, como DOI e arquivos do Wikimedia.
    for (const m of texto.matchAll(/\[([^\]]+)\]\((https?:\/\/(?:[^\s()]|\([^\s]*?\))+)\)/g)) {
      adicionar(grupo, id, m[1].replace(/[*_]/g, ""), m[2], "", titulo, href);
    }
    for (const m of texto.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)) {
      adicionar(grupo, id, m[2].replace(/<[^>]*>/g, "").trim(), m[1], "", titulo, href);
    }
    for (const m of texto.matchAll(/https?:\/\/[^\s<>"']+/g)) {
      let url = m[0].replace(/[.,;]+$/, "");
      // Remove delimitadores Markdown sem cortar parênteses que pertencem à URL.
      url = url.replace(/\]+$/, "");
      while (url.endsWith(")") && (url.match(/\)/g)?.length ?? 0) > (url.match(/\(/g)?.length ?? 0)) url = url.slice(0, -1);
      adicionar(grupo, id, url, url, "", titulo, href);
    }
  };

  for (const f of FONTES) adicionar(f.grupo, `instituicoes-${f.grupo_ordem}`, f.nome, f.url, f.descricao, "Biblioteca", "/biblioteca/");
  for (const a of ARTIGOS) adicionar("Artigos científicos", "artigos", a.titulo, a.url, `${a.autores} · ${a.ano}`, "Biblioteca", "/biblioteca/");
  for (const l of LIVROS) {
    adicionar("Livros e edições", "livros", l.titulo, l.url, l.autores, "Biblioteca", "/biblioteca/");
    adicionar("Livros e edições", "livros", `${l.titulo} · referência de compra`, l.compra_url ?? "", l.autores, "Biblioteca", "/biblioteca/");
  }
  for (const v of VIDEOS) adicionar("Vídeos", "videos", v.titulo, urlVideo(v.id), `${v.canal} · ${v.nivel}`, "Vídeos", "/videos/");
  for (const c of CAPITULOS) for (const r of c.refs) adicionar("Referências históricas", "origens", r.texto, r.url, "", c.titulo, `/origens/#${c.id}`);
  for (const p of PESSOAS) if (p.fonte) adicionar("Imagens e créditos", "imagens", `Fotografia de ${p.nome}`, p.fonte, `${p.credito} · ${p.licenca}`, "Origens", "/origens/");

  for (const c of await getCollection("caminhos")) {
    lerLinks([c.body, ...c.data.arte_previa].join("\n"), "Referências dos estudos", "estudos", c.data.titulo, `/estudos/caminhos/${c.id}/`);
  }
  for (const p of await getCollection("pautas")) if (temPagina(p.data.status)) {
    lerLinks([p.body, ...p.data.links].join("\n"), "Referências do fórum", "forum", p.data.titulo, `/forum/${p.id}/`);
  }
  const paginasMd = [
    ["src/pages/equacoes.md", "Equações", "/equacoes/"],
    ["src/pages/estudos/arquivados.md", "Estudos arquivados", "/estudos/arquivados/"],
    ["src/pages/biblioteca/glossario.md", "Glossário", "/biblioteca/glossario/"],
    ["src/pages/sobre.md", "Sobre", "/sobre/"],
    ["src/pages/termos-de-uso.md", "Termos de Uso", "/termos-de-uso/"],
  ];
  for (const [arquivo, titulo, href] of paginasMd) lerLinks(fs.readFileSync(arquivo, "utf-8").replace(/^---\n[\s\S]*?\n---/, ""), "Referências editoriais e licenças", "editoriais", titulo, href);
  for (const a of COMECANDO) lerLinks(corpoDe(a.slug), "Referências da série Começando", "comecando", a.titulo, `/comecando/${a.slug}/`);

  // Inclui fonte_url do catálogo, mesmo quando difere do link de leitura.
  for (const colecao of ["artigos", "livros", "videos", "fontes"] as const) {
    for (const { data: d } of await getCollection(colecao)) if (d.status === "publicado") {
      adicionar("Fontes do catálogo", "catalogo", "titulo" in d ? d.titulo : "nome" in d ? d.nome : "Fonte", d.fonte_url, "Fonte da curadoria", "Catálogo", colecao === "videos" ? "/videos/" : "/biblioteca/");
    }
  }
  for (const f of FEEDS) adicionar("Feeds e fontes monitoradas", "feeds", `${f.nome} · feed`, f.url, f.nota ?? "", "News", "/news/");
  for (const f of await getCollection("fontes-monitoradas")) if (f.data.ativo) {
    adicionar("Feeds e fontes monitoradas", "feeds", f.data.nome, f.data.pagina, f.data.tema);
    adicionar("Feeds e fontes monitoradas", "feeds", `${f.data.nome} · feed`, f.data.feed, f.data.tema);
  }
  const news: { fonte: string; titulo: string; url: string }[] = JSON.parse(fs.readFileSync("public/data/news.json", "utf-8"));
  for (const n of news) adicionar("Notícias e publicações recentes", "news", n.titulo, n.url, n.fonte, "News", "/news/");
  adicionar("Projeto e licenças", "projeto", "Código-fonte do Harpya", SITE.repositorio, "Código MIT · conteúdo original CC BY 4.0");
  adicionar("Projeto e licenças", "projeto", "Creative Commons Atribuição 4.0 Internacional", "https://creativecommons.org/licenses/by/4.0/");

  return [...grupos.values()];
}

export const markdownDasFontes = (grupos: GrupoFontes[]) => grupos.map((g) => `## ${g.titulo}\n\n${g.itens.map((f) => `- [${f.nome}](${f.url})${f.credito ? `: ${f.credito}` : ""}${f.paginas.length ? `. No site: ${f.paginas.map((p) => `[${p.titulo}](${p.href})`).join(", ")}` : ""}`).join("\n")}`).join("\n\n");
