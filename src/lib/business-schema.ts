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
export const businessGuiaSchema = z.object({ titulo: z.string(), resumo: z.string().min(30), numero: z.number().int().min(1), trilha: businessTrilha, status: businessStatus, atualizado: data, fontes: z.array(https).min(1) });
export const businessAcervoSchema = z.object({
  titulo: z.string().min(5), resumo: z.string().min(20), fonte: z.string(), url: https,
  tipo: z.enum(['artigo', 'livro', 'relatorio', 'video', 'noticia', 'analise', 'webinar']), trilha: businessTrilha,
  autores: z.string().min(2), data: data.or(z.literal('')), data_precisa: z.boolean().default(true), ano_publicacao: z.number().int().min(1400).max(2100).optional(), idioma: z.enum(['pt', 'en', 'es']), acesso: z.string(), evidencia: z.string(), limites: z.string().min(10),
  status: businessStatus, justificativa: z.string(), revisor: z.string(), revisado_em: data.or(z.literal('')),
  video_id: z.string().regex(/^[A-Za-z0-9_-]{11}$/).or(z.literal('')).optional(), channel_id: z.string().default(''), revisao_integral: z.boolean().default(false),
  nivel: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  duracao_segundos: z.number().int().nonnegative().default(0), palestrante: z.string().default(''), credenciais: z.string().default(''),
  evidencias_revisao: z.array(https).default([]),
  editora: z.string().default(''), edicao: z.string().default(''), isbn: z.string().regex(/^(?:\d{13}|\d{9}[\dX])?$/).default(''),
  corpo: z.array(z.string().min(20)).default([]), referencias: z.array(https).default([]),
}).superRefine((item, context) => {
  if (item.status !== 'publicado') return;
  if (!item.revisor.trim() || !item.revisado_em || item.justificativa.trim().length < 20) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Publicação Business exige revisão, data e justificativa.' });
  if (item.tipo === 'video' && (!item.video_id || !/^UC[A-Za-z0-9_-]{22}$/.test(item.channel_id) || !item.revisao_integral)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Vídeo publicado exige ID, channel_id verificado e revisão integral.' });
  if (item.tipo === 'webinar' && !item.revisao_integral) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Webinar publicado exige revisão integral.' });
  if (item.tipo === 'video' && (!item.palestrante.trim() || !item.credenciais.trim() || !item.evidencias_revisao.length)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Vídeo publicado exige palestrante, credenciais e evidências da revisão.' });
  if (item.tipo === 'livro' && !item.editora.trim()) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Livro publicado exige editora identificada.' });
  if (['noticia', 'analise'].includes(item.tipo) && (item.corpo.length < 2 || !item.referencias.length)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Notícia ou análise publicada exige texto e referências.' });
});
