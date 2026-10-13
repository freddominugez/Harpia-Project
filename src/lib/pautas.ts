// Pautas do fórum (src/content/pautas/*.md). Discussões reais aparecem primeiro; as demais
// aparecem como pautas propostas. Pauta proposta pela curadoria diária só aparece no site
// depois de aprovada no painel.
// Fórum próprio (Waline): pauta aprovada vira página /forum/<arquivo>/ com a conversa.
// Giscus (antes): pauta criada no GitHub Discussions aponta para discussao_url.
import { forumProprio } from "../config";
type Frontmatter = { titulo: string; categoria: string; caminho?: string; status: string; discussao_url?: string; proposta_em: string; origem?: string };
type Mod = { frontmatter: Frontmatter; file?: string };
export const slugPauta = (arquivo: string) => arquivo.split("/").pop()!.replace(/\.md$/, "");
export const temPagina = (status: string) => forumProprio() && (status === "aprovada" || status === "criada");

export type ItemForum = { titulo: string; iniciais: string; categoria: string; href: string; criada: boolean; data: string };

const mods = Object.entries(import.meta.glob("../content/pautas/*.md", { eager: true })).map(([arq, m]) => ({ ...(m as Mod), slug: slugPauta(arq) }));
const iniciais = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter((w) => w.length > 3).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "H";

export const PAUTAS: ItemForum[] = mods
  .map((m) => ({ ...m.frontmatter, slug: m.slug }))
  .filter((p) => p.status !== "descartada" && !(p.status === "proposta" && p.origem === "curadoria-diaria"))
  .map((p) => {
    const pagina = temPagina(p.status);
    const criada = pagina || (!forumProprio() && p.status === "criada" && !!p.discussao_url);
    return {
      titulo: p.titulo,
      iniciais: iniciais(p.titulo),
      categoria: p.categoria,
      href: pagina ? `/forum/${p.slug}/` : criada ? p.discussao_url! : p.caminho ? `/estudos/caminhos/${p.caminho}/` : "/forum/",
      criada,
      data: p.proposta_em,
    };
  })
  .sort((a, b) => Number(b.criada) - Number(a.criada) || b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo));
