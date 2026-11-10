import {EDITORIAL_BUSINESS} from '../data/business-editorial';
import { getBusiness, guiaPath, recursoPublicadoPath, seriePath } from './business';
import type { GrupoFontes, Referencia } from './fontes-site';

export async function businessFontesDoSite(): Promise<GrupoFontes[]> {
  const { fontes, acervo, guias,serie,origens,aprendizado,analises,investigacao } = await getBusiness();
  const grupos = new Map<string, GrupoFontes>();
  const urls = new Map<string, Referencia>();
  const add = (id: string, titulo: string, nome: string, url: string, credito: string, pagina: string, href: string) => {
    const canonical = new URL(url).href;
    let item = urls.get(canonical);
    if (!item) {
      item = { nome, url: canonical, credito, paginas: [] };
      if (!grupos.has(id)) grupos.set(id, { id, titulo, itens: [] });
      grupos.get(id)!.itens.push(item); urls.set(canonical, item);
    }
    if (href && !item.paginas.some(p => p.href === href)) item.paginas.push({ titulo: pagina, href });
  };
  for (const f of fontes) {
    add('instituicoes', 'Instituições e editoras', f.data.nome, f.data.url, f.data.descricao, 'Fontes de referência', '/business/biblioteca/fontes/');
    for (const c of f.data.canais.filter(c => c.status === 'aprovado')) {
      add('canais','Canais institucionais',c.nome,c.url,`Channel ID: ${c.id}; conferido em ${c.verificado_em}.`, 'Canais de vídeo','/business/videos/canais/');
      add('canais','Canais institucionais',`${c.nome} · procedência`,c.procedencia,'Referência da instituição.', 'Canais de vídeo','/business/videos/canais/');
    }
  }
  for (const a of acervo) {
    const livro = a.data.tipo === 'livro';
    add(livro ? 'livros' : 'publicacoes',livro ? 'Livros e edições' : 'Publicações selecionadas',a.data.titulo,a.data.url,`${a.data.autores} · ${livro ? `${a.data.editora}; edição ${a.data.edicao}; ISBN ${a.data.isbn}.` : a.data.evidencia} ${a.data.limites}`,a.data.titulo,recursoPublicadoPath(a.id,a.data.tipo));
    for (const url of a.data.referencias) add('referencias','Referências de leitura',url,url,'Referência indicada na ficha publicada.',a.data.titulo,recursoPublicadoPath(a.id,a.data.tipo));
  }
  if(origens)for(const p of origens.data.pessoas)if(p.fonte){add('imagens','Imagens e créditos',`Retrato de ${p.nome}`,p.fonte,`${p.credito} · ${p.licenca}`, 'Origens','/business/origens/');if(p.licenca_url)add('imagens','Imagens e créditos',`Licença do retrato de ${p.nome}`,p.licenca_url,p.licenca??'', 'Origens','/business/origens/');}
  for (const g of guias) for (const url of g.data.fontes) add('referencias','Referências de leitura',url,url,'Fonte indicada no guia didático.',g.data.titulo,guiaPath(g.id));
  for(const a of serie)for(const f of a.data.fontes)add('referencias','Referências de leitura',f.titulo,f.url,`${f.consultado} ${f.limites}`,a.data.titulo,seriePath(a.id));
  if(origens)for(const c of origens.data.capitulos)for(const f of c.refs)add('historia','História e contextos',f.texto,f.url,'Referência documental; alcance da consulta registrado na pesquisa editorial.',c.titulo,`/business/origens/#${c.id}`);
  for(const a of aprendizado)for(const f of a.data.referencias)add('metodos','Conceitos e métodos',f.texto,f.url,`${f.consultado} ${f.limites}`,a.data.titulo,'/business/aprendizado/');
  for(const a of analises)for(const url of a.data.fontes)add('referencias','Referências de leitura',url,url,'Fonte da análise autoral; alcance indicado no artigo.',a.data.titulo,`/business/analises/${a.id}/`);
  if(investigacao)for(const f of investigacao.data.fontes)add('referencias','Referências de leitura',f.titulo,f.url,`${f.consultado} ${f.limites}`,investigacao.data.titulo,'/business/estudos/a-ideia-mais-interessante/');
  for(const [secao,blocos] of Object.entries(EDITORIAL_BUSINESS))for(const [i,b] of blocos.entries())for(const r of b.referencias??[])add('metodos','Conceitos e métodos',r.titulo,r.url,`${r.alcance} ${r.limites}`,b.titulo,`/business/${secao==='metricas'?'equacoes':secao}/#secao-${i+1}`);
  return [...grupos.values()];
}
