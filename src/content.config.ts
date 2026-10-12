import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Cada caminho válido é um arquivo markdown em src/content/caminhos/.
const caminhos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/caminhos" }),
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
    atualizado: z.string(),
  }),
});

export const collections = { caminhos };
