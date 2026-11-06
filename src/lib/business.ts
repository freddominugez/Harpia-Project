import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { NAV } from '../config';

export const TRILHAS_BUSINESS = [
  { id: 'fundamentos', titulo: 'Fundamentos de marketing', resumo: 'Mercado, valor e orientação ao cliente.' },
  { id: 'consumidor', titulo: 'Pesquisa e consumidor', resumo: 'Comportamento, amostras e métodos de pesquisa.' },
  { id: 'estrategia', titulo: 'Estratégia e posicionamento', resumo: 'Segmentação, concorrência e escolhas de mercado.' },
  { id: 'marcas', titulo: 'Marcas e comunicação', resumo: 'Branding, reputação e promessas consistentes.' },
  { id: 'clientes', titulo: 'Experiência e relacionamento', resumo: 'Escuta, retenção e melhoria da entrega.' },
  { id: 'crescimento', titulo: 'Crescimento, pricing e B2B', resumo: 'Preço, margem, canais e decisões de compra.' },
  { id: 'mensuracao', titulo: 'Mensuração e experimentos', resumo: 'Incrementalidade, atribuição e retorno.' },
  { id: 'gestao', titulo: 'Administração e inovação', resumo: 'Organização, pessoas e IA em marketing.' },
] as const;
export const SECOES_BUSINESS = [
  { slug: '', titulo: 'Harpya Business', descricao: 'Marketing, estratégia e administração com pesquisa, curadoria e fontes de referência.', nav: 'Início', principal: true },
  { slug: 'comecando', titulo: 'Começando em marketing e gestão', descricao: 'Uma sequência de oito guias para estudar mercado, consumidor, estratégia e mensuração.', nav: 'Começando', principal: false },
  { slug: 'origens', titulo: 'Origens do marketing e da administração', descricao: 'Conceitos, obras e perguntas que formaram as escolas de marketing e gestão.', nav: 'Origens', principal: false },
  { slug: 'aprendizado', titulo: 'Aprendizado em marketing', descricao: 'Como estudar, formular hipóteses, avaliar evidências e aprender com decisões.', nav: 'Aprendizado', principal: false },
  { slug: 'estudos', titulo: 'Trilhas de estudo em Business', descricao: 'Oito percursos de estudo em marketing, estratégia e administração.', nav: 'Estudos', principal: true },
  { slug: 'videos', titulo: 'Vídeos de marketing e gestão', descricao: 'Aulas e conferências de fontes institucionais, com procedência e revisão editorial.', nav: 'Vídeos', principal: true },
  { slug: 'videos/canais', titulo: 'Canais de vídeo em Business', descricao: 'Canais institucionais conferidos e aprovados para a curadoria de marketing e administração.', nav: 'Canais de vídeo', principal: false },
  { slug: 'biblioteca', titulo: 'Biblioteca Business', descricao: 'Leituras selecionadas de marketing, comportamento, marcas e gestão, com limites e links ao original.', nav: 'Biblioteca', principal: true },
  { slug: 'biblioteca/livros', titulo: 'Literatura de marketing e administração', descricao: 'Obras de referência com autoria, editora, edição e acesso legal para aprofundar o estudo.', nav: 'Livros', principal: false },
  { slug: 'biblioteca/fontes', titulo: 'Fontes de referência em Business', descricao: 'Instituições acadêmicas, consultorias e publicações do Brasil, dos Estados Unidos e da Europa.', nav: 'Fontes', principal: false },
  { slug: 'biblioteca/glossario', titulo: 'Glossário de marketing e gestão', descricao: 'Definições para acompanhar as trilhas de marketing, estratégia e mensuração.', nav: 'Glossário', principal: false },
  { slug: 'metricas', titulo: 'Métricas e métodos de marketing', descricao: 'Contas, pressupostos e limites de CAC, CLV, margem, retorno e incrementalidade.', nav: 'Métricas', principal: true },
  { slug: 'analises', titulo: 'Análises em Business', descricao: 'Leitura crítica de perguntas, métodos e resultados em marketing e gestão.', nav: 'Análises', principal: false },
  { slug: 'noticias', titulo: 'Notícias de marketing e negócios', descricao: 'Matérias de marketing e administração publicadas após revisão de fontes e evidências.', nav: 'Notícias', principal: true },
  { slug: 'news', titulo: 'Radar de publicações Business', descricao: 'Publicações selecionadas e acesso às editorias das fontes de referência.', nav: 'Radar', principal: false },
  { slug: 'forum', titulo: 'Comunidade Harpya Business', descricao: 'Perguntas, estudos de caso e debates sobre marketing e administração, com referências.', nav: 'Fórum', principal: true },
  { slug: 'sobre', titulo: 'Sobre o Harpya Business', descricao: 'O método editorial, os critérios de curadoria e a organização do ambiente de marketing e administração.', nav: 'Sobre', principal: false },
] as const;
export const businessPath = (slug = '') => `/business/${slug ? `${slug}/` : ''}`;
// Mesma ordem, ícones e visibilidade do menu original. Rotas auxiliares continuam acessíveis.
export const BUSINESS_NAV = [
  ...NAV.map(item => {
    const slug = item.href === '/' ? '' : item.href.replace(/^\/|\/$/g, '') === 'equacoes' ? 'metricas' : item.href.replace(/^\/|\/$/g, '');
    const secao = SECOES_BUSINESS.find(s => s.slug === slug)!;
    return { ...item, href: businessPath(slug), rotulo: secao.nav, descricao: secao.descricao };
  }),
  ...SECOES_BUSINESS.filter(s => !['', 'analises', 'comecando', 'origens', 'aprendizado', 'videos', 'estudos', 'metricas', 'biblioteca', 'noticias', 'news', 'forum', 'sobre'].includes(s.slug)).map(s => ({ href: businessPath(s.slug), rotulo: s.nav, descricao: s.descricao, icone: 'book', principal: false })),
];
export const guiaPath = (slug: string) => businessPath(`estudos/${slug}`);
export const recursoPath = (slug: string) => businessPath(`leituras/${slug}`);
export const trilhaNome = (id: string) => TRILHAS_BUSINESS.find(t => t.id === id)?.titulo ?? id;
export function recursosDaSecao(acervo: BusinessResource[], secao: string) {
  const tipos: Record<string, string[]> = {
    biblioteca: ['artigo', 'livro', 'relatorio', 'webinar'], 'biblioteca/livros': ['livro'],
    news: ['artigo', 'relatorio', 'webinar'], analises: ['analise'], noticias: ['noticia'], videos: ['video'],
  };
  return acervo.filter(item => tipos[secao]?.includes(item.data.tipo));
}

