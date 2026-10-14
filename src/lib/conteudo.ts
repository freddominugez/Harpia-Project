// Acesso síncrono às coleções de src/content/ (um arquivo por item).
// A validação de cada arquivo é feita pelo esquema em src/content.config.ts no build;
// aqui só lemos, ordenamos e deixamos de fora o que não está publicado.

type Status = { status?: string; ordem?: number };
const lista = <T extends Status>(mods: Record<string, unknown>, todos = false): T[] =>
  Object.values(mods)
    .map((m) => ((m as { default?: T }).default ?? m) as T)
    .filter((x) => todos || x.status === undefined || x.status === "publicado")
    .sort((a, b) => Number(a.ordem ?? 999) - Number(b.ordem ?? 999));

export type Artigo = { ano: number; titulo: string; autores: string; url: string; grupo: string; selo: "medido" | "arte" | "lacuna" | "teste"; rotulo: string };
export type Livro = { titulo: string; autores: string; nota: string; uso: string; url: string; cor: string; ano?: number; resenha?: string; categoria?: string; capa?: string; compra_url?: string };
export const CATEGORIAS_LIVRO: [string, string][] = [["mat", "Matemática e estatística"], ["ml", "Aprendizado de máquina"], ["ling", "Linguagem e informação"], ["ia", "IA e sociedade"], ["comp", "Ciência da computação"], ["eng", "Engenharia de software e dados"]];
export type Fonte = { nome: string; url: string; descricao: string; grupo: string; grupo_ordem: number };
export type Feed = { nome: string; url: string; nota?: string; so_titulo?: boolean };
export type Aprendizado = { ano: number; titulo: string; texto: string; eq?: string };
export type EventoLinha = { ano: number; titulo: string; texto: string; eq?: string; marco: boolean; era: string };

export const ARTIGOS = lista<Artigo & Status>(import.meta.glob("../content/artigos/*.json", { eager: true }));
export const LIVROS = lista<Livro & Status>(import.meta.glob("../content/livros/*.json", { eager: true }));
export const FONTES = lista<Fonte & Status>(import.meta.glob("../content/fontes/*.json", { eager: true }));
export const FEEDS = lista<Feed & Status>(import.meta.glob("../content/feeds/*.json", { eager: true }));
export const APRENDIZADO = lista<Aprendizado & Status>(import.meta.glob("../content/aprendizado/*.json", { eager: true }));
export const LINHA_DO_TEMPO = lista<EventoLinha & Status>(import.meta.glob("../content/linha-do-tempo/*.json", { eager: true }));

/** Fontes agrupadas, na ordem dos grupos: [{ grupo, itens: [[nome, url, descrição]] }]. */
export const FONTES_POR_GRUPO = (() => {
  const grupos = new Map<string, { grupo: string; ordem: number; itens: [string, string, string][] }>();
  for (const f of FONTES) {
    if (!grupos.has(f.grupo)) grupos.set(f.grupo, { grupo: f.grupo, ordem: f.grupo_ordem, itens: [] });
    grupos.get(f.grupo)!.itens.push([f.nome, f.url, f.descricao]);
  }
  return [...grupos.values()].sort((a, b) => a.ordem - b.ordem).map(({ grupo, itens }) => ({ grupo, itens }));
})();

/** Linha do tempo no formato antigo: marcadores de era intercalados com os eventos. */
export const LINHA_COM_ERAS = (() => {
  const out: ({ era: string } | EventoLinha)[] = [];
  let era = "";
  for (const e of LINHA_DO_TEMPO) {
    if (e.era !== era) { era = e.era; out.push({ era }); }
    out.push(e);
  }
  return out;
})();

export { lista };
