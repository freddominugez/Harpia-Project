// Seção "Começando": série "Como uma máquina aprende a falar", de Carlos Frederico Domínguez.
// Cada artigo é publicado como o autor entregou (HTML e SVG próprios), em src/artigos/comecando/.
// Artigo novo: salve o conteúdo de <main> em src/artigos/comecando/<slug>.html e acrescente aqui.
export const SERIE = "Como uma máquina aprende a falar";
export const TOTAL_DA_SERIE = 10;

export type ArtigoSerie = { numero: number; slug: string; titulo: string; descricao: string; data: string };

export const COMECANDO: ArtigoSerie[] = [
  {
    numero: 2,
    slug: "tokens",
    titulo: "Tokens: o modelo não lê palavras",
    descricao: "Como o BPE corta o texto em tokens, por que o português custa cerca de 30% mais que o inglês e de onde vêm os erros de contar letras.",
    data: "2026-10-12",
  },
  {
    numero: 3,
    slug: "corpus",
    titulo: "Corpus: a única fonte de verdade",
    descricao: "De onde vem o que um modelo sabe: como o corpus é filtrado, deduplicado e misturado, e por que isso decide o que ele acerta e erra.",
    data: "2026-10-12",
  },
  {
    numero: 4,
    slug: "significado-vira-espaco",
    titulo: "Significado vira espaço",
    descricao: "Como significado vira posição num espaço de milhares de dimensões, do word2vec ao transformer, e o que a distância entre vetores não mede.",
    data: "2026-10-12",
  },
];

const html = import.meta.glob("../artigos/comecando/*.html", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
export const corpoDe = (slug: string) => html[`../artigos/comecando/${slug}.html`] ?? "";
