// Registro único das páginas indexáveis. Alimenta sitemap, imagens Open Graph, JSON-LD,
// gêmeos em markdown (/<rota>.md), /llms.txt, /llms-full.txt e /rss.xml.
// Página nova: acrescente aqui. O QA (scripts/qa_redesign.py) acusa página fora do registro.
import fs from "node:fs";
import { fontesDoSite, markdownDasFontes } from "./fontes-site";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "../config";
import { VIDEOS, MODULOS, rotuloModulo, urlVideo } from "./videos";
import { ARTIGOS, LIVROS, FONTES, FONTES_POR_GRUPO, APRENDIZADO, LINHA_DO_TEMPO } from "./conteudo";
import { CAPITULOS, EVENTOS, PESSOAS } from "../data/origens";
import { PAUTAS, temPagina } from "./pautas";
import { COMECANDO, SERIE, TOTAL_DA_SERIE, corpoDe } from "../data/comecando";

/** HTML de artigo da série em markdown: parágrafos, títulos e figuras (descrição + legenda). */
function htmlParaMd(html: string) {
  const texto = (t: string) => t.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  const partes: string[] = [];
  const re = /<p class="series">[\s\S]*?<\/p>|<h1>[\s\S]*?<\/h1>|<p class="byline">[\s\S]*?<\/p>|<figure>[\s\S]*?<\/figure>|<p[^>]*>[\s\S]*?<\/p>/g;
  for (const m of html.matchAll(re)) {
    const bloco = m[0];
    if (/^<p class="(series|byline)"/.test(bloco) || bloco.startsWith("<h1>")) continue;
    if (bloco.startsWith("<figure>")) {
      const desc = bloco.match(/aria-label="([^"]+)"/)?.[1] ?? "";
      const tit = texto(bloco.match(/<text[^>]*>(Figura[^<]*)<\/text>/)?.[1] ?? "Figura");
      const leg = texto(bloco.match(/<figcaption>([\s\S]*?)<\/figcaption>/)?.[1] ?? "");
      partes.push(`**${tit}** (${desc})\n\n${leg}`);
    } else partes.push(texto(bloco));
  }
  return partes.filter(Boolean).join("\n\n");
}

export type Rota = {
  path: string;
  titulo: string; // título curto da página (o <title> recebe " · Harpya")
  descricao: string;
  secao: string; // rótulo da imagem OG e do llms.txt
  pai?: string; // path da página-mãe, para a trilha (BreadcrumbList)
  atualizado: string; // AAAA-MM-DD, para lastmod, dateModified e RSS
  imagens?: { url: string; titulo: string; legenda?: string }[]; // sitemap de imagens
  markdown: () => string; // corpo do gêmeo em markdown
  schema?: () => Record<string, unknown>[]; // JSON-LD específico da página
};

export const URL_SITE = "https://www.harpya.org";
export const abs = (p: string) => new URL(p, URL_SITE).toString();
export const ID = { site: `${URL_SITE}/#website`, org: `${URL_SITE}/#organizacao`, pessoa: `${URL_SITE}/#autor` };
export const mdDe = (path: string) => (path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`);
export const ogDe = (path: string) => (path === "/" ? "/og/index.png" : `/og${path.replace(/\/$/, "")}.png`);

const maior = (...datas: (string | undefined)[]) => datas.filter(Boolean).sort().at(-1) ?? "2026-10-12";
const datasDe = (itens: { adicionado_em?: string; verificado_em?: string }[]) => itens.map((i) => i.adicionado_em);
type ComDatas = { adicionado_em?: string };
const tex = (s: string) => `$${s}$`;

/** Frontmatter e corpo de uma página markdown em src/pages. */
function paginaMd(arquivo: string) {
  const src = fs.readFileSync(arquivo, "utf-8");
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const campo = (k: string) => m?.[1].match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, "m"))?.[1] ?? "";
  return { titulo: campo("titulo"), descricao: campo("descricao"), atualizado: campo("atualizado"), lead: campo("lead"), corpo: (m?.[2] ?? src).trim() };
}

const lista = (itens: string[]) => itens.map((i) => `- ${i}`).join("\n");
const itemList = (nome: string, itens: { name: string; url: string; extra?: Record<string, unknown> }[]) => ({
  "@type": "ItemList",
  name: nome,
  numberOfItems: itens.length,
  itemListElement: itens.map((i, n) => ({ "@type": "ListItem", position: n + 1, url: i.url, name: i.name, ...(i.extra ? { item: { ...i.extra, name: i.name, url: i.url } } : {}) })),
});
const colecao = (path: string, nome: string, descricao: string, lista: Record<string, unknown>) => ({
  "@type": "CollectionPage",
  "@id": `${abs(path)}#pagina`,
  url: abs(path),
  name: nome,
  description: descricao,
  inLanguage: "pt-BR",
  isPartOf: { "@id": ID.site },
  publisher: { "@id": ID.org },
  mainEntity: lista,
});

