// Conteúdo editorial da página inicial, separado dos componentes.
// Os números vêm do inventário real do site (coleções e JSONs), nunca de métricas de demonstração.
import livros from "./livros.json";
import artigos from "./artigos.json";
import videos from "./videos.json";
import ml from "./ml.json";

export type Kpi = { valor: string; rotulo: string; detalhe: string; icone: string; href: string };
export type Trilha = { titulo: string; resumo: string; icone: string; href: string; meta: string; metaIcone: string; nivel: string };
export type ArtigoDestaque = { slug: string; imagem: string; tags: string[] };
export type TopicoForum = { titulo: string; iniciais: string; categoria: string; href: string };

// Camadas documentadas em /equacoes/ (seções 1 a 16).
export const CAMADAS = 16;

export function kpis(nCaminhos: number): Kpi[] {
  return [
    { valor: String(nCaminhos), rotulo: "Caminhos de pesquisa", detalhe: "Mecanismos com teste refutável", icone: "file", href: "/estudos/" },
    { valor: String(CAMADAS), rotulo: "Camadas de LLM", detalhe: "Equações e custo de cada etapa", icone: "network", href: "/equacoes/" },
    { valor: `${livros.length} + ${artigos.length}`, rotulo: "Livros e artigos", detalhe: "Referências do acervo", icone: "book", href: "/biblioteca/" },
    { valor: String(videos.length), rotulo: "Vídeos curados", detalhe: "Matemática, redes e LLMs", icone: "chart", href: "/videos/" },
  ];
}

export function trilhas(nCaminhos: number): Trilha[] {
  return [
    { titulo: "Fundamentos de Aprendizado de Máquina", resumo: "Hebb, perceptron e as primeiras regras de aprendizagem.", icone: "brain", href: "/aprendizado/", meta: `${ml.length} marcos`, metaIcone: "book", nivel: "Histórico" },
    { titulo: "Embeddings e Representações Vetoriais", resumo: "Índices, vetores, poda exata e limites de quantização.", icone: "network", href: "/estudos/", meta: `${nCaminhos} caminhos`, metaIcone: "file", nivel: "Pesquisa" },
    { titulo: "LLMs na Prática", resumo: "Tokens, atenção, cache, cabeça de saída e eficiência.", icone: "file", href: "/equacoes/", meta: `${CAMADAS} camadas`, metaIcone: "sigma", nivel: "Equações" },
    { titulo: "Matemática para IA", resumo: "Álgebra linear, probabilidade e otimização.", icone: "sigma", href: "/biblioteca/", meta: `${livros.length} livros`, metaIcone: "book", nivel: "Referências" },
  ];
}

// Três estudos reais com imagens editoriais ilustrativas (não são dados nem figuras dos experimentos).
export const ARTIGOS_DESTAQUE: ArtigoDestaque[] = [
  { slug: "certificado-inteiro", imagem: "/img/article-geometry.webp", tags: ["Pesquisa"] },
  { slug: "escala-diagonal", imagem: "/img/article-forest.webp", tags: ["Resultado"] },
  { slug: "raio-probabilistico", imagem: "/img/article-books.webp", tags: ["Teoria"] },
];

// Vídeo real da curadoria (src/data/videos.json).
export const VIDEO_DESTAQUE = {
  id: "wjZofJX0v4M",
  poster: "/img/video-destaque.webp",
  resumo: "Uma introdução visual ao mecanismo central das arquiteturas de linguagem.",
};

// Pautas propostas pelo projeto enquanto o fórum (Giscus) não está ativo.
// Não são discussões existentes e aparecem identificadas como propostas.
export const TOPICOS_PROPOSTOS: TopicoForum[] = [
  { titulo: "Quantos bits ler na primeira passagem?", iniciais: "CI", categoria: "Caminhos", href: "/estudos/caminhos/certificado-inteiro/" },
  { titulo: "Escala diagonal sob rotação aleatória", iniciais: "ED", categoria: "Resultados", href: "/estudos/caminhos/escala-diagonal/" },
  { titulo: "Como calibrar o raio probabilístico?", iniciais: "RP", categoria: "Perguntas", href: "/estudos/caminhos/raio-probabilistico/" },
  { titulo: "Comparações justas para Tensor-Train", iniciais: "TT", categoria: "Propostas", href: "/estudos/caminhos/tensor-train-na-cabeca/" },
  { titulo: "Controle por Bellman e regra de parada", iniciais: "BL", categoria: "Caminhos", href: "/estudos/caminhos/controle-bellman/" },
];
