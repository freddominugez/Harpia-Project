// Índice de busca gerado no build a partir das rotas e do conteúdo reais do site.
// Publicado em /busca.json e carregado pelo navegador só quando a busca é aberta.
import fs from "node:fs";
import GithubSlugger from "github-slugger";
import { getCollection } from "astro:content";
import { NAV } from "../config";

export type SearchItem = { title: string; url: string; section: string; description?: string };

// Lê os títulos "## ..." de uma página markdown e gera as âncoras como o Astro gera.
function headings(file: string, base: string, section: string): SearchItem[] {
  let src = "";
  try { src = fs.readFileSync(file, "utf-8"); } catch { return []; }
  const slugger = new GithubSlugger();
  return [...src.matchAll(/^##\s+(.+)$/gm)].map((m) => {
    const title = m[1].trim();
    return { title, url: `${base}#${slugger.slug(title)}`, section };
  });
}

// Termos do glossário no formato "**Termo.** definição".
function glossario(): SearchItem[] {
  let src = "";
  try { src = fs.readFileSync("src/pages/biblioteca/glossario.md", "utf-8"); } catch { return []; }
  return [...src.matchAll(/^\*\*(.+?)\.\*\*\s+(.+)$/gm)].map((m) => ({
    title: m[1],
    url: "/biblioteca/glossario/",
    section: "Glossário",
    description: m[2].replace(/\$[^$]*\$/g, "").replace(/\s+/g, " ").slice(0, 120),
  }));
}

export async function buildSearchIndex(): Promise<SearchItem[]> {
  const pages: SearchItem[] = NAV.map((n) => ({ title: n.rotulo, url: n.href, section: "Página", description: n.descricao }));
  pages.push(
    { title: "A ideia mais interessante que não serve para nada", url: "/estudos/a-ideia-mais-interessante/", section: "Estudos", description: "Espaço não euclidiano e geometria hiperbólica" },
    { title: "Arquivados", url: "/estudos/arquivados/", section: "Estudos", description: "Linhas avaliadas e arquivadas, com o motivo" },
    { title: "Glossário", url: "/biblioteca/glossario/", section: "Biblioteca", description: "Os termos do site em uma ou duas linhas" },
    { title: "Fontes de alta qualidade", url: "/biblioteca/fontes/", section: "Biblioteca", description: "Institutos, projetos, repositórios e laboratórios" },
  );
  const caminhos = (await getCollection("caminhos")).sort((a, b) => a.data.numero - b.data.numero);
  const estudos: SearchItem[] = caminhos.map((c) => ({
    title: c.data.titulo,
    url: `/estudos/caminhos/${c.id}/`,
    section: `Caminho ${String(c.data.numero).padStart(2, "0")}`,
    description: c.data.resumo,
  }));
  return [
    ...pages,
    ...estudos,
    ...headings("src/pages/equacoes.md", "/equacoes/", "Equações"),
    ...headings("src/pages/estudos/arquivados.md", "/estudos/arquivados/", "Arquivados"),
    ...glossario(),
  ];
}
