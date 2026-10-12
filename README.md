# Harpya

Pesquisa aberta sobre eficiência de LLMs: embeddings, tokens, pesos e busca vetorial. Só entram caminhos com equação, custo conhecido e teste refutável.

**Carlos Frederico Domínguez - Apps by Vulcan**

## O que tem aqui

| Parte | Onde fica |
|---|---|
| Site estático (Astro 5, sem servidor) | `src/` |
| 12 caminhos válidos, um arquivo por caminho | `src/content/caminhos/*.md` |
| Catálogo de 106 vídeos em 12 módulos e 3 níveis, livros, artigos, 30 fontes, feeds, linha do tempo | `src/data/*.json` |
| Equações das 16 camadas (KaTeX renderizado no build) | `src/pages/equacoes.md` |
| Fórum (Giscus, GitHub Discussions) | `src/components/Giscus.astro`, configuração em `src/config.ts` |
| Robô de news por RSS, a cada 6 horas | `scripts/coletar_news.py`, `.github/workflows/news.yml` |
| Coleta semanal de candidatos para curadoria | `scripts/coletar_candidatos.py`, `.github/workflows/curadoria.yml` |
| Agente de curadoria (prompt e régua) | `docs/CURADORIA.md` |
| Passo a passo de publicação | `docs/DEPLOY.md` |
| Sistema visual (tokens, componentes, responsivo) | `src/styles/global.css` |
| Componentes do redesign | `src/components/` (Header, Hero, Kpi, StudyTrackCard, ArticleCard, VideoFeature, ForumList, JoinCommunityCard, Footer, Breadcrumb, PageIntro, ArticleSidebar, Tag, ResponsiveGrid) |
| Conteúdo editorial da home | `src/data/home.ts` |
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

O script confere 9 larguras (1672 a 320 px) em todas as rotas, links internos e âncoras, imagens, erros de console, menu, busca e índice lateral. Sai com código 1 se algum gate falhar.

## Sistema visual

Tokens: grafite `#282D33`, dourado `#C79A39`, ardósia `#68717A`, borda `#E4E7EA`, fundo `#F8F9FA`, branco `#FFFFFF`. A home segue `referencia-home-exata.png` (cabeçalho compacto, hero com a harpia original, 4 indicadores reais, painel em 3 colunas, rodapé grafite). As fichas dos caminhos seguem `referencia-visual-aprovada.png` (trilha, etiquetas, equação central, seções numeradas, índice lateral fixo, trilhas relacionadas e discussão). Breakpoints: acima de 1100 px, 3 colunas; de 761 a 1100 px, 2 colunas com o fórum abaixo; até 760 px, 1 coluna.

A arte `public/img/harpya-original.png` é a original aprovada: não espelhar, girar nem substituir. Para tamanhos pequenos use `harpya-mark-head.png`.

## Publicar

Veja `docs/DEPLOY.md`. Resumo: criar o repositório no GitHub, fazer push, importar na Vercel (plano Hobby, gratuito) e ligar o Giscus.

## Editar conteúdo

- **Novo caminho:** copie um arquivo de `src/content/caminhos/`, mude o nome e o frontmatter. A página e o card aparecem sozinhos.
- **Novo vídeo:** acrescente um item em `src/data/videos.json` com `id`, `titulo`, `canal`, `modulo` (0 a 11, ver `src/data/modulos.json`), `nivel` e `resumo`. Confira o ID antes (regra em `docs/CURADORIA.md`). A página `/videos/` organiza por módulo e nível, e a home mostra uma seleção da semana, um vídeo por nível.
- **Novo artigo ou livro:** `src/data/artigos.json` e `src/data/livros.json`.
- **Matemática:** em markdown use `$...$` e `$$...$$`; em páginas `.astro` use ``<M t={String.raw`...`} />`` (com aspas comuns, as barras invertidas se perdem).
- **Home:** trilhas, artigos em destaque, vídeo e pautas do fórum ficam em `src/data/home.ts`. Os números dos indicadores são calculados do acervo.

## Regras editoriais

- Todo item técnico leva selo: medido no projeto, arte prévia, lacuna, teste ou enquadramento.
- Analogia física não é prova.
- "Nenhum uso encontrado" sempre com data da busca.
- Sem travessões no texto.

## Licença

Código sob MIT (`LICENSE`). Conteúdo sob CC BY 4.0 (`LICENSE-CONTEUDO.md`).
