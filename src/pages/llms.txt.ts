// /llms.txt no formato de llmstxt.org: o que é o site e onde está cada página em markdown.
import type { APIRoute } from "astro";
import { SITE } from "../config";
import { rotas, abs, mdDe } from "../lib/rotas";

export const GET: APIRoute = async () => {
  const todas = await rotas();
  const linha = (path: string) => {
    const r = todas.find((x) => x.path === path)!;
    return `- [${r.path === "/" ? SITE.nome : r.titulo}](${abs(mdDe(r.path))}): ${r.descricao}`;
  };
  const caminhos = todas.filter((r) => r.path.startsWith("/estudos/caminhos/"));
  const corpo = [
    `# ${SITE.nome}`,
    `> ${SITE.descricao}`,
    `Pesquisa aberta em português mantida por ${SITE.autor}. Cada caminho de pesquisa traz mecanismo em equação, custo, teste refutável, regra de parada e arte prévia. Conteúdo sob CC BY 4.0: cite com o título da página, o autor e o link. Cada página HTML tem uma versão em markdown no mesmo endereço terminado em .md. Texto completo em ${abs("/llms-full.txt")}.`,
    `## Comece por aqui\n\n${["/", "/estudos/", "/sobre/"].map(linha).join("\n")}`,
    `## Caminhos de pesquisa\n\n${caminhos.map((r) => linha(r.path)).join("\n")}`,
    `## Referência\n\n${["/equacoes/", "/biblioteca/glossario/", "/origens/", "/aprendizado/", "/estudos/a-ideia-mais-interessante/", "/estudos/arquivados/"].map(linha).join("\n")}`,
    `## Acervo\n\n${["/videos/", "/biblioteca/", "/biblioteca/fontes/"].map(linha).join("\n")}`,
    `## Optional\n\n${["/news/", "/forum/"].map(linha).join("\n")}\n- [RSS](${abs("/rss.xml")}): novidades do site\n- [Repositório](${SITE.repositorio}): código e conteúdo`,
    "",
  ].join("\n\n");
  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