let cache: Rota[] | null = null;

export async function rotas(): Promise<Rota[]> {
  if (cache) return cache;
  const caminhos = (await getCollection("caminhos")).sort((a, b) => a.data.numero - b.data.numero);
  const pautasComPagina = (await getCollection("pautas")).filter((p) => temPagina(p.data.status));
  const sobre = paginaMd("src/pages/sobre.md");
  const termosDeUso = paginaMd("src/pages/termos-de-uso.md");
  const gruposFontes = await fontesDoSite();
  const todasFontes = gruposFontes.flatMap((g) => g.itens);
  const equacoes = paginaMd("src/pages/equacoes.md");
  const glossario = paginaMd("src/pages/biblioteca/glossario.md");
  const arquivados = paginaMd("src/pages/estudos/arquivados.md");
  const termos = [...glossario.corpo.matchAll(/^\*\*(.+?)\.\*\*\s+(.+)$/gm)].map((m) => ({ termo: m[1], def: m[2] }));
  let news: { fonte: string; titulo: string; url: string; data: string; ts: number }[] = [];
  try { news = JSON.parse(fs.readFileSync("public/data/news.json", "utf-8")); } catch { news = []; }
  const dataNews = news.length ? new Date(Math.max(...news.map((n) => n.ts)) * 1000).toISOString().slice(0, 10) : undefined;

  const vids = VIDEOS as (typeof VIDEOS[number] & ComDatas)[];
  const arts = ARTIGOS as (typeof ARTIGOS[number] & ComDatas)[];
  const livs = LIVROS as (typeof LIVROS[number] & ComDatas)[];
  const fons = FONTES as (typeof FONTES[number] & ComDatas)[];
  const dCaminhos = maior(...caminhos.map((c) => c.data.atualizado));
  const dVideos = maior(...datasDe(vids));
  const dBiblioteca = maior(...datasDe(arts), ...datasDe(livs));
  const dFontes = maior(...datasDe(fons));
  const dOrigens = maior(...datasDe(LINHA_DO_TEMPO as ComDatas[]), "2026-10-12");
  const dAprendizado = maior(...datasDe(APRENDIZADO as ComDatas[]));
  const dForum = maior(...PAUTAS.map((p) => p.data));
  const IDEIA = "A ideia mais interessante que não serve para nada";
  const DESC_IDEIA = "E se a vetorização ocorresse em um espaço não euclidiano? A resposta, as medidas e por que a geometria hiperbólica continua sendo pesquisa real.";

  const fichaCaminho = (c: CollectionEntry<"caminhos">): Rota => {
    const d = c.data;
    const path = `/estudos/caminhos/${c.id}/`;
    return {
      path,
      titulo: d.titulo,
      descricao: d.resumo,
      secao: `Caminho ${String(d.numero).padStart(2, "0")}`,
      pai: "/estudos/",
      atualizado: d.atualizado,
      markdown: () => [
        `**Caminho ${d.numero}.** Estatuto: ${d.selo}.`,
        d.equacao ? `Equação central:\n\n$$\n${d.equacao}\n$$` : "",
        (c.body ?? "").trim(),
        `## Teste e regra de parada\n\n**Próximo teste.** ${d.proximo_teste}\n\n**Parar se.** ${d.parar_se}`,
        d.arte_previa.length ? `## Arte prévia\n\n${lista(d.arte_previa)}` : "",
      ].filter(Boolean).join("\n\n"),
      schema: () => [{
        "@type": d.estatuto === "medido" ? "ScholarlyArticle" : "TechArticle",
        "@id": `${abs(path)}#artigo`,
        headline: d.titulo,
        description: d.resumo,
        url: abs(path),
        mainEntityOfPage: abs(path),
        inLanguage: "pt-BR",
        dateModified: d.atualizado,
        datePublished: d.atualizado,
        author: { "@id": ID.pessoa },
        publisher: { "@id": ID.org },
        isPartOf: { "@id": ID.site },
        image: abs(ogDe(path)),
        about: d.selo,
        license: "https://creativecommons.org/licenses/by/4.0/",
        ...(d.arte_previa.length ? { citation: d.arte_previa } : {}),
      }],
    };
  };

  const r: Rota[] = [
    {
      path: "/",
      titulo: `${SITE.nome} · ${SITE.lema}`,
      descricao: SITE.descricao,
      secao: "Pesquisa aberta",
      atualizado: maior(dCaminhos, dVideos, dBiblioteca, dFontes, dOrigens, dAprendizado, dForum),
      markdown: () => [
        SITE.descricao,
        `O Harpya é mantido por ${SITE.autor}. Conteúdo sob CC BY 4.0, código sob MIT. Repositório: ${SITE.repositorio}`,
        `## Caminhos de pesquisa\n\n${caminhos.map((c) => `- [${c.data.titulo}](${abs(`/estudos/caminhos/${c.id}/`)}): ${c.data.resumo}`).join("\n")}`,
        `## Seções\n\n${lista([
          `[Origens](${abs("/origens/")}): linha do tempo das LLMs, de 1943 a 2026`,
          `[Vídeos](${abs("/videos/")}): ${VIDEOS.length} vídeos em ${MODULOS.length} módulos`,
          `[Equações](${abs("/equacoes/")}): as 16 camadas de um LLM`,
          `[Biblioteca](${abs("/biblioteca/")}): ${LIVROS.length} livros e ${ARTIGOS.length} artigos`,
          `[Fórum](${abs("/forum/")}): discussões no GitHub Discussions`,
        ])}`,
      ].join("\n\n"),
    },
    {
      path: "/comecando/",
      titulo: "Começando",
      descricao: `Para quem está começando: a série "${SERIE}", que explica como funciona um LLM do token ao espaço vetorial, sem pré-requisito.`,
      secao: "Começando",
      atualizado: maior(...COMECANDO.map((a) => a.data)),
      markdown: () => [
        `Série "${SERIE}", de ${SITE.autor}, em ${TOTAL_DA_SERIE} artigos, do concreto ao abstrato.`,
        COMECANDO.map((a) => `- [Artigo ${a.numero}: ${a.titulo}](${abs(`/comecando/${a.slug}/`)}): ${a.descricao}`).join("\n"),
      ].join("\n\n"),
      schema: () => [colecao("/comecando/", "Começando", `Série "${SERIE}".`,
        itemList(SERIE, COMECANDO.map((a) => ({ name: `Artigo ${a.numero}: ${a.titulo}`, url: abs(`/comecando/${a.slug}/`) }))))],
    },
    ...COMECANDO.map((a): Rota => ({
      path: `/comecando/${a.slug}/`,
      titulo: a.titulo,
      descricao: a.descricao,
      secao: `Começando · artigo ${a.numero}`,
      pai: "/comecando/",
      atualizado: a.data,
      markdown: () => `*${SERIE}, artigo ${a.numero} de ${TOTAL_DA_SERIE}.*\n\n${htmlParaMd(corpoDe(a.slug))}`,
      schema: () => [{
        "@type": "Article",
        "@id": `${abs(`/comecando/${a.slug}/`)}#artigo`,
        headline: a.titulo,
        description: a.descricao,
        url: abs(`/comecando/${a.slug}/`),
        inLanguage: "pt-BR",
        datePublished: a.data,
        dateModified: a.data,
        author: { "@id": ID.pessoa },
        publisher: { "@id": ID.org },
        isPartOf: [{ "@id": ID.site }, { "@type": "CreativeWorkSeries", name: SERIE, url: abs("/comecando/") }],
        position: a.numero,
        image: abs(ogDe(`/comecando/${a.slug}/`)),
        license: "https://creativecommons.org/licenses/by/4.0/",
        educationalLevel: "iniciante",
      }],
    })),
    {
      path: "/origens/",
      titulo: "Origens",
      descricao: "A linha do tempo das LLMs em sóis e eclipses: os marcos celebrados e as fundações que ficaram na sombra, de 1943 a 2026.",
      secao: "Origens",
      atualizado: dOrigens,
      imagens: PESSOAS.filter((p) => p.foto).map((p) => ({ url: abs(`/img/origens/${p.foto}.webp`), titulo: p.nome, legenda: `${p.nome}, ${p.papel}. ${p.credito ?? ""} ${p.licenca ?? ""}`.trim() })),
      markdown: () => [
        "Sóis são os marcos celebrados. Eclipses são as fundações que ficaram na sombra deles.",
        `## Linha do tempo\n\n${EVENTOS.map((e) => `- **${e.ano}, ${e.titulo}** (${e.tipo === "eclipse" ? "eclipse" : "marco"}). ${e.texto}${e.eq ? ` ${tex(e.eq)}` : ""}`).join("\n")}`,
        ...CAPITULOS.map((c) => [
          `## ${c.n}. ${c.titulo} (${c.periodo})`,
          c.abertura,
          ...c.eclipses.map((e) => `### ${e.ano}: ${e.titulo}\n\n*${e.quem}*\n\n${e.texto.join("\n\n")}${e.eq ? `\n\n$$\n${e.eq}\n$$` : ""}`),
          c.refs.length ? `**Referências.**\n\n${lista(c.refs.map((x) => `[${x.texto}](${x.url})`))}` : "",
        ].filter(Boolean).join("\n\n")),
      ].join("\n\n"),
      schema: () => [{
        "@type": "Article",
        "@id": `${abs("/origens/")}#artigo`,
        headline: "Origens: a linha do tempo das LLMs em sóis e eclipses",
        description: "Os marcos celebrados e as fundações que ficaram na sombra, de 1943 a 2026.",
        url: abs("/origens/"),
        inLanguage: "pt-BR",
        dateModified: dOrigens,
        author: { "@id": ID.pessoa },
        publisher: { "@id": ID.org },
        isPartOf: { "@id": ID.site },
        image: abs(ogDe("/origens/")),
        citation: CAPITULOS.flatMap((c) => c.refs.map((x) => x.url)),
        hasPart: itemList("Linha do tempo das LLMs", EVENTOS.map((e) => ({ name: `${e.ano}: ${e.titulo}`, url: `${abs("/origens/")}#linha` }))),
      }],
    },
    {
      path: "/aprendizado/",
      titulo: "Aprendizado de Máquina",
      descricao: "Dez ideias de 1949 a 1998 que ainda estão dentro das LLMs, com contexto, equações explicadas, exemplos com números e fontes primárias.",
      secao: "Aprendizado de Máquina",
      atualizado: dAprendizado,
      markdown: () => APRENDIZADO.map((a) => [
        `## ${a.ano}: ${a.titulo}`,
        a.autores ? `*${a.autores}*` : "",
        a.texto,
        a.contexto ? `### Contexto\n\n${a.contexto}` : "",
        a.mecanismo ? `### Como funciona\n\n${a.mecanismo}` : "",
        a.equacoes?.length ? `### As equações\n\n${a.equacoes.map((e, i) => `${i + 1}. ${e.texto}\n\n$$\n${e.tex}\n$$`).join("\n\n")}` : a.eq ? `$$\n${a.eq}\n$$` : "",
        a.exemplo ? `### Exemplo com números\n\n${a.exemplo}` : "",
        a.limites ? `### Limites\n\n${a.limites}` : "",
        a.legado ? `### O que virou hoje\n\n${a.legado}` : "",
        a.referencias?.length ? `### Fontes\n\n${a.referencias.map((r) => `- ${r.texto}${r.url ? ` ${r.url}` : ""}`).join("\n")}` : "",
      ].filter(Boolean).join("\n\n")).join("\n\n"),
      schema: () => [colecao("/aprendizado/", "Aprendizado de Máquina", "As primeiras tentativas de fazer a máquina aprender.",
        itemList("Marcos do aprendizado de máquina", APRENDIZADO.map((a) => ({ name: `${a.ano}: ${a.titulo}`, url: abs("/aprendizado/") }))))],
    },
    {
      path: "/videos/",
      titulo: "Vídeos",
      descricao: `Catálogo de ${VIDEOS.length} vídeos sobre LLMs, do token ao raciocínio, organizado em ${MODULOS.length} módulos e três níveis, com resumo em português.`,
      secao: "Vídeos",
      atualizado: dVideos,
      markdown: () => MODULOS.map((m) => {
        const vs = VIDEOS.filter((v) => v.modulo === m.numero);
        return `## ${rotuloModulo(m.numero)}: ${m.titulo}\n\n${m.subtitulo}\n\n${vs.map((v) => `- [${v.titulo}](${urlVideo(v.id)}), ${v.canal}. Nível: ${v.nivel}. ${v.resumo}`).join("\n")}`;
      }).join("\n\n"),
      schema: () => [colecao("/videos/", "Vídeos", `Catálogo de ${VIDEOS.length} vídeos sobre LLMs.`,
        itemList("Catálogo de vídeos", VIDEOS.map((v) => ({ name: v.titulo, url: urlVideo(v.id) }))))],
    },
    {
      path: "/estudos/",
      titulo: "Estudos",
      descricao: "Os caminhos válidos de eficiência em embeddings, tokens e busca vetorial.",
      secao: "Estudos",
      atualizado: dCaminhos,
      markdown: () => [
        `${caminhos.length} caminhos válidos, cada um com equação, custo conhecido, teste refutável e a arte prévia que já existe.`,
        caminhos.map((c) => `- [${c.data.numero}. ${c.data.titulo}](${abs(`/estudos/caminhos/${c.id}/`)}) (${c.data.selo}): ${c.data.resumo}`).join("\n"),
        `Linhas arquivadas: ${abs("/estudos/arquivados/")}`,
      ].join("\n\n"),
      schema: () => [colecao("/estudos/", "Estudos", "Os caminhos válidos de eficiência em embeddings, tokens e busca vetorial.",
        itemList("Caminhos válidos", caminhos.map((c) => ({ name: c.data.titulo, url: abs(`/estudos/caminhos/${c.id}/`) }))))],
    },
    ...caminhos.map(fichaCaminho),
    {
      path: "/estudos/a-ideia-mais-interessante/",
      titulo: IDEIA,
      descricao: DESC_IDEIA,
      secao: "Estudos · arquivado",
      pai: "/estudos/",
      atualizado: "2026-10-12",
      markdown: () => [
        "## O que medimos",
        "O programa testou curvatura constante (hiperbólica) e curvatura variável aprendida para recuperação, sob comparação justa: mesma dimensão, mesmos bytes, mesmo protocolo. Nenhuma das duas ganhou do espaço euclidiano.",
        "## Por que o resultado faz sentido",
        "No modelo de Lorentz, a distância hiperbólica é uma função monótona de um produto interno com um sinal trocado:",
        "$$\nd_{\\mathbb H}(x,y)=\\operatorname{arcosh}\\big(-\\langle x,y\\rangle_{\\mathcal L}\\big),\\qquad \\langle x,y\\rangle_{\\mathcal L}=-x_0y_0+\\sum_{i\\ge1}x_iy_i\n$$",
        "Ordenar por distância hiperbólica é ordenar por um produto interno. Em dimensão alta, os vetores de modelos hiperbólicos pré-treinados ficam numa casca fina, e o cosseno comum reproduz a ordenação geodésica quase por completo.",
        "## O que a literatura diz",
        lista([
          "Em grafos de conhecimento a 32 dimensões, a vantagem hiperbólica é de décimos de ponto; os próprios autores relatam desempenho similar em 500 dimensões (Chami e coautores, 2020).",
          "Uma reavaliação achou um erro no baseline euclidiano de um benchmark muito usado; corrigido, o modelo euclidiano empata ou vence (Katsman e Gilbert, 2025).",
          "Em hierarquias puras e poucas dimensões, o ganho é grande: é aí que a linha continua viva (Nickel e Kiela, 2017).",
        ]),
        "**Registro:** a geometria hiperbólica é uma linha de pesquisa real e ativa. Ela não serve para acelerar embeddings de texto de alta dimensão, mas representa bem hierarquias em dimensão baixa.",
      ].join("\n\n"),
      schema: () => [{
        "@type": "ScholarlyArticle",
        "@id": `${abs("/estudos/a-ideia-mais-interessante/")}#artigo`,
        headline: IDEIA,
        description: DESC_IDEIA,
        url: abs("/estudos/a-ideia-mais-interessante/"),
        inLanguage: "pt-BR",
        dateModified: "2026-10-12",
        author: { "@id": ID.pessoa },
        publisher: { "@id": ID.org },
        isPartOf: { "@id": ID.site },
        image: abs(ogDe("/estudos/a-ideia-mais-interessante/")),
        about: "Geometria hiperbólica em embeddings",
      }],
    },
    {
      path: "/estudos/arquivados/",
      titulo: arquivados.titulo,
      descricao: arquivados.descricao,
      secao: "Estudos",
      pai: "/estudos/",
      atualizado: arquivados.atualizado,
      markdown: () => arquivados.corpo,
    },
    {
      path: "/equacoes/",
      titulo: equacoes.titulo,
      descricao: equacoes.descricao,
      secao: "Equações",
      atualizado: equacoes.atualizado,
      markdown: () => equacoes.corpo,
      schema: () => [{
        "@type": "TechArticle",
        "@id": `${abs("/equacoes/")}#artigo`,
        headline: equacoes.titulo,
        description: equacoes.descricao,
        url: abs("/equacoes/"),
        inLanguage: "pt-BR",
        dateModified: equacoes.atualizado,
        author: { "@id": ID.pessoa },
        publisher: { "@id": ID.org },
        isPartOf: { "@id": ID.site },
        image: abs(ogDe("/equacoes/")),
      }],
    },
    {
      path: "/biblioteca/",
      titulo: "Biblioteca",
      descricao: "Livros, artigos acadêmicos e fontes de alta qualidade sobre matemática, física e IA.",
      secao: "Biblioteca",
      atualizado: dBiblioteca,
      markdown: () => [
        `## Livros\n\n${LIVROS.map((l) => `- **${l.titulo}**, ${l.autores}${l.ano ? ` (${l.ano})` : ""}. ${l.resenha ?? ""}${l.uso ? ` No projeto: ${l.uso}.` : ""}${l.url ? ` Edição online: ${l.url}` : ""}`).join("\n")}`,
        `## Artigos\n\n${ARTIGOS.map((a) => `- ${a.ano}. [${a.titulo}](${a.url}), ${a.autores}. ${a.rotulo}.`).join("\n")}`,
      ].join("\n\n"),
      schema: () => [colecao("/biblioteca/", "Biblioteca", "Livros, artigos acadêmicos e fontes sobre matemática, física e IA.", {
        "@type": "ItemList",
        name: "Livros e artigos",
        numberOfItems: LIVROS.length + ARTIGOS.length,
        itemListElement: [
          ...LIVROS.map((l, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Book", name: l.titulo, author: l.autores.split(", ").map((n) => ({ "@type": "Person", name: n })), ...(l.ano ? { datePublished: String(l.ano) } : {}), ...(l.resenha ? { description: l.resenha } : {}), ...(l.capa ? { image: abs(l.capa) } : {}), ...(l.url ? { url: l.url } : {}) } })),
          ...ARTIGOS.map((a, i) => ({ "@type": "ListItem", position: LIVROS.length + i + 1, item: { "@type": "ScholarlyArticle", headline: a.titulo, name: a.titulo, author: a.autores, datePublished: String(a.ano), url: a.url } })),
        ],
      })],
    },
    {
      path: "/biblioteca/fontes/",
      titulo: "Fontes do site",
      descricao: "Fontes do Harpya, uma a uma: instituições, artigos, livros, vídeos, referências, créditos de imagens, feeds e licenças.",
      secao: "Biblioteca",
      pai: "/biblioteca/",
      atualizado: maior(dFontes, dVideos, dBiblioteca, dOrigens, dCaminhos, dataNews, "2026-10-13"),
      markdown: () => markdownDasFontes(gruposFontes),
      schema: () => [colecao("/biblioteca/fontes/", "Fontes do site", "Referências, fontes e créditos do Harpya.",
        itemList("Fontes do site", todasFontes.map((f) => ({ name: f.nome, url: f.url }))))],
    },
    {
      path: "/biblioteca/glossario/",
      titulo: glossario.titulo,
      descricao: glossario.descricao,
      secao: "Biblioteca",
      pai: "/biblioteca/",
      atualizado: glossario.atualizado,
      markdown: () => glossario.corpo,
      schema: () => [{
        "@type": "DefinedTermSet",
        "@id": `${abs("/biblioteca/glossario/")}#termos`,
        name: "Glossário do Harpya",
        url: abs("/biblioteca/glossario/"),
        inLanguage: "pt-BR",
        hasDefinedTerm: termos.map((t) => ({ "@type": "DefinedTerm", name: t.termo, description: t.def.replace(/\$([^$]*)\$/g, "$1"), inDefinedTermSet: `${abs("/biblioteca/glossario/")}#termos` })),
      }],
    },
    {
      path: "/news/",
      titulo: "News",
      descricao: "Manchetes de laboratórios de IA e do arXiv ligadas a embeddings, busca vetorial e eficiência.",
      secao: "News",
      atualizado: maior(dataNews),
      markdown: () => `Manchetes coletadas por RSS e filtradas pelos temas do Harpya. Atualização a cada 6 horas.\n\n${news.map((n) => `- ${n.data}, ${n.fonte}: [${n.titulo}](${n.url})`).join("\n")}`,
    },
    {
      path: "/forum/",
      titulo: "Fórum",
      descricao: "Fórum do Harpya: perguntas, reproduções e propostas, via GitHub Discussions.",
      secao: "Fórum",
      atualizado: dForum,
      markdown: () => [
        `As discussões acontecem no GitHub Discussions do repositório ${SITE.repositorio}.`,
        PAUTAS.length ? `## Discussões e pautas\n\n${PAUTAS.map((p) => `- ${p.criada ? "Discussão" : "Pauta proposta"} (${p.categoria}): [${p.titulo}](${p.href.startsWith("http") ? p.href : abs(p.href)})`).join("\n")}` : "",
      ].filter(Boolean).join("\n\n"),
      schema: () => {
        const reais = PAUTAS.filter((p) => p.criada);
        return [colecao("/forum/", "Fórum", "Perguntas, reproduções e propostas, via GitHub Discussions.", {
          "@type": "ItemList",
          name: "Discussões",
          numberOfItems: reais.length,
          itemListElement: reais.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "DiscussionForumPosting", headline: p.titulo, url: p.href.startsWith("http") ? p.href : abs(p.href), datePublished: p.data, author: { "@id": ID.org } } })),
        })];
      },
    },
    ...pautasComPagina.map((p): Rota => ({
      path: `/forum/${p.id}/`,
      titulo: p.data.titulo,
      descricao: (p.body ?? "").replace(/\s+/g, " ").trim().slice(0, 190) || p.data.titulo,
      secao: `Fórum · ${p.data.categoria}`,
      pai: "/forum/",
      atualizado: p.data.proposta_em,
      markdown: () => [`Categoria: ${p.data.categoria}. Aberta em ${p.data.proposta_em}.`, (p.body ?? "").trim(), p.data.links.length ? `Referências:\n\n${lista(p.data.links)}` : ""].filter(Boolean).join("\n\n"),
      schema: () => [{
        "@type": "DiscussionForumPosting",
        "@id": `${abs(`/forum/${p.id}/`)}#discussao`,
        headline: p.data.titulo,
        text: (p.body ?? "").trim(),
        url: abs(`/forum/${p.id}/`),
        datePublished: p.data.proposta_em,
        inLanguage: "pt-BR",
        author: { "@id": ID.org },
        isPartOf: { "@id": `${abs("/forum/")}#pagina` },
      }],
    })),
    {
      path: "/termos-de-uso/",
      titulo: termosDeUso.titulo,
      descricao: termosDeUso.descricao,
      secao: "Mindscope Labs",
      atualizado: termosDeUso.atualizado,
      markdown: () => termosDeUso.corpo,
    },
    {
      path: "/sobre/",
      titulo: sobre.titulo,
      descricao: sobre.descricao,
      secao: "Sobre",
      atualizado: sobre.atualizado,
      markdown: () => sobre.corpo,
      schema: () => [{ "@type": "AboutPage", "@id": `${abs("/sobre/")}#pagina`, url: abs("/sobre/"), name: sobre.titulo, inLanguage: "pt-BR", isPartOf: { "@id": ID.site }, about: { "@id": ID.org }, author: { "@id": ID.pessoa } }],
    },
  ];
  cache = r;
  return r;
}

