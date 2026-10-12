// Configuração central do site. Edite aqui, não espalhe valores pelas páginas.

export const SITE = {
  nome: "Harpya",
  lema: "Conhecimento transforma horizontes",
  subtitulo: "Pesquisa aberta",
  descricao:
    "Pesquisa aberta sobre eficiência de LLMs: embeddings, tokens, pesos e busca vetorial. Só entram caminhos com equação, custo e teste refutável.",
  autor: "Carlos Frederico Domínguez",
  assinatura: "Apps by Vulcan",
  assinaturaUrl: "https://byvulcan.com",
  repositorio: "https://github.com/freddominugez/harpia-project",
  // O repositório ainda é privado. Mude para true quando ele for público:
  // o ícone do GitHub aparece no rodapé e os links passam a funcionar para visitantes.
  repositorioPublico: false,
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

export type NavItem = { href: string; rotulo: string; icone: string; descricao: string; principal: boolean };

// "principal" aparece na barra do desktop (como na referência aprovada).
// News continua como rota pública: menu móvel, rodapé e busca.
export const NAV: NavItem[] = [
  { href: "/", rotulo: "Início", icone: "home", descricao: "Página inicial do Harpya", principal: true },
  { href: "/origens/", rotulo: "Origens", icone: "globe", descricao: "Linha do tempo das LLMs", principal: true },
  { href: "/aprendizado/", rotulo: "Aprendizado de Máquina", icone: "brain", descricao: "As primeiras tentativas de fazer a máquina aprender", principal: true },
  { href: "/videos/", rotulo: "Vídeos", icone: "play", descricao: "Curadoria de matemática, redes neurais e LLMs", principal: true },
  { href: "/estudos/", rotulo: "Estudos", icone: "file", descricao: "Os 12 caminhos válidos de pesquisa", principal: true },
  { href: "/equacoes/", rotulo: "Equações", icone: "sigma", descricao: "As 16 camadas de um LLM e suas equações", principal: true },
  { href: "/biblioteca/", rotulo: "Biblioteca", icone: "book", descricao: "Livros, artigos acadêmicos e fontes", principal: true },
  { href: "/news/", rotulo: "News", icone: "rss", descricao: "Radar de publicações por RSS", principal: false },
  { href: "/forum/", rotulo: "Fórum", icone: "messages", descricao: "Discussões via GitHub Discussions", principal: true },
  { href: "/sobre/", rotulo: "Sobre", icone: "info", descricao: "Autoria, método e licença", principal: true },
];
