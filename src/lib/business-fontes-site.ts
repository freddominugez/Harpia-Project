import { getBusiness, guiaPath, recursoPath } from './business';
import type { GrupoFontes, Referencia } from './fontes-site';

export async function businessFontesDoSite(): Promise<GrupoFontes[]> {
  const { fontes, acervo, guias } = await getBusiness();
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
    add(livro ? 'livros' : 'publicacoes',livro ? 'Livros e edições' : 'Publicações selecionadas',a.data.titulo,a.data.url,`${a.data.autores} · ${livro ? `${a.data.editora}; edição ${a.data.edicao}; ISBN ${a.data.isbn}.` : a.data.evidencia} ${a.data.limites}`,a.data.titulo,recursoPath(a.id));
    for (const url of a.data.referencias) add('referencias','Referências de leitura',url,url,'Referência indicada na ficha publicada.',a.data.titulo,recursoPath(a.id));
  }
  for (const g of guias) for (const url of g.data.fontes) add('referencias','Referências de leitura',url,url,'Fonte indicada no guia didático.',g.data.titulo,guiaPath(g.id));
  return [...grupos.values()];
}
