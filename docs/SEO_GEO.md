# SEO técnico e GEO

Como o site se apresenta para buscadores (Google, Bing) e para assistentes de IA (ChatGPT, Claude, Perplexity, Gemini). Tudo é gerado no build a partir do registro de páginas em `src/lib/rotas.ts`; o QA (`scripts/qa_redesign.py`) trava o deploy se algo sair do padrão.

## Arquitetura

| Peça | Onde | O que faz |
|---|---|---|
| Registro de páginas | `src/lib/rotas.ts` | Título, descrição, seção, data real de atualização, JSON-LD e versão markdown de cada página indexável |
| Cabeçalho | `src/layouts/Base.astro` | title, description, robots, canonical, hreflang, Open Graph, Twitter Card, JSON-LD, links alternativos |
| Sitemap | `src/pages/sitemap.xml.ts` → `/sitemap.xml` | Uma URL por página indexável (30 em 13/10/2026), com `lastmod` tirado do conteúdo e sitemap de imagens (11 retratos de Origens) |
| Índice de sitemap | `/sitemap-index.xml` | Aponta para `/sitemap.xml` (compatibilidade) |
| robots.txt | `src/pages/robots.txt.ts` | Tudo liberado, `/admin/` fechado, regras explícitas para robôs de IA, linha `Sitemap` |
| Imagens OG | `src/pages/og/[...rota].png.ts` | Uma imagem 1200 × 630 por página, gerada com satori 0.33.5 e @resvg/resvg-js 2.6.2, fonte Inter local |
| RSS | `src/pages/rss.xml.ts` → `/rss.xml` | Caminhos e itens publicados, mais recentes primeiro (@astrojs/rss 4.0.19) |
| Gêmeos em markdown | `src/pages/[...rota].md.ts` | `/index.md`, `/origens.md`, `/estudos/caminhos/<slug>.md`... |
| llms.txt | `/llms.txt` e `/llms-full.txt` | Índice e texto completo para modelos de linguagem |
| IndexNow | `public/cbf6854fd7740a5bba6db5c714140b4b.txt`, `.github/workflows/indexnow.yml` | Avisa Bing e parceiros a cada deploy de produção |
| Lighthouse CI | `lighthouserc.json`, `.github/workflows/lighthouse.yml` | SEO ≥ 0,95 e acessibilidade ≥ 0,95 travam; desempenho e Core Web Vitals avisam |
| Fonte | `@fontsource-variable/inter` 5.3.0 | Inter servida pelo próprio site, com `preload` do arquivo latino (sem Google Fonts) |
| Cabeçalhos HTTP | `vercel.json` | `X-Robots-Tag` no painel e nos `.md`, cache longo em `/img/` |

## Regras por página

- **URL canônica:** sempre `https://www.harpya.org/<rota>/`, com barra final. O domínio sem `www` responde 308 para o `www` (configuração de domínio na Vercel). Página inexistente responde **404 de verdade** com `noindex`.
- **Título:** `<Título da página> · Harpya`; na home, `Harpya · Conhecimento transforma horizontes`. Único em todo o site (o QA confere).
- **Descrição:** de 50 a 200 caracteres, única (o QA confere). Nos caminhos é o resumo; nas páginas de texto, o campo "Descrição (SEO)" do painel.
- **hreflang:** `pt-BR` e `x-default`, ambos para a própria URL (o site tem um idioma só).
- **Open Graph e Twitter:** título, descrição, URL, imagem própria da página (1200 × 630, com `og:image:alt`) e `summary_large_image`. Caminhos, Origens, Equações e a ideia não euclidiana saem como `og:type=article`.
- **robots:** `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`. O painel e a 404 levam `noindex`.
- **Um `<h1>` por página** (o QA confere).

## Dados estruturados (JSON-LD)

Toda página carrega um `@graph` com as mesmas três entidades, com `@id` fixo, para o site ser reconhecido como uma coisa só:

- `WebSite` (`https://www.harpya.org/#website`)
- `Organization` Harpya (`#organizacao`), com logo e `sameAs` do repositório
- `Person` Carlos Frederico Domínguez (`#autor`), com `url` para /sobre/ e `sameAs` do GitHub

Mais a `WebPage` da rota e, fora da home, a `BreadcrumbList`. Por tipo de página:

| Página | Tipo |
|---|---|
| Caminhos | `TechArticle` (ou `ScholarlyArticle` quando o estatuto é "medido"), com autor, data e arte prévia em `citation` |
| A ideia mais interessante | `ScholarlyArticle` |
| Origens | `Article` com `ItemList` da linha do tempo e as referências primárias em `citation` |
| Equações | `TechArticle` |
| Estudos, Vídeos, Aprendizado, Fontes | `CollectionPage` com `ItemList` |
| Biblioteca | `CollectionPage` com `Book` e `ScholarlyArticle` |
| Glossário | `DefinedTermSet` com um `DefinedTerm` por termo |
| Fórum | `CollectionPage`; `DiscussionForumPosting` só para discussões que existem no GitHub |
| Sobre | `AboutPage` |

Vídeos não usam `VideoObject`: o site lista e resume, não incorpora o vídeo (decisão 4 do contrato). A lista sai como `ItemList` de links para o YouTube.

Teste qualquer página em https://search.google.com/test/rich-results e https://validator.schema.org/.

## Datas reais (lastmod)

Nada usa a data do build. Cada página tem a data do próprio conteúdo:

- caminhos: campo `atualizado` do frontmatter;
- páginas de texto (Sobre, Equações, Glossário, Arquivados): campo **Atualizado em** no painel;
- listas (Vídeos, Biblioteca, Fontes, Origens, Aprendizado): o `adicionado_em` mais recente entre os itens publicados;
- News: data da manchete mais recente; Fórum: data da pauta mais recente;
- home: a mais recente de todas.

