// Adapta os registros Business publicados aos mesmos componentes do ambiente original.
// Candidatos de pesquisa nunca são promovidos por este adaptador.
import { getBusiness, TRILHAS_BUSINESS, guiaPath, recursoPath, trilhaNome } from './business';
import type { Livro, ReferenciaEditorial } from './conteudo';
import type { Video, Modulo } from './videos';
import type { Noticia, Categoria } from './noticias';
import type { Analise } from '../data/analises';
import type { RadarItem, SourceStatus } from './radar';
import type { ItemForum } from './pautas';

export async function getBusinessPresentation() {
  const { guias, acervo, fontes } = await getBusiness();
  const fonteNome = (id: string) => fontes.find(f => f.id === id)?.data.nome ?? id;
  const referencias = acervo.filter(a => ['artigo', 'relatorio'].includes(a.data.tipo));
  const artigos: ReferenciaEditorial[] = referencias.map(a => ({
    ano: a.data.ano_publicacao ?? (a.data.data ? Number(a.data.data.slice(0, 4)) : null), tipo: a.data.tipo === 'relatorio' ? 'RELATÓRIO' : 'ARTIGO', titulo: a.data.titulo, autores: a.data.autores,
    url: a.data.url, idioma: a.data.idioma, grupo: a.data.trilha,
    selo: 'arte', rotulo: a.data.evidencia,
  }));
  const livros: Livro[] = acervo.filter(a => a.data.tipo === 'livro').map(a => ({
    titulo: a.data.titulo, autores: a.data.autores, nota: a.data.limites,
    uso: a.data.corpo[0]?.replace('Roteiro de estudo do Harpya: ', '') ?? '',
    // A página comercial da editora não é uma edição gratuita para ler online.
    url: '', compra_url: a.data.url, compra_rotulo: 'Consultar na editora',
    cor: 'c2', resenha: a.data.resumo, categoria: a.data.trilha, idioma: a.data.idioma,
  }));
  const modulos: Modulo[] = TRILHAS_BUSINESS.map((t, i) => ({ numero: i, titulo: t.titulo, subtitulo: t.resumo, icone: ['book','brain','network','globe','messages','chart','sigma','file'][i] }));
  const videos: Video[] = acervo.filter(a => a.data.tipo === 'video').map(a => ({
    id: a.data.video_id!, titulo: a.data.titulo,
    canal: fontes.find(f => f.id === a.data.fonte)?.data.canais.find(c => c.id === a.data.channel_id)?.nome ?? fonteNome(a.data.fonte),
    modulo: TRILHAS_BUSINESS.findIndex(t => t.id === a.data.trilha), nivel: a.data.nivel,
    resumo: a.data.resumo, catalogo: null, trilha: a.data.trilha, idioma: a.data.idioma,
  }));
  const categorias: Record<string, Categoria> = { fundamentos: 'mercado', consumidor: 'consumidor', estrategia: 'mercado', marcas: 'mercado', clientes: 'consumidor', crescimento: 'mercado', mensuracao: 'mensuracao', gestao: 'gestao' };
  const noticias: Noticia[] = acervo.filter(a => a.data.tipo === 'noticia').map(a => ({
    slug: a.id, href: recursoPath(a.id), titulo: a.data.titulo, resumo: a.data.resumo,
    data: a.data.data, categoria: categorias[a.data.trilha], icone: 'leitura', corpo: a.data.corpo,
    harpia: a.data.limites, fontes: [{ veiculo: fonteNome(a.data.fonte), titulo: a.data.titulo, url: a.data.url }, ...a.data.referencias.filter(url => url !== a.data.url).map(url => ({ veiculo: 'Referência', titulo: url, url }))],
  }));
  const analises: Analise[] = acervo.filter(a => a.data.tipo === 'analise').map(a => ({
    slug: a.id, href: recursoPath(a.id), titulo: a.data.titulo, titulo_curto: a.data.titulo,
    serie: 'Marketing e administração', parte: 1, total: 1, data: a.data.data,
    resumo: a.data.resumo, corpo: a.data.corpo.join('\n\n'),
  }));
  const radar: RadarItem[] = referencias.filter(a => a.data.data_precisa && a.data.data).map(a => ({
    id: a.id, source_id: a.data.fonte, company: fonteNome(a.data.fonte), title: a.data.titulo,
    summary: a.data.resumo, url: a.data.url, published_at: a.data.data,
    verified_at: a.data.revisado_em, impact_score: 0, topics: [a.data.trilha],
  }));
  const fontesRadar: SourceStatus[] = fontes.filter(f => referencias.some(a => a.data.fonte === f.id)).map(f => ({
    id: f.id, nome: f.data.nome, site: f.data.url, canal: f.data.feed,
    status: 'ok', item_count: referencias.filter(a => a.data.fonte === f.id).length, checked_at: f.data.verificado_em,
  }));
  const pautaTitulos = [
    ['Como formular uma proposta de valor verificável?', 'Fundamentos'],
    ['Quando entrevistas ajudam e quando precisamos de uma amostra?', 'Pesquisa e consumidor'],
    ['Como separar crescimento observado de efeito incremental?', 'Mensuração'],
    ['Que evidências sustentam uma decisão de posicionamento?', 'Estratégia'],
    ['Como avaliar os limites de um caso empresarial?', 'Administração'],
  ];
  const pautas: ItemForum[] = pautaTitulos.map(([titulo, categoria]) => ({ titulo, categoria, iniciais: 'HB', href: '/business/forum/', criada: false, data: '' }));
  const fontesBiblioteca = [{ grupo: 'Marketing e administração', itens: fontes.filter(f => f.data.escopos.includes('artigos')).map(f => [f.data.nome, f.data.url, f.data.descricao] as [string,string,string]) }];
  const destaque = radar[0] ?? null;
  return {
    guias, acervo, artigos, livros, videos, modulos, noticias, analise: analises[0] ?? null, pautas,
    fontesBiblioteca, categoriasLivro: TRILHAS_BUSINESS.map(t => [t.id,t.titulo] as [string,string]),
    trilhas: [
      { titulo: 'Fundamentos de Marketing', resumo: 'Mercado, valor e orientação ao cliente.', icone: 'brain', href: '/business/aprendizado/', meta: 'Conceitos e métodos', metaIcone: 'book', nivel: 'Fundamentos' },
      { titulo: 'Estratégia e Comportamento', resumo: 'Perguntas sobre mercados, marcas e decisões de compra.', icone: 'network', href: '/business/estudos/', meta: `${guias.length} guias`, metaIcone: 'file', nivel: 'Estudo' },
      { titulo: 'Marketing na Prática', resumo: 'Custo, margem, retenção e interpretação de resultados.', icone: 'file', href: '/business/metricas/', meta: 'Métricas e métodos', metaIcone: 'sigma', nivel: 'Equações' },
      { titulo: 'Literatura para Gestão', resumo: 'Referências em marketing, estratégia e administração.', icone: 'sigma', href: '/business/biblioteca/', meta: `${livros.length} livros`, metaIcone: 'book', nivel: 'Referências' },
    ],
    estudos: guias.slice(0,3).map((g,i) => ({ href: guiaPath(g.id), imagem: ['/img/article-geometry.webp','/img/article-forest.webp','/img/article-books.webp'][i], tags: [trilhaNome(g.data.trilha), 'Guia didático'], titulo: g.data.titulo, resumo: g.data.resumo, dataISO: g.data.atualizado })),
    hero: { sufixo: 'ya Business', subtitulo: 'Marketing. Estratégia. Administração.', descricao: 'Um espaço dedicado ao estudo, à pesquisa e à aplicação prática de marketing e administração, com fontes acadêmicas, consultorias e publicações de referência.', estudos: '/business/estudos/', videos: '/business/videos/', citacao: '“Conhecimento a serviço de melhores decisões.”' },
    start: { serie: 'Marketing e administração: por onde começar', lead: 'Do problema do cliente à interpretação dos resultados. Uma sequência de estudo com referências.', artigos: guias.slice(0,4).map(g => ({ numero: g.data.numero, titulo: g.data.titulo, descricao: g.data.resumo, slug: g.id, href: guiaPath(g.id) })) },
    impact: { item: destaque, titulo: destaque?.title ?? '', resumo: destaque?.summary ?? '', motivo: '', chamada: 'Leitura em destaque em Business', sigla: 'M', legenda: 'MERCADOS · PESQUISA · ADMINISTRAÇÃO', cta: 'Ler a publicação original', nota: destaque ? `${referencias.find(a => a.id === destaque.id)!.data.evidencia}. Consulte o método e os limites na fonte original.` : '' },
    editorial: { noticias, analise: analises[0] ?? null, artigos, radar, destaque, fontes: fontesRadar, ultimoSucesso: null, prefixo: '/business', negocios: true },
  };
}
