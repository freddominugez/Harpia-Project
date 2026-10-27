// NotícIAs: leitura síncrona de src/content/noticias/*.json para a home, as páginas,
// o registro de rotas e o RSS. Só entra o que está "publicado"; rascunho fica fora de tudo.
// As capas são ilustrações geradas no build a partir do tema de cada notícia (sem foto
// de terceiros): vetores partindo de um ponto, como no símbolo do projeto, e o ícone do tema.

export type Fonte = { veiculo: string; titulo: string; url: string };
export type Noticia = {
  slug: string;
  titulo: string;
  resumo: string;
  data: string;
  categoria: Categoria;
  icone: string;
  corpo: string[];
  harpia: string;
  fontes: Fonte[];
  status?: string;
  ordem?: number;
};
export type Categoria = "letramento" | "brasil" | "abertos" | "pesquisa";

export const CATEGORIAS: Record<Categoria, { nome: string; icone: string; tag: string; de: string; ate: string; traco: string }> = {
  letramento: { nome: "Letramento em IA", icone: "livro", tag: "soft-gold", de: "#23292f", ate: "#4d3b16", traco: "#d9b25c" },
  brasil: { nome: "Brasil e regulação", icone: "balanca", tag: "medido", de: "#1f2926", ate: "#22473a", traco: "#7fc29b" },
  abertos: { nome: "Código e modelos abertos", icone: "codigo", tag: "arte", de: "#1f2730", ate: "#2f4a68", traco: "#8fb0d6" },
  pesquisa: { nome: "Pesquisa e fronteira", icone: "lupa", tag: "teste", de: "#231f2e", ate: "#463a63", traco: "#b9a6e3" },
};

export const ICONES: Record<string, string> = {
  livro: "M3 5.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8V19c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z M12 6.3v13.5",
  escola: "M2 9l10-5 10 5-10 5z M6 11v5c3 2.5 9 2.5 12 0v-5 M22 9v6",
  onda: "M3 12h1.5 M7 8.5v7 M11 4.5v15 M15 7v10 M19 10v4 M21.5 12h0",
  maquina: "M4 5.5h16v10.5H4z M2 19h20 M10 18.9h4",
  globo: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M3 12h18 M12 3c3.2 3 3.2 15 0 18 M12 3c-3.2 3-3.2 15 0 18",
  chip: "M7 7h10v10H7z M10 10h4v4h-4z M9.5 3v4 M14.5 3v4 M9.5 17v4 M14.5 17v4 M3 9.5h4 M3 14.5h4 M17 9.5h4 M17 14.5h4",
  biblioteca: "M3 9l9-5 9 5 M5 9.5v8.5 M9.5 9.5v8.5 M14.5 9.5v8.5 M19 9.5v8.5 M3 20.5h18",
  codigo: "M8 7l-5 5 5 5 M16 7l5 5-5 5 M13.5 5l-3 14",
  leitura: "M6 3h9l4 4v14H6z M15 3v4h4 M9 11h7 M9 14h7 M9 17h4",
  balanca: "M12 4v16 M7.5 20h9 M4.5 7.5h15 M4.5 7.5L2 13c0 1.6 5 1.6 5 0z M19.5 7.5L17 13c0 1.6 5 1.6 5 0z",
  lupa: "M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13 M15.5 15.5L21 21",
  fonte: "M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  seta: "M9 5l7 7-7 7",
  voltar: "M15 5l-7 7 7 7",
  abaixo: "M6 9l6 6 6-6",
};

/** Ícone em linha (traço herda a cor do texto). */
export function icone(nome: string, classe = "nicon"): string {
  const d = ICONES[nome] ?? ICONES.chip;
  return `<svg class="${classe}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

export const cat = (c: string) => CATEGORIAS[(c in CATEGORIAS ? c : "abertos") as Categoria];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
let seq = 0;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Capa gerada (SVG em linha, 16:9, recorta para qualquer proporção). Mesma notícia, mesma capa. */
export function capa(n: Pick<Noticia, "slug" | "categoria" | "icone">): string {
  const p = cat(n.categoria);
  const r = rng(hash(n.slug));
  const id = `nc${++seq}`;
  const W = 400, H = 225;
  const ox = 230 + r() * 130, oy = 55 + r() * 115;
  const n_ = 6 + Math.floor(r() * 5);
  const base = r() * Math.PI * 2;
  let raios = "", pontos = "";
  for (let i = 0; i < n_; i++) {
    const a = base + (i / n_) * Math.PI * 2 + (r() - 0.5) * 0.5;
    const L = 55 + r() * 150;
    const x = (ox + Math.cos(a) * L).toFixed(1), y = (oy + Math.sin(a) * L).toFixed(1);
    raios += `<line x1="${ox.toFixed(1)}" y1="${oy.toFixed(1)}" x2="${x}" y2="${y}"/>`;
    pontos += `<circle cx="${x}" cy="${y}" r="${(2 + r() * 2.2).toFixed(1)}"/>`;
  }
  let grade = "";
  for (let gx = 20; gx < W; gx += 26) for (let gy = 18; gy < H; gy += 26) grade += `M${gx} ${gy}h.01`;
  const ic = ICONES[n.icone] ?? ICONES[p.icone];
  return `<svg class="ncapa" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustração do tema ${esc(p.nome)}">`
    + `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.de}"/><stop offset="1" stop-color="${p.ate}"/></linearGradient>`
    + `<radialGradient id="${id}r" cx="${(ox / W).toFixed(3)}" cy="${(oy / H).toFixed(3)}" r=".55"><stop offset="0" stop-color="${p.traco}" stop-opacity=".3"/><stop offset="1" stop-color="${p.traco}" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="400" height="225" fill="url(#${id}g)"/><rect width="400" height="225" fill="url(#${id}r)"/>`
    + `<path d="${grade}" stroke="${p.traco}" stroke-opacity=".22" stroke-width="2.2" stroke-linecap="round" fill="none"/>`
    + `<g stroke="${p.traco}" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round" fill="none">${raios}</g>`
    + `<g fill="${p.traco}">${pontos}<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="5.5"/></g>`
    + `<g transform="translate(26 118) scale(3.3)" fill="none" stroke="#f8f9fa" stroke-width=".95" stroke-linecap="round" stroke-linejoin="round"><path d="${ic}"/></g>`
    + `</svg>`;
}

type Mod = { default?: Omit<Noticia, "slug"> } & Omit<Noticia, "slug">;
const mods = import.meta.glob("../content/noticias/*.json", { eager: true }) as Record<string, Mod>;

/** Publicadas, da mais recente à mais antiga (empate: menor "ordem" primeiro). */
export const NOTICIAS: Noticia[] = Object.entries(mods)
  .map(([arquivo, m]) => ({ ...((m.default ?? m) as Omit<Noticia, "slug">), slug: arquivo.split("/").pop()!.replace(/\.json$/, "") }))
  .filter((n) => (n.status ?? "publicado") === "publicado")
  .sort((a, b) => b.data.localeCompare(a.data) || Number(a.ordem ?? 999) - Number(b.ordem ?? 999) || a.slug.localeCompare(b.slug));

export const urlNoticia = (n: { slug: string }) => `/noticias/${n.slug}/`;

/** Minutos de leitura do corpo e do resumo. */
export const minutosDeLeitura = (n: Noticia) =>
  Math.max(1, Math.round([n.resumo, ...n.corpo].join(" ").split(/\s+/).filter(Boolean).length / 200));