Ao mudar o texto de uma página de verdade, atualize a data. Correção de vírgula não precisa.

## Core Web Vitals

Metas: LCP abaixo de 2,5 s, CLS abaixo de 0,1, INP abaixo de 200 ms. Na rodada de 12/10/2026 (Lighthouse desktop, build local): desempenho, acessibilidade, boas práticas e SEO em 100 nas páginas medidas (a seis desde 13/10/2026, com um artigo de Começando); LCP entre 0,5 e 1,0 s; CLS no máximo 0,05. O que sustenta isso: site estático, fonte local com `preload`, imagens com largura e altura, `loading="lazy"` abaixo da dobra, KaTeX renderizado no build, nenhum script de terceiros na carga inicial (o Giscus só carrega na área de discussão).

## Google Search Console

O site ainda precisa ser cadastrado; isso exige o login de Carlos Frederico.

1. Abra https://search.google.com/search-console e clique em **Adicionar propriedade**.
2. Escolha **Domínio** e digite `harpya.org` (cobre www e sem www).
3. O Google mostra um registro **TXT** (`google-site-verification=...`). Crie esse registro no DNS do domínio (Cloudflare → DNS → Add record → Type TXT, Name `@`, Content o valor inteiro). Clique em **Verificar**. Pode levar alguns minutos.
4. Alternativa sem DNS: escolha **Prefixo do URL** com `https://www.harpya.org/`, método **Tag HTML**, copie só o valor de `content` e cole em `VERIFICACAO.google` em `src/config.ts`. Depois do deploy, clique em **Verificar**.
5. Em **Sitemaps**, envie `https://www.harpya.org/sitemap.xml`.
6. Em **Inspeção de URL**, peça indexação da home e de dois ou três caminhos.

## Bing Webmaster Tools

1. Abra https://www.bing.com/webmasters e entre com uma conta Microsoft.
2. Use **Importar do Google Search Console** (mais rápido) ou adicione `https://www.harpya.org/` e verifique por registro CNAME/TXT ou pela meta `msvalidate.01` (valor em `VERIFICACAO.bing` em `src/config.ts`).
3. Envie o sitemap `https://www.harpya.org/sitemap.xml`.
4. O IndexNow já avisa o Bing a cada deploy; o painel do Bing mostra as URLs recebidas em **IndexNow**.

## IndexNow

A chave pública fica em `https://www.harpya.org/cbf6854fd7740a5bba6db5c714140b4b.txt`. O workflow `indexnow` roda quando a Vercel informa ao GitHub um deploy de **Production** bem-sucedido e envia as URLs do sitemap para `api.indexnow.org` (Bing, Yandex, Seznam, Naver e outros compartilham o aviso). O Google não usa IndexNow; para ele valem sitemap e Search Console. Para trocar a chave, gere outro valor hexadecimal, renomeie o arquivo em `public/` e troque `CHAVE` no workflow.

## GEO: ser encontrado e citado por assistentes de IA

### Acesso

`robots.txt` libera explicitamente, um a um, os robôs de busca, de resposta acionada pelo usuário e de treino: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, CCBot, meta-externalagent, Meta-WebIndexer, Amazonbot, DuckAssistBot, MistralAI-User e Bingbot (decisão 5: treino liberado). Cada grupo repete `Disallow: /admin/`, porque um grupo próprio substitui o grupo `*`.

O DNS na Cloudflare fica **só DNS** (nuvem cinza), sem proxy e sem o bloqueio de robôs de IA da Cloudflare. Se um dia o proxy for ligado, desative em **Security → Bots** as opções "Block AI bots" e "AI Labyrinth", e confira que o "Managed robots.txt" está desligado, senão ele reescreve o `robots.txt` do site.

### Formatos legíveis por máquina

- **Gêmeos em markdown:** cada página indexável tem uma versão `.md` no mesmo endereço (`/origens/` → `/origens.md`; a home é `/index.md`), ligada pelo HTML com `<link rel="alternate" type="text/markdown">`. Os `.md` levam `X-Robots-Tag: noindex` para não competir com o HTML no Google.
- **`/llms.txt`:** índice no formato de llmstxt.org (título, resumo, seções com links para os `.md`). O Google declarou que não usa esse arquivo; outros assistentes e ferramentas de agentes leem.
- **`/llms-full.txt`:** o texto de todas as páginas num arquivo só.
- **RSS** em `/rss.xml`, anunciado em todas as páginas.

### Padrões de citação

- Cada `.md` abre com página, autor, data, licença e uma linha **Como citar** pronta.
- Cada caminho mostra no fim o bloco **Como citar** com o mesmo texto e o link para o `.md`.
- Nome do projeto, nome do autor e URL são sempre os mesmos em título, JSON-LD, rodapé, `.md` e `llms.txt`. Não variar a grafia ("Harpya", "Carlos Frederico Domínguez").
- Conteúdo citável: cada caminho diz o mecanismo em equação, o que foi medido, o teste e a regra de parada, em frases curtas e autocontidas. Número sempre com o contexto (base, hardware, comparação).

## Checklist de página nova

1. Crie a página e use `<Base titulo="..." descricao="...">`.
2. Acrescente a rota em `src/lib/rotas.ts` (título, descrição, seção, data, markdown e, se fizer sentido, JSON-LD).
3. `npm run build` e `python3 scripts/qa_redesign.py`: o QA acusa página fora do sitemap, sem gêmeo, com título repetido ou JSON-LD inválido.
