// Configuração central do site. Edite aqui, não espalhe valores pelas páginas.

export const SITE = {
  nome: "Harpya",
  lema: "Conhecimento transforma horizontes",
  subtitulo: "Pesquisa aberta",
  descricao:
    "Pesquisa aberta sobre eficiência de LLMs: embeddings, tokens, pesos e busca vetorial. Só entram caminhos com equação, custo e teste refutável.",
  autor: "Carlos Frederico Domínguez",
  assinatura: "Mindscope Labs",
  repositorio: "https://github.com/freddominugez/Harpia-Project",
  // Repositório público desde 12/10/2026: o ícone do GitHub aparece no rodapé.
  repositorioPublico: true,
};

// Verificação de propriedade nos buscadores. Cole só o valor do atributo content da meta
// que o Google Search Console ou o Bing Webmaster Tools mostrar (passo a passo em docs/SEO_GEO.md).
// Vazio: a meta não é gerada. Se a verificação for por DNS (registro TXT), deixe vazio.
export const VERIFICACAO = {
  google: "",
  bing: "",
};

// Fórum: Giscus (GitHub Discussions). Gratuito, sem servidor e sem banco.
// Preencha os quatro campos com os valores gerados em https://giscus.app/pt
// depois de: (1) tornar o repositório público, (2) ativar Discussions,
// (3) instalar o app giscus no repositório. Enquanto "repoId" estiver vazio,
// o site mostra as instruções no lugar do fórum.
export const GISCUS = {
  repo: "freddominugez/Harpia-Project",
  repoId: "R_kgDOVGFL8g",
  categoria: "Caminhos",
  categoriaId: "DIC_kwDOVGFL8s4DIHTO",
  // Categoria usada na página /forum (discussão geral).
  categoriaGeral: "Perguntas",
  categoriaGeralId: "DIC_kwDOVGFL8s4DIHTP",
};

export const giscusConfigurado = () => GISCUS.repoId !== "" && GISCUS.categoriaId !== "";

// Fórum próprio: Waline (código aberto) em forum.harpya.org, banco no Supabase, login por
// e-mail e senha ou Google. Troque "motor" para "waline" quando o servidor estiver no ar
// (passo a passo em docs/FORUM.md). Com "waline", o Giscus sai e o repositório pode ser fechado.
export const FORUM = {
  motor: "giscus" as "giscus" | "waline",
  servidor: "https://forum.harpya.org",
};
export const forumProprio = () => FORUM.motor === "waline";

export type NavItem = { href: string; rotulo: string; icone: string; descricao: string; principal: boolean };

// "principal" aparece na barra do desktop (como na referência aprovada).
// News continua como rota pública: menu móvel, rodapé e busca.
export const NAV: NavItem[] = [
  { href: "/", rotulo: "Início", icone: "home", descricao: "Página inicial do Harpya", principal: true },
  { href: "/comecando/", rotulo: "Começando", icone: "book", descricao: "Série para quem está começando: como uma máquina aprende a falar", principal: false },
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