export async function rotaDe(path: string): Promise<Rota | undefined> {
  return (await rotas()).find((r) => r.path === path);
}

/** Entidades presentes em toda página: site, organização e autor (mesmos @id em todo o site). */
export function entidades() {
  return [
    {
      "@type": "WebSite",
      "@id": ID.site,
      url: `${URL_SITE}/`,
      name: SITE.nome,
      alternateName: "Projeto Harpya",
      description: SITE.descricao,
      inLanguage: "pt-BR",
      publisher: { "@id": ID.org },
      author: { "@id": ID.pessoa },
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
    {
      "@type": "Organization",
      "@id": ID.org,
      name: SITE.nome,
      alternateName: "Projeto Harpya",
      url: `${URL_SITE}/`,
      logo: { "@type": "ImageObject", url: abs("/img/harpya-logo-512.png"), width: 512, height: 512 },
      description: SITE.descricao,
      founder: { "@id": ID.pessoa },
      sameAs: [SITE.repositorio],
    },
    {
      "@type": "Person",
      "@id": ID.pessoa,
      name: SITE.autor,
      url: abs("/sobre/"),
      sameAs: ["https://github.com/freddominugez"],
    },
  ];
}

/** Trilha Início > seção > página, com os títulos do registro. */
export async function trilha(path: string) {
  const todas = await rotas();
  const cadeia: Rota[] = [];
  let atual = todas.find((r) => r.path === path);
  while (atual) {
    cadeia.unshift(atual);
    atual = atual.pai ? todas.find((r) => r.path === atual!.pai) : undefined;
  }
  return [{ nome: "Início", url: abs("/") }, ...cadeia.map((r) => ({ nome: r.titulo, url: abs(r.path) }))];
}
