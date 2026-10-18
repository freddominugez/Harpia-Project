// Análises assinadas (src/content/analises/*.md), em leitura síncrona para a home,
// o registro de rotas, o RSS e o llms.txt. A página de cada uma usa a coleção "analises".
type Frontmatter = { titulo: string; titulo_curto: string; serie: string; parte: number; total: number; data: string; resumo: string; status?: string };
type Md = { frontmatter: Frontmatter; rawContent: () => string; file: string };

export type Analise = Frontmatter & { slug: string; corpo: string };

export const ANALISES: Analise[] = (Object.values(import.meta.glob("../content/analises/*.md", { eager: true })) as Md[])
  .filter((m) => (m.frontmatter.status ?? "publicado") === "publicado")
  .map((m) => ({ ...m.frontmatter, slug: m.file.split("/").pop()!.replace(/\.md$/, ""), corpo: m.rawContent() }))
  .sort((a, b) => b.data.localeCompare(a.data) || a.serie.localeCompare(b.serie) || a.parte - b.parte);

export const urlAnalise = (a: { slug: string }) => `/analises/${a.slug}/`;
