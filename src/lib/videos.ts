// Catálogo de vídeos: tipos, ordem dos níveis e a seleção semanal da página inicial.
import { lista } from "./conteudo";

export type Nivel = "Iniciante" | "Intermediário" | "Avançado";
export type Video = { id: string; titulo: string; canal: string; modulo: number; nivel: Nivel; resumo: string; catalogo: number | null; trilha: string; idioma?: string; dublagem_pt?: boolean };
export type Modulo = { numero: number; titulo: string; subtitulo: string; icone: string };

export const VIDEOS = lista<Video & { status?: string; ordem?: number }>(import.meta.glob("../content/videos/*.json", { eager: true }))
  .map((v) => ({ ...v, modulo: Number(v.modulo) })) as Video[];
export const MODULOS = (Object.values(import.meta.glob("../content/modulos/*.json", { eager: true })) as { default: Modulo }[])
  .map((m) => m.default ?? (m as unknown as Modulo))
  .map((m) => ({ ...m, numero: Number(m.numero) }))
  .sort((a, b) => a.numero - b.numero);
export const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
export const NIVEL_SLUG: Record<Nivel, string> = { Iniciante: "iniciante", "Intermediário": "intermediario", "Avançado": "avancado" };

export const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
export const urlVideo = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const moduloDe = (n: number) => MODULOS.find((m) => m.numero === n)!;
export const rotuloModulo = (n: number) => `Módulo ${String(n).padStart(2, "0")}`;

/** Semana ISO do ano, usada para girar a seleção da home a cada build semanal. */
function semana(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia);
  const ini = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - ini.getTime()) / 86400000 + 1) / 7);
}

/**
 * Seleção da semana para a home: um vídeo de cada nível, de módulos diferentes,
 * girando pelos módulos. O site é reconstruído várias vezes por dia pelo robô de
 * news, então a seleção muda sozinha a cada semana.
 */
export function selecaoDaSemana(hoje = new Date(), quantos = 3): Video[] {
  const s = semana(hoje) + hoje.getFullYear() * 53;
  const out: Video[] = [];
  for (let i = 0; i < quantos; i++) {
    const nivel = NIVEIS[i % NIVEIS.length];
    for (let k = 0; k < MODULOS.length; k++) {
      const mod = MODULOS[(s + i * 4 + k) % MODULOS.length].numero;
      const opcoes = VIDEOS.filter((v) => v.modulo === mod && v.nivel === nivel && !out.some((o) => o.modulo === mod));
      if (opcoes.length) { out.push(opcoes[s % opcoes.length]); break; }
    }
  }
  return out;
}
