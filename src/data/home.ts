// Conteúdo editorial da página inicial, separado dos componentes.
// Os números vêm do inventário real do site (coleções e JSONs), nunca de métricas de demonstração.
import { LIVROS as livros, ARTIGOS as artigos, APRENDIZADO as ml } from "../lib/conteudo";
import { VIDEOS as videos, MODULOS } from "../lib/videos";

export type Kpi = { valor: string; rotulo: string; detalhe: string; icone: string; href: string };
export type Trilha = { titulo: string; resumo: string; icone: string; href: string; meta: string; metaIcone: string; nivel: string };
export type ArtigoDestaque = { slug: string; imagem: string; previa: string };

// Camadas documentadas em /equacoes/ (seções 1 a 16).
export const CAMADAS = 16;

export function kpis(nCaminhos: number): Kpi[] {
  return [
    { valor: String(nCaminhos), rotulo: "Caminhos de pesquisa", detalhe: "Mecanismos com teste refutável", icone: "file", href: "/estudos/" },
    { valor: String(CAMADAS), rotulo: "Camadas de LLM", detalhe: "Equações e custo de cada etapa", icone: "network", href: "/equacoes/" },
    { valor: `${livros.length} + ${artigos.length}`, rotulo: "Livros e artigos", detalhe: "Referências do acervo", icone: "book", href: "/biblioteca/" },
    { valor: String(videos.length), rotulo: "Vídeos curados", detalhe: `${MODULOS.length} módulos, 3 níveis, com resumo`, icone: "chart", href: "/videos/" },
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
  { slug: "certificado-inteiro", imagem: "/img/article-geometry.webp", previa: "A busca lê primeiro os bits altos de cada vetor e calcula um limite para sua pontuação. Só os candidatos que ainda podem vencer recebem uma leitura completa. O estudo examina quando essa estratégia reduz bytes lidos e quais condições preservam a exatidão sobre a tabela quantizada." },
  { slug: "escala-diagonal", imagem: "/img/article-forest.webp", previa: "Centralizar a tabela e ajustar a escala de cada coluna mudou a quantidade de candidatos que sobrevivem à primeira passagem. O estudo apresenta os resultados locais, explica por que a ordenação é preservada e distingue a redução de candidatos de um ganho efetivo de latência." },
  { slug: "raio-probabilistico", imagem: "/img/article-books.webp", previa: "Um limite probabilístico pode ser mais estreito que o limite determinístico, permitindo refinar menos candidatos. O caminho investiga as hipóteses necessárias para essa troca e mostra por que o risco de uma consulta inteira precisa incluir todos os candidatos e etapas, não apenas uma comparação." },
];

