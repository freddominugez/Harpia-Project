// Coleções de conteúdo. Cada item é um arquivo; o painel /admin (Sveltia CMS) e a
// curadoria diária gravam nesses mesmos arquivos. O esquema é a trava de qualidade:
// item inválido quebra o build e não é publicado.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const data = (dir: string) => glob({ pattern: "**/*.json", base: `./src/content/${dir}` });
const md = (dir: string) => glob({ pattern: "**/*.md", base: `./src/content/${dir}` });

const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data no formato AAAA-MM-DD");
// Campos comuns a todo item curado.
const curadoria = {
  status: z.enum(["rascunho", "publicado"]).default("publicado"),
  origem: z.enum(["manual", "curadoria-diaria"]).default("manual"),
  adicionado_em: dia,
  verificado_em: dia,
  ordem: z.coerce.number().int().default(999),
};

const caminhos = defineCollection({
  loader: md("caminhos"),
  schema: z.object({
    numero: z.number(),
    titulo: z.string(),
    estatuto: z.enum(["medido", "arte", "lacuna", "teste"]),
    selo: z.string(),
    resumo: z.string(),
    equacao: z.string().optional(),
    arte_previa: z.array(z.string()).default([]),
    proximo_teste: z.string(),
    parar_se: z.string(),
    principal: z.boolean().default(false),
    atualizado: dia,
  }),
});

const videos = defineCollection({
  loader: data("videos"),
  schema: z.object({
    id: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "ID de vídeo do YouTube com 11 caracteres"),
    titulo: z.string().min(3),
    canal: z.string().min(1),
    modulo: z.coerce.number().int().min(0).max(99),
    nivel: z.enum(["Iniciante", "Intermediário", "Avançado"]),
    resumo: z.string().min(20),
    catalogo: z.coerce.number().int().nullable().default(null),
    trilha: z.enum(["mat", "redes", "llm"]).default("llm"),
    idioma: z.enum(["pt", "en", "es"]).default("en"),
    dublagem_pt: z.boolean().default(false),
    fonte_url: z.string().url(),
    ...curadoria,
  }),
});

const modulos = defineCollection({
  loader: data("modulos"),
  schema: z.object({ numero: z.coerce.number().int(), titulo: z.string(), subtitulo: z.string(), icone: z.string() }),
});

const artigos = defineCollection({
  loader: data("artigos"),
  schema: z.object({
    ano: z.coerce.number().int(),
    titulo: z.string(),
    autores: z.string(),
    url: z.string().url(),
    pdf_url: z.string().url().optional(),
    idioma: z.enum(["pt", "en", "es"]).default("en"),
    grupo: z.enum(["fund", "busca", "arte"]),
    selo: z.enum(["medido", "arte", "lacuna", "teste"]),
    rotulo: z.string(),
    fonte_url: z.string().url(),
    ...curadoria,
  }),
});

const livros = defineCollection({
  loader: data("livros"),
  schema: z.object({
    titulo: z.string(),
    autores: z.string(),
    nota: z.string(),
    uso: z.string().default(""),
    url: z.string().url().or(z.literal("")),
    cor: z.enum(["c1", "c2", "c3", "c4", "c5", "c6"]),
    ano: z.coerce.number().int().optional(),
    resenha: z.string().default(""),
    categoria: z.enum(["mat", "ml", "ling", "ia", "comp", "eng"]).default("ml"),
    capa: z.string().default(""),
    compra_url: z.string().url().or(z.literal("")).default(""),
    idioma: z.enum(["pt", "en", "es"]).default("en"),
    edicao_pt: z.object({ titulo: z.string(), editora: z.string(), ano: z.coerce.number().int().optional() }).optional(),
    fonte_url: z.string().url().or(z.literal("")),
    ...curadoria,
  }),
});

const fontes = defineCollection({
  loader: data("fontes"),
  schema: z.object({
    nome: z.string(),
    url: z.string().url(),
    descricao: z.string(),
    grupo: z.string(),
    grupo_ordem: z.coerce.number().int(),
    fonte_url: z.string().url(),
    ...curadoria,
  }),
});

const feeds = defineCollection({
  loader: data("feeds"),
  schema: z.object({
    nome: z.string(),
    url: z.string().url().or(z.literal("")),
    nota: z.string().optional(),
    so_titulo: z.boolean().optional(),
    ordem: z.coerce.number().int().default(999),
  }),
});

const aprendizado = defineCollection({
  loader: data("aprendizado"),
  schema: z.object({ ano: z.coerce.number().int(), titulo: z.string(), texto: z.string(), eq: z.string().optional(), ...curadoria }),
});

const linhaDoTempo = defineCollection({
  loader: data("linha-do-tempo"),
  schema: z.object({
    ano: z.coerce.number().int(),
    titulo: z.string(),
    texto: z.string(),
    eq: z.string().optional(),
    marco: z.boolean().default(false),
    era: z.enum(["Fundamentos", "Redes e sequências", "Transformers", "Eficiência"]),
    ...curadoria,
  }),
});

// Pautas para o fórum: propostas pela curadoria, aprovadas no painel, criadas no
// GitHub Discussions pela automação .github/workflows/discussoes.yml.
const pautas = defineCollection({
  loader: md("pautas"),
  schema: z.object({
    titulo: z.string().min(8),
    categoria: z.enum(["Caminhos", "Perguntas", "Resultados e reproduções", "Propostas novas"]),
    caminho: z.string().optional(),
    links: z.array(z.string().url()).default([]),
    status: z.enum(["proposta", "aprovada", "criada", "descartada"]).default("proposta"),
    discussao_url: z.string().url().or(z.literal("")).default(""),
    proposta_em: dia,
    origem: z.enum(["manual", "curadoria-diaria"]).default("manual"),
  }),
});

// Lista curada que a tarefa diária consulta.
const fontesMonitoradas = defineCollection({
  loader: data("fontes-monitoradas"),
  schema: z.object({
    nome: z.string(),
    tipo: z.enum(["site", "canal"]),
    feed: z.string().url(),
    pagina: z.string().url(),
    tema: z.string(),
    relacionados: z.array(z.string()).default([]),
    ativo: z.boolean().default(true),
    verificado_em: dia,
  }),
});

export const collections = {
  caminhos, videos, modulos, artigos, livros, fontes, feeds, aprendizado,
  "linha-do-tempo": linhaDoTempo, pautas, "fontes-monitoradas": fontesMonitoradas,
};
