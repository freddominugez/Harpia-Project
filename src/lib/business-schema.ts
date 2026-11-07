import { z } from 'astro:content';
export const businessStatus = z.enum(['candidato', 'em-revisao', 'aprovado', 'publicado', 'rejeitado', 'arquivado']);
export const businessTrilha = z.enum(['fundamentos', 'consumidor', 'estrategia', 'marcas', 'clientes', 'crescimento', 'mensuracao', 'gestao']);
const https = z.string().url().refine(value => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; } }, 'URL HTTPS sem credenciais');
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const canal = z.object({
  id: z.string().regex(/^UC[A-Za-z0-9_-]{22}$/), nome: z.string().min(2), url: https,
  procedencia: https, status: z.enum(['proposto', 'aprovado', 'suspenso']), verificado_em: data,
}).refine(value => value.url === `https://www.youtube.com/channel/${value.id}`, 'O endereço deve corresponder ao Channel ID institucional.');
export const businessFonteSchema = z.object({
  nome: z.string(), url: https, regiao: z.string(), tipo: z.enum(['academica', 'consultoria', 'publicacao-executiva', 'pesquisa-mercado', 'jornalismo', 'editora']), descricao: z.string(), restricao: z.string().default(''), idioma: z.enum(['pt', 'en', 'es']), hosts: z.array(z.string()).min(1), canais: z.array(canal).default([]), escopos: z.array(z.enum(['artigos', 'videos', 'livros'])).default(['artigos']), feed: https.or(z.literal('')), status: z.enum(['aprovado', 'suspenso']), verificado_em: data,
});
export const businessGuiaSchema = z.object({ titulo: z.string(), resumo: z.string().min(30), numero: z.number().int().min(1), trilha: businessTrilha, status: businessStatus, atualizado: data, fontes: z.array(https).min(1), mecanismo:z.string().default(''), equacao:z.string().default(''), proximo_teste:z.string().default(''), parar_se:z.string().default('') });
export const businessAcervoSchema = z.object({
  titulo: z.string().min(5), resumo: z.string().min(20), fonte: z.string(), url: https,
  tipo: z.enum(['artigo', 'livro', 'relatorio', 'video', 'noticia', 'analise', 'webinar']), trilha: businessTrilha,
  autores: z.string().min(2), data: data.or(z.literal('')), data_precisa: z.boolean().default(true), ano_publicacao: z.number().int().min(1400).max(2100).optional(), idioma: z.enum(['pt', 'en', 'es']), acesso: z.string(), evidencia: z.string(), limites: z.string().min(10),
  status: businessStatus, justificativa: z.string(), revisor: z.string(), revisado_em: data.or(z.literal('')),
  video_id: z.string().regex(/^[A-Za-z0-9_-]{11}$/).or(z.literal('')).optional(), channel_id: z.string().default(''), revisao_integral: z.boolean().default(false),
  revisao_escopo: z.enum(['integral', 'fonte_e_contexto']).default('integral'), contexto_editorial: z.string().default(''),
  nivel: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  duracao_segundos: z.number().int().nonnegative().default(0), palestrante: z.string().default(''), credenciais: z.string().default(''),
  evidencias_revisao: z.array(https).default([]),
  formato_isbn:z.string().default(''),capa:z.string().default(''),capa_credito:z.string().default(''),capa_fonte:https.or(z.literal('')).default(''),capa_licenca:z.string().default(''),
  editora: z.string().default(''), edicao: z.string().default(''), isbn: z.string().regex(/^(?:\d{13}|\d{9}[\dX])?$/).default(''),
  corpo: z.array(z.string().min(20)).default([]), referencias: z.array(https).default([]),
}).superRefine((item, context) => {
  if (item.status !== 'publicado') return;
  if (!item.revisor.trim() || !item.revisado_em || item.justificativa.trim().length < 20) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Publicação Business exige revisão, data e justificativa.' });
  if (item.tipo === 'video') {
    if (!item.video_id || !/^UC[A-Za-z0-9_-]{22}$/.test(item.channel_id) || (item.revisao_escopo === 'integral' && !item.revisao_integral)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Vídeo publicado exige ID, channel_id verificado e revisão do escopo declarado.' });
    if (item.revisao_escopo === 'fonte_e_contexto' && (item.revisao_integral || item.contexto_editorial.trim().length < 80 || item.duracao_segundos <= 0 || !item.evidencias_revisao.includes(item.url) || !item.evidencias_revisao.includes(`https://www.youtube.com/channel/${item.channel_id}`))) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Seleção institucional exige contexto documentado, duração, evidências do vídeo e do canal, sem alegar revisão integral.' });
  }
  if (item.tipo === 'webinar' && !item.revisao_integral) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Webinar publicado exige revisão integral.' });
  if (item.tipo === 'video' && (!item.palestrante.trim() || !item.credenciais.trim() || !item.evidencias_revisao.length)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Vídeo publicado exige palestrante, credenciais e evidências da revisão.' });
  if(item.capa&&(!item.capa_credito||!item.capa_fonte||!item.capa_licenca))context.addIssue({code:z.ZodIssueCode.custom,message:'Capa publicada exige origem, crédito e condição de uso.'});
  if (item.tipo === 'livro' && !item.editora.trim()) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Livro publicado exige editora identificada.' });
  if (['noticia', 'analise'].includes(item.tipo) && (item.corpo.length < 2 || !item.referencias.length)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Notícia ou análise publicada exige texto e referências.' });
});

// Série didática autoral: não é aprovação automática dos materiais referenciados.
export const businessSerieSchema = z.object({
  numero:z.number().int().positive(), titulo:z.string().min(5), resumo:z.string().min(30),
  autor:z.string().min(2), atualizado:data, serie:z.string().min(5), status:businessStatus,
  secoes:z.array(z.object({titulo:z.string(),paragrafos:z.array(z.string().min(20)).min(1)})).min(4),
  figuras:z.array(z.object({tipo:z.enum(['cartoes','radial','experimento']).default('cartoes'),central:z.string().default(''),apos_secao:z.number().int().nonnegative(),titulo:z.string(),descricao:z.string(),etapas:z.array(z.string()).min(2).max(8),legenda:z.string()})).min(1),
  fontes:z.array(z.object({titulo:z.string(),url:https,consultado:z.string(),limites:z.string()})).min(1),
  revisor:z.string(),revisado_em:data.or(z.literal('')),
}).superRefine((item,context)=>{
  if(item.status!=='publicado')return;
  const palavras=item.secoes.flatMap(s=>s.paragrafos).join(' ').split(/\s+/).length;
  if(palavras<600||!item.revisor.trim()||!item.revisado_em)context.addIssue({code:z.ZodIssueCode.custom,message:'Artigo publicado da série exige texto completo e registro de revisão.'});
});

const businessReferencia = z.object({texto:z.string(),url:https});
export const businessOrigensSchema=z.object({
 titulo:z.string(),resumo:z.string(),atualizado:data,status:businessStatus,revisor:z.string().min(1),revisado_em:data,nota:z.string(),
 eras:z.array(z.object({id:z.string(),nome:z.string(),de:z.number(),ate:z.number(),cor:z.string(),suave:z.string()})).min(1),
 eventos:z.array(z.object({ano:z.number(),titulo:z.string(),texto:z.string(),tipo:z.enum(['sol','marco','eclipse']),era:z.string(),eq:z.string().optional()})),
 capitulos:z.array(z.object({n:z.number(),id:z.string(),periodo:z.string(),titulo:z.string(),era:z.string(),abertura:z.string(),sois:z.array(z.string()),eclipses:z.array(z.object({ano:z.string(),titulo:z.string(),quem:z.string(),texto:z.array(z.string()),eq:z.string().optional(),eqLegenda:z.string().optional()})),refs:z.array(businessReferencia).min(1)})),
 pessoas:z.array(z.object({nome:z.string(),papel:z.string(),ano:z.string(),capitulo:z.string(),foto:z.string().optional(),credito:z.string().optional(),licenca:z.string().optional(),licenca_url:https.optional(),fonte:https.optional(),referencias:z.array(businessReferencia).default([])})),
}).superRefine((d,c)=>{
 const eras=new Map(d.eras.map(e=>[e.id,e]));const capitulos=new Set(d.capitulos.map(x=>x.id));
 for(const e of d.eventos){const era=eras.get(e.era);if(!era||e.ano<era.de||e.ano>era.ate)c.addIssue({code:z.ZodIssueCode.custom,message:'Evento fora da era declarada.'});}
 for(const x of d.capitulos)if(!eras.has(x.era))c.addIssue({code:z.ZodIssueCode.custom,message:'Capítulo sem era válida.'});
 for(const p of d.pessoas)if(!capitulos.has(p.capitulo)||(p.foto&&(!p.credito||!p.licenca||!p.licenca_url||!p.fonte)))c.addIssue({code:z.ZodIssueCode.custom,message:'Pessoa sem capítulo ou retrato sem crédito/licença.'});
});
export const businessAprendizadoSchema=z.object({
 numero:z.number().int().positive(),titulo:z.string(),texto:z.string(),contexto:z.string(),mecanismo:z.string(),
 equacoes:z.array(z.object({tex:z.string(),texto:z.string()})).default([]),exemplo:z.string(),limites:z.string(),legado:z.string(),hoje:z.string(),
 referencias:z.array(businessReferencia.extend({consultado:z.string(),limites:z.string()})).min(1),
 atualizado:data,status:businessStatus,revisor:z.string(),revisado_em:data,
});
export const businessAnaliseSchema=z.object({titulo:z.string(),titulo_curto:z.string(),resumo:z.string(),serie:z.string(),parte:z.number().int().positive(),total:z.number().int().positive(),data:data,atualizado:data,autor:z.string(),status:businessStatus,fontes:z.array(https).min(1),revisor:z.string(),revisado_em:data});
export const businessInvestigacaoSchema=z.object({titulo:z.string(),resumo:z.string(),atualizado:data,status:businessStatus,revisor:z.string().min(1),revisado_em:data,secoes:z.array(z.object({titulo:z.string(),paragrafos:z.array(z.string())})).min(1),fontes:z.array(z.object({titulo:z.string(),url:https,consultado:z.string(),limites:z.string()})).min(1),arquivados:z.array(z.object({id:z.string(),titulo:z.string(),proposta:z.string(),motivo:z.string(),reabrir_se:z.string(),natureza:z.string(),data_avaliacao:data,referencia:z.object({titulo:z.string(),url:https})})),});
