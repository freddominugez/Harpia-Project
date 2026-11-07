import type { Rota } from './rotas';
import { getBusiness, SECOES_BUSINESS, businessPath, guiaPath, recursoPublicadoPath, seriePath, recursosDaSecao } from './business';
import { markdownEditorial } from '../data/business-editorial';
export async function businessRotas(abs: (path: string) => string): Promise<Rota[]> {
  const { guias, acervo, fontes, canais,serie,origens,aprendizado,analises,investigacao } = await getBusiness();
  const atualizado = [...guias.map(g => g.data.atualizado), ...acervo.map(a => a.data.revisado_em), ...fontes.map(f => f.data.verificado_em)].sort().at(-1) ?? '2026-11-06';
  const guideList = guias.map(g => `- [${g.data.titulo}](${abs(guiaPath(g.id))}): ${g.data.resumo}`).join('\n');
  const resourceList = (items = acervo) => items.map(a => `- [${a.data.titulo}](${abs(recursoPublicadoPath(a.id,a.data.tipo))}): ${a.data.resumo}`).join('\n');
  return [
    ...SECOES_BUSINESS.filter(s=>s.slug!=='biblioteca/livros').map(page => ({
      path: businessPath(page.slug), titulo: page.titulo, descricao: page.descricao, secao: 'Harpya Business', atualizado,
      pai: page.slug ? '/business/' : undefined,
      markdown: () => [page.descricao, ['equacoes','biblioteca/glossario','sobre'].includes(page.slug)?markdownEditorial(page.slug==='equacoes'?'metricas':page.slug):'',
        page.slug==='comecando'?serie.map(a=>`- [${a.data.titulo}](${abs(seriePath(a.id))})`).join('\n'):'',
        page.slug==='origens'&&origens?origens.data.capitulos.map(c=>`## ${c.titulo}\n\n${c.abertura}\n\n${c.eclipses.map(x=>`### ${x.titulo}\n\n${x.texto.join('\n\n')}`).join('\n\n')}\n\n${c.refs.map(r=>`- [${r.texto}](${r.url})`).join('\n')}`).join('\n\n')+'\n\n## Créditos dos retratos\n\n'+origens.data.pessoas.filter(p=>p.fonte).map(p=>`- ${p.nome}: [${p.credito}](${p.fonte}); [${p.licenca}](${p.licenca_url}).`).join('\n'):'',
        page.slug==='aprendizado'?aprendizado.map(x=>`## ${x.data.titulo}\n\n${x.data.texto}\n\n${[x.data.contexto,x.data.mecanismo,...x.data.equacoes.map(e=>`$$\n${e.tex}\n$$\n\n${e.texto}`),x.data.exemplo,x.data.limites,x.data.legado,x.data.hoje].join('\n\n')}\n\n${x.data.referencias.map(r=>`- [${r.texto}](${r.url}): ${r.consultado} ${r.limites}`).join('\n')}`).join('\n\n'):'',
        ['', 'estudos'].includes(page.slug) ? `## Guias de estudo\n\n${guideList}` : '',
        ['', 'biblioteca', 'biblioteca/livros', 'news', 'analises', 'noticias', 'videos'].includes(page.slug) ? `## Leituras selecionadas\n\n${resourceList(page.slug === '' ? acervo : recursosDaSecao(acervo,page.slug))}` : '',
        page.slug === 'biblioteca/fontes' ? fontes.filter(f => f.data.escopos.includes('artigos')).map(f => `- [${f.data.nome}](${f.data.url}): ${f.data.descricao} (${f.data.regiao})`).join('\n') : '',
        page.slug === 'videos' && !recursosDaSecao(acervo,'videos').length ? 'Nenhum vídeo selecionado para publicação. Candidatos não integram o acervo público.' : '',
        page.slug === 'analises' ? analises.map(a=>`- [${a.data.titulo}](${abs(`/business/analises/${a.id}/`)})`).join('\n'):'',
        page.slug === 'noticias' && !recursosDaSecao(acervo,'noticias').length ? 'As primeiras matérias aguardam revisão editorial. Leituras selecionadas em /business/news/.' : '',
        page.slug === 'videos/canais' ? canais.length ? canais.map(c => `- [${c.nome}](${c.url}): ${c.instituicao}. [Procedência](${c.procedencia}).`).join('\n') : 'Canais aguardando aprovação editorial.' : '',
        page.slug === 'forum' ? 'Fórum identificado por /business/forum/, separado do fórum técnico. Argumente com referências e contexto.' : '',
      ].filter(Boolean).join('\n\n'),
    })),
    ...analises.map(a=>({path:`/business/analises/${a.id}/`,titulo:a.data.titulo,descricao:a.data.resumo,secao:'Business · Análise',pai:'/business/analises/',atualizado:a.data.atualizado,markdown:()=>a.body??'',schema:()=>[{'@type':'Article',headline:a.data.titulo,description:a.data.resumo,url:abs(`/business/analises/${a.id}/`),inLanguage:'pt-BR',dateModified:a.data.atualizado,author:{'@type':'Organization',name:a.data.autor},citation:a.data.fontes}]})),
    ...(investigacao ? [
      {path:'/business/estudos/a-ideia-mais-interessante/',titulo:investigacao.data.titulo,descricao:investigacao.data.resumo,secao:'Business · Investigação didática',pai:'/business/estudos/',atualizado:investigacao.data.atualizado,markdown:()=>investigacao.data.secoes.map(s=>`## ${s.titulo}\n\n${s.paragrafos.join('\n\n')}`).join('\n\n')+'\n\n## Fontes\n\n'+investigacao.data.fontes.map(f=>`- [${f.titulo}](${f.url}): ${f.consultado} ${f.limites}`).join('\n')},
      {path:'/business/estudos/arquivados/',titulo:'Arquivados',descricao:'Propostas de medição avaliadas conceitualmente, sem experimentos executados.',secao:'Business · Estudos',pai:'/business/estudos/',atualizado:investigacao.data.atualizado,markdown:()=>investigacao.data.arquivados.map(x=>`## ${x.titulo}\n\n${x.proposta}\n\n${x.motivo}\n\nReabrir se: ${x.reabrir_se}\n\n[Referência](${x.referencia.url})`).join('\n\n')},
    ]:[]),
    ...serie.map(a=>({path:seriePath(a.id),titulo:a.data.titulo,descricao:a.data.resumo,secao:'Business · Começando',pai:'/business/comecando/',atualizado:a.data.atualizado,
      markdown:()=>a.data.secoes.map((s,i)=>`## ${s.titulo}\n\n${s.paragrafos.join('\n\n')}\n\n${a.data.figuras.filter(f=>f.apos_secao===i+1).map(f=>`**Figura: ${f.titulo}.** ${f.descricao} ${f.etapas.join('; ')}. ${f.legenda}`).join('\n\n')}`).join('\n\n')+'\n\n## Referências\n\n'+a.data.fontes.map(f=>`- [${f.titulo}](${f.url}): ${f.consultado} ${f.limites}`).join('\n'),
      schema:()=>[{'@type':'Article',headline:a.data.titulo,description:a.data.resumo,url:abs(seriePath(a.id)),inLanguage:'pt-BR',dateModified:a.data.atualizado,author:{'@type':'Organization',name:a.data.autor},citation:a.data.fontes.map(f=>f.url)}],
    })),
    ...guias.map(g => ({
      path: guiaPath(g.id), titulo: g.data.titulo, descricao: g.data.resumo, secao: 'Business · Guia de estudo', pai: '/business/estudos/', atualizado: g.data.atualizado,
      markdown: () => `${g.body ?? ''}\n\n## Plano de investigação\n\n${g.data.mecanismo}\n\nPróximo teste proposto: ${g.data.proximo_teste}\n\nRever ou interromper se: ${g.data.parar_se}\n\n## Fontes do cadastro\n\n${g.data.fontes.map(url => `- ${url}`).join('\n')}`,
      schema: () => [{ '@type': 'Article', headline: g.data.titulo, description: g.data.resumo, url: abs(guiaPath(g.id)), inLanguage: 'pt-BR', dateModified: g.data.atualizado, author: { '@type': 'Organization', name: 'Harpya' }, citation: g.data.fontes }],
    })),
    ...acervo.map(a => ({
      path: recursoPublicadoPath(a.id,a.data.tipo), titulo: a.data.titulo, descricao: a.data.resumo, secao: `Business · ${a.data.tipo}`, pai: a.data.tipo === 'noticia' ? '/business/noticias/' : a.data.tipo === 'video' ? '/business/videos/' : '/business/biblioteca/', atualizado: a.data.revisado_em,
      markdown: () => [a.data.resumo, `Autoria: ${a.data.autores}. Natureza: ${a.data.evidencia}. Idioma: ${a.data.idioma}.`,
        a.data.tipo === 'livro' ? `Editora: ${a.data.editora}. Edição: ${a.data.edicao || 'não informada'}. ISBN: ${a.data.isbn || 'não informado'}. Formato: ${a.data.formato_isbn || 'não confirmado'}.` : '',
        a.data.tipo === 'video' ? `Nível: ${a.data.nivel}. Apresentação: ${a.data.palestrante}. Qualificação: ${a.data.credenciais}.` : '',
        ...a.data.corpo, `Limites: ${a.data.limites}`, a.data.justificativa,
        `[Original](${a.data.url})`, a.data.referencias.map(url => `- ${url}`).join('\n'),
        `Curadoria: ${a.data.revisor}, ${a.data.revisado_em}.`,
      ].filter(Boolean).join('\n\n'),
      schema: () => [{ '@type': 'WebPage', name: a.data.titulo, description: a.data.resumo, url: abs(recursoPublicadoPath(a.id,a.data.tipo)), citation: [a.data.url,...a.data.referencias],
        ...(a.data.tipo === 'livro' ? { mainEntity: { '@type': 'Book', name: a.data.titulo, author: { '@type': 'Person', name: a.data.autores }, publisher: { '@type': 'Organization', name: a.data.editora }, ...(a.data.edicao ? { bookEdition: a.data.edicao } : {}), ...(a.data.isbn ? { isbn: a.data.isbn } : {}), url: a.data.url } } : {}),
      }],
    })),
  ];
}
