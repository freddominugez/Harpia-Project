// Pautas do fórum (src/content/pautas/*.md). Discussões já criadas no GitHub aparecem
// primeiro e como discussões reais; as demais aparecem como pautas propostas.
// Pauta proposta pela curadoria diária só aparece no site depois de aprovada no painel.
type Frontmatter = { titulo: string; categoria: string; caminho?: string; status: string; discussao_url?: string; proposta_em: string; origem?: string };
type Mod = { frontmatter: Frontmatter; file?: string };

export type ItemForum = { titulo: string; iniciais: string; categoria: string; href: string; criada: boolean; data: string };

const mods = Object.values(import.meta.glob("../content/pautas/*.md", { eager: true })) as Mod[];
const iniciais = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter((w) => w.length > 3).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "H";

export const PAUTAS: ItemForum[] = mods
  .map((m) => m.frontmatter)
  .filter((p) => p.status !== "descartada" && !(p.status === "proposta" && p.origem === "curadoria-diaria"))
  .map((p) => {
    const criada = p.status === "criada" && !!p.discussao_url;
    return {
      titulo: p.titulo,
      iniciais: iniciais(p.titulo),
      categoria: p.categoria,
      href: criada ? p.discussao_url! : p.caminho ? `/estudos/caminhos/${p.caminho}/` : "/forum/",
      criada,
      data: p.proposta_em,
    };
  })
  .sort((a, b) => Number(b.criada) - Number(a.criada) || b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo));
