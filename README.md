# Harpia Project

Pesquisa aberta sobre eficiência de LLMs: embeddings, tokens, pesos e busca vetorial. Só entram caminhos com equação, custo conhecido e teste refutável.

**Carlos Frederico Domínguez - Apps by Vulcan**

## O que tem aqui

| Parte | Onde fica |
|---|---|
| Site estático (Astro 5, sem servidor) | `src/` |
| 12 caminhos válidos, um arquivo por caminho | `src/content/caminhos/*.md` |
| Vídeos, livros, artigos, 30 fontes, feeds, linha do tempo | `src/data/*.json` |
| Equações das 16 camadas (KaTeX renderizado no build) | `src/pages/equacoes.md` |
| Fórum (Giscus, GitHub Discussions) | `src/components/Giscus.astro`, configuração em `src/config.ts` |
| Robô de news por RSS, a cada 6 horas | `scripts/coletar_news.py`, `.github/workflows/news.yml` |
| Coleta semanal de candidatos para curadoria | `scripts/coletar_candidatos.py`, `.github/workflows/curadoria.yml` |
| Agente de curadoria (prompt e régua) | `docs/CURADORIA.md` |
| Passo a passo de publicação | `docs/DEPLOY.md` |

## Rodar no computador

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera dist/
```

Requer Node 20.3 ou mais novo (o arquivo `.nvmrc` indica 22).

## Publicar

Veja `docs/DEPLOY.md`. Resumo: criar o repositório no GitHub, fazer push, importar na Vercel (plano Hobby, gratuito) e ligar o Giscus.

## Editar conteúdo

- **Novo caminho:** copie um arquivo de `src/content/caminhos/`, mude o nome e o frontmatter. A página e o card aparecem sozinhos.
- **Novo vídeo:** acrescente `{ "id", "titulo", "canal", "trilha" }` em `src/data/videos.json` (trilha: `mat`, `redes` ou `llm`).
- **Novo artigo ou livro:** `src/data/artigos.json` e `src/data/livros.json`.
- **Matemática:** em markdown use `$...$` e `$$...$$`; em páginas `.astro` use `<M t="..." />`.

## Regras editoriais

- Todo item técnico leva selo: medido no projeto, arte prévia, lacuna, teste ou enquadramento.
- Analogia física não é prova.
- "Nenhum uso encontrado" sempre com data da busca.
- Sem travessões no texto.

## Licença

Código sob MIT (`LICENSE`). Conteúdo sob CC BY 4.0 (`LICENSE-CONTEUDO.md`).
