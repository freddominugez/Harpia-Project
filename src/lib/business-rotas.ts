import type { Rota } from './rotas';
import { getBusiness, SECOES_BUSINESS, businessPath, guiaPath, recursoPath, recursosDaSecao } from './business';
import { markdownEditorial } from '../data/business-editorial';
export async function businessRotas(abs: (path: string) => string): Promise<Rota[]> {
  const { guias, acervo, fontes, canais } = await getBusiness();
  const atualizado = [...guias.map(g => g.data.atualizado), ...acervo.map(a => a.data.revisado_em), ...fontes.map(f => f.data.verificado_em)].sort().at(-1) ?? '2026-11-06';
  const guideList = guias.map(g => `- [${g.data.titulo}](${abs(guiaPath(g.id))}): ${g.data.resumo}`).join('\n');
  const resourceList = (items = acervo) => items.map(a => `- [${a.data.titulo}](${abs(recursoPath(a.id))}): ${a.data.resumo}`).join('\n');
  return [
    ...SECOES_BUSINESS.map(page => ({
      path: businessPath(page.slug), titulo: page.titulo, descricao: page.descricao, secao: 'Harpya Business', atualizado,
      pai: page.slug ? '/business/' : undefined,
      markdown: () => [page.descricao, markdownEditorial(page.slug),
        ['', 'estudos', 'comecando'].includes(page.slug) ? `## Guias de estudo\n\n${guideList}` : '',
        ['', 'biblioteca', 'biblioteca/livros', 'news', 'analises', 'noticias', 'videos'].includes(page.slug) ? `## Leituras selecionadas\n\n${resourceList(page.slug === '' ? acervo : recursosDaSecao(acervo,page.slug))}` : '',
        page.slug === 'biblioteca/fontes' ? fontes.filter(f => f.data.escopos.includes('artigos')).map(f => `- [${f.data.nome}](${f.data.url}): ${f.data.descricao} (${f.data.regiao})`).join('\n') : '',
        page.slug === 'videos' && !recursosDaSecao(acervo,'videos').length ? 'A seleção de vídeos está em revisão. Publicar exige canal confirmado e revisão integral. Candidatos não integram o acervo público.' : '',
        page.slug === 'noticias' && !recursosDaSecao(acervo,'noticias').length ? 'As primeiras matérias aguardam revisão editorial. Leituras selecionadas em /business/news/.' : '',
        page.slug === 'videos/canais' ? canais.length ? canais.map(c => `- [${c.nome}](${c.url}): ${c.instituicao}. [Procedência](${c.procedencia}).`).join('\n') : 'Canais aguardando aprovação editorial.' : '',
        page.slug === 'biblioteca/livros' && !recursosDaSecao(acervo,'biblioteca/livros').length ? 'Seleção bibliográfica aguardando aprovação editorial.' : '',
        page.slug === 'forum' ? 'Fórum identificado por /business/forum/, separado do fórum técnico. Argumente com referências e contexto.' : '',
      ].filter(Boolean).join('\n\n'),
    })),
    ...guias.map(g => ({
      path: guiaPath(g.id), titulo: g.data.titulo, descricao: g.data.resumo, secao: 'Business · Guia de estudo', pai: '/business/estudos/', atualizado: g.data.atualizado,
      markdown: () => `${g.body ?? ''}\n\n## Referências\n\n${g.data.fontes.map(url => `- ${url}`).join('\n')}`,
      schema: () => [{ '@type': 'Article', headline: g.data.titulo, description: g.data.resumo, url: abs(guiaPath(g.id)), inLanguage: 'pt-BR', dateModified: g.data.atualizado, author: { '@type': 'Organization', name: 'Harpya' }, citation: g.data.fontes }],
    })),
    ...acervo.map(a => ({
      path: recursoPath(a.id), titulo: a.data.titulo, descricao: a.data.resumo, secao: `Business · ${a.data.tipo}`, pai: a.data.tipo === 'video' ? '/business/videos/' : '/business/biblioteca/', atualizado: a.data.revisado_em,
      markdown: () => [a.data.resumo, `Autoria: ${a.data.autores}. Natureza: ${a.data.evidencia}. Idioma: ${a.data.idioma}.`,
        a.data.tipo === 'livro' ? `Editora: ${a.data.editora}. Edição: ${a.data.edicao || 'não informada'}. ISBN: ${a.data.isbn || 'não informado'}.` : '',
        a.data.tipo === 'video' ? `Nível: ${a.data.nivel}. Apresentação: ${a.data.palestrante}. Qualificação: ${a.data.credenciais}.` : '',
        ...a.data.corpo, `Limites: ${a.data.limites}`, a.data.justificativa,
        `[Original](${a.data.url})`, a.data.referencias.map(url => `- ${url}`).join('\n'),
        `Curadoria: ${a.data.revisor}, ${a.data.revisado_em}.`,
      ].filter(Boolean).join('\n\n'),
      schema: () => [{ '@type': 'WebPage', name: a.data.titulo, description: a.data.resumo, url: abs(recursoPath(a.id)), citation: [a.data.url,...a.data.referencias],
        ...(a.data.tipo === 'livro' ? { mainEntity: { '@type': 'Book', name: a.data.titulo, author: { '@type': 'Person', name: a.data.autores }, publisher: { '@type': 'Organization', name: a.data.editora }, ...(a.data.edicao ? { bookEdition: a.data.edicao } : {}), ...(a.data.isbn ? { isbn: a.data.isbn } : {}), url: a.data.url } } : {}),
      }],
    })),
  ];
}
