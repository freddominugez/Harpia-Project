# Harpya

Pesquisa aberta sobre eficiência de LLMs: embeddings, tokens, pesos e busca vetorial. Só entram caminhos com equação, custo conhecido e teste refutável.

**Carlos Frederico Domínguez - Apps by Vulcan**

## O que tem aqui

| Parte | Onde fica |
|---|---|
| Site estático (Astro 5, sem servidor) | `src/` |
| 12 caminhos válidos, um arquivo por caminho | `src/content/caminhos/*.md` |
| Catálogo de vídeos, módulos, livros, artigos, fontes, feeds, linha do tempo, pautas: um arquivo por item | `src/content/*/` (esquemas em `src/content.config.ts`) |
| Painel de conteúdo (Sveltia CMS) em `/admin` | `public/admin/`, `docs/PAINEL_ADMIN.md` |
| Curadoria diária (tarefa agendada do Claude) e lista de fontes monitoradas | `scripts/curadoria_diaria.py`, `src/content/fontes-monitoradas/`, `docs/TAREFA_CURADORIA.md` |
| Robô de discussões (pauta aprovada vira discussão no GitHub) | `scripts/criar_discussoes.py`, `.github/workflows/discussoes.yml` |
| SEO técnico e GEO (sitemap, robots, JSON-LD, OG, RSS, llms.txt, gêmeos .md, IndexNow, Lighthouse CI) | `src/lib/rotas.ts`, `docs/SEO_GEO.md`, `docs/GEO_MONITORAMENTO.md` |
| Equações das 16 camadas (KaTeX renderizado no build) | `src/pages/equacoes.md` |
| Fórum (Giscus, GitHub Discussions) | `src/components/Giscus.astro`, configuração em `src/config.ts` |
| Robô de news por RSS, a cada 6 horas | `scripts/coletar_news.py`, `.github/workflows/news.yml` |
| Coleta semanal de candidatos para curadoria | `scripts/coletar_candidatos.py`, `.github/workflows/curadoria.yml` |
| Agente de curadoria (prompt e régua) | `docs/CURADORIA.md` |
| Passo a passo de publicação | `docs/DEPLOY.md` |
| Sistema visual (tokens, componentes, responsivo) | `src/styles/global.css` |
| Componentes do redesign | `src/components/` (Header, Hero, Kpi, StudyTrackCard, ArticleCard, VideoFeature, ForumList, JoinCommunityCard, Footer, Breadcrumb, PageIntro, ArticleSidebar, Tag, ResponsiveGrid) |
| Conteúdo editorial da home e de Origens | `src/data/home.ts`, `src/data/origens.ts` |
| Busca do site (índice gerado no build) | `src/lib/search.ts` → `/busca.json`; interações em `src/scripts/site.ts` |
| QA do redesign e capturas | `scripts/qa_redesign.py`, `docs/QA_REDESSIGN.md`, `docs/qa/` |

## Rodar no computador

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera dist/
```

Requer Node 20.3 ou mais novo (o arquivo `.nvmrc` indica 22).

## Testar

```bash
npm run check                                   # tipos (astro check)
npm run build
python3 -m http.server 4321 --directory dist &  # serve o build
pip install playwright && python3 -m playwright install chromium
python3 scripts/qa_redesign.py --base http://localhost:4321 --shots docs/qa
```

O script confere 9 larguras (1672 a 320 px) em todas as rotas, links internos e âncoras, imagens, erros de console, menu, busca e índice lateral, e o SEO de cada página (título e descrição únicos, canonical, hreflang, Open Graph, JSON-LD, sitemap, gêmeo .md, robots.txt, llms.txt, RSS). Sai com código 1 se algum gate falhar. O painel é validado à parte com `python3 scripts/validar_cms.py`.

## Sistema visual

Tokens: grafite `#282D33`, dourado `#C79A39`, ardósia `#68717A`, borda `#E4E7EA`, fundo `#F8F9FA`, branco `#FFFFFF`. A home segue `referencia-home-exata.png` (cabeçalho compacto, hero com a harpia original, 4 indicadores reais, painel em 3 colunas, rodapé grafite). As fichas dos caminhos seguem `referencia-visual-aprovada.png` (trilha, etiquetas, equação central, seções numeradas, índice lateral fixo, trilhas relacionadas e discussão). Breakpoints: acima de 1100 px, 3 colunas; de 761 a 1100 px, 2 colunas com o fórum abaixo; até 760 px, 1 coluna.

A arte `public/img/harpya-original.png` é a original aprovada: não espelhar, girar nem substituir. Para tamanhos pequenos use `harpya-mark-head.png`.

## Publicar

Veja `docs/DEPLOY.md`. Resumo: criar o repositório no GitHub, fazer push, importar na Vercel (plano Hobby, gratuito) e ligar o Giscus.

## Editar conteúdo

- **Novo caminho:** copie um arquivo de `src/content/caminhos/`, mude o nome e o frontmatter. A página e o card aparecem sozinhos.
- **Pelo painel (recomendado):** https://www.harpya.org/admin/, login com a conta do GitHub. Passo a passo em `docs/PAINEL_ADMIN.md`.
- **Novo vídeo à mão:** crie `src/content/videos/<ID>.json` com `id`, `titulo`, `canal`, `modulo` (0 a 11, ver `src/content/modulos/`), `nivel`, `resumo`, `status` e as datas. Confira o ID antes (regra em `docs/CURADORIA.md`). A página `/videos/` organiza por módulo e nível, e a home mostra uma seleção da semana, um vídeo por nível.
- **Novo artigo ou livro à mão:** um arquivo em `src/content/artigos/` ou `src/content/livros/`.
- **Rascunho:** `status: "rascunho"` guarda o item no repositório sem mostrar em lugar nenhum do site.
- **Matemática:** em markdown use `$...$` e `$$...$$`; em páginas `.astro` use ``<M t={String.raw`...`} />`` (com aspas comuns, as barras invertidas se perdem).
- **Home:** trilhas e artigos em destaque ficam em `src/data/home.ts`; as pautas do fórum vêm de `src/content/pautas/`. Os números dos indicadores são calculados do acervo.
- **Página nova:** acrescente a rota em `src/lib/rotas.ts` para entrar no sitemap, no llms.txt e ganhar imagem OG e versão .md (ver `docs/SEO_GEO.md`).

## Regras editoriais

- Todo item técnico leva selo: medido no projeto, arte prévia, lacuna, teste ou enquadramento.
- Analogia física não é prova.
- "Nenhum uso encontrado" sempre com data da busca.
- Sem travessões no texto.

## Licença

Código sob MIT (`LICENSE`). Conteúdo sob CC BY 4.0 (`LICENSE-CONTEUDO.md`).