export async function getBusiness() {
  const [allGuias, allAcervo, allFontes] = await Promise.all([getCollection('businessGuias'), getCollection('businessAcervo'), getCollection('businessFontes')]);
  const fontes = allFontes.filter(f => f.data.status === 'aprovado').sort((a,b) => a.data.nome.localeCompare(b.data.nome));
  const allowed = new Map(fontes.map(f => [f.id, f.data]));
  const acervo = allAcervo.filter(item => {
    if (item.data.status !== 'publicado') return false;
    const source = allowed.get(item.data.fonte);
    if (!source) throw new Error(`Fonte não aprovada no acervo Business: ${item.id}`);
    const url = new URL(item.data.url);
    if (item.data.tipo === 'video') {
      if (!source.escopos.includes('videos') || url.hostname !== 'www.youtube.com' || url.pathname !== '/watch' || url.searchParams.get('v') !== item.data.video_id || !source.canais.some(c => c.id === item.data.channel_id && c.status === 'aprovado')) throw new Error(`Vídeo sem canal institucional aprovado: ${item.id}`);
      return true;
    }
    if (!source.escopos.includes(item.data.tipo === 'livro' ? 'livros' : 'artigos')) throw new Error(`Formato fora do escopo da fonte Business: ${item.id}`);
    if (!source.hosts.includes(url.hostname)) throw new Error(`Domínio fora da lista da fonte Business: ${item.id}`);
    return true;
  }).sort((a,b) => b.data.data.localeCompare(a.data.data));
  const guias = allGuias.filter(g => g.data.status === 'publicado').sort((a,b) => a.data.numero - b.data.numero);
  const canais = fontes.flatMap(f => f.data.canais.filter(c => c.status === 'aprovado').map(c => ({ ...c, fonte: f.id, instituicao: f.data.nome })));
  return { guias, acervo, fontes, canais };
}
export type BusinessResource = CollectionEntry<'businessAcervo'>;
