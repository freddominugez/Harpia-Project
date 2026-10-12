// Configuração central do site. Edite aqui, não espalhe valores pelas páginas.

export const SITE = {
  nome: "Harpya",
  lema: "Conhecimento transforma horizontes",
  descricao:
    "Pesquisa aberta sobre eficiência de LLMs: embeddings, tokens, pesos e busca vetorial. Só entram caminhos com equação, custo e teste refutável.",
  autor: "Carlos Frederico Domínguez",
  assinatura: "Apps by Vulcan",
  assinaturaUrl: "https://byvulcan.com",
  repositorio: "https://github.com/freddominugez/harpia-project",
};

// Fórum: Giscus (GitHub Discussions). Gratuito, sem servidor e sem banco.
// Preencha os quatro campos com os valores gerados em https://giscus.app/pt
// depois de: (1) tornar o repositório público, (2) ativar Discussions,
// (3) instalar o app giscus no repositório. Enquanto "repoId" estiver vazio,
// o site mostra as instruções no lugar do fórum.
export const GISCUS = {
  repo: "freddominugez/harpia-project",
  repoId: "",
  categoria: "Caminhos",
  categoriaId: "",
  // Categoria usada na página /forum (discussão geral).
  categoriaGeral: "Perguntas",
  categoriaGeralId: "",
};

export const giscusConfigurado = () => GISCUS.repoId !== "" && GISCUS.categoriaId !== "";

export const NAV = [
  { href: "/", rotulo: "Início" },
  { href: "/origens/", rotulo: "Origens" },
  { href: "/aprendizado/", rotulo: "Aprendizado de Máquina" },
  { href: "/videos/", rotulo: "Vídeos" },
  { href: "/estudos/", rotulo: "Estudos" },
  { href: "/equacoes/", rotulo: "Equações" },
  { href: "/biblioteca/", rotulo: "Biblioteca" },
  { href: "/news/", rotulo: "News" },
  { href: "/forum/", rotulo: "Fórum" },
  { href: "/sobre/", rotulo: "Sobre" },
];
