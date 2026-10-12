// Imagens Open Graph (1200 × 630) geradas no build com satori + resvg, uma por página
// do registro (src/lib/rotas.ts). Fonte Inter servida pelo próprio pacote (sem rede).
import fs from "node:fs";
import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { rotas, rotaDe, ogDe } from "../../lib/rotas";
import { SITE } from "../../config";

const fonte = (peso: number) => fs.readFileSync(`node_modules/@fontsource/inter/files/inter-latin-${peso}-normal.woff`);
const FONTES = [400, 700, 800].map((peso) => ({ name: "Inter", data: fonte(peso), weight: peso as 400 | 700 | 800, style: "normal" as const }));
const MARCA = `data:image/png;base64,${fs.readFileSync("public/img/harpya-mark-head.png").toString("base64")}`;

type No = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (No | string)[]): No => ({ type, props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children } });

export const getStaticPaths: GetStaticPaths = async () =>
  (await rotas()).map((r) => ({ params: { rota: ogDe(r.path).replace(/^\/og\//, "").replace(/\.png$/, "") }, props: { path: r.path } }));

export const GET: APIRoute = async ({ props }) => {
  const r = (await rotaDe(props.path as string))!;
  const titulo = r.path === "/" ? SITE.lema : r.titulo;
  const desc = r.descricao.length > 150 ? `${r.descricao.slice(0, 147).replace(/\s+\S*$/, "")}...` : r.descricao;
  const arvore = h("div", { width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#282d33", color: "#ffffff", fontFamily: "Inter" },
    h("div", { display: "flex", alignItems: "center", gap: 18 },
      { type: "img", props: { src: MARCA, width: 64, height: 60 } },
      h("div", { display: "flex", flexDirection: "column" },
        h("div", { fontSize: 30, fontWeight: 800, letterSpacing: 4 }, "HARPYA"),
        h("div", { fontSize: 18, color: "#c79a39", letterSpacing: 3 }, r.secao.toUpperCase()))),
    h("div", { display: "flex", flexDirection: "column", gap: 22 },
      h("div", { fontSize: titulo.length > 60 ? 54 : 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }, titulo),
      h("div", { fontSize: 27, color: "#c9ced3", lineHeight: 1.35 }, desc)),
    h("div", { display: "flex", justifyContent: "space-between", fontSize: 22, color: "#9aa2ab" },
      h("div", { display: "flex" }, "harpya.org"),
      h("div", { display: "flex", width: 120, height: 6, background: "#c79a39", borderRadius: 3, marginTop: 10 })));
  const svg = await satori(arvore as never, { width: 1200, height: 630, fonts: FONTES });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
