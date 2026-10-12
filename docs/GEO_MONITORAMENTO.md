# Monitoramento de GEO

Como saber se buscadores e assistentes de IA estão encontrando, lendo e citando o Harpya. Rotina sugerida: **uma vez por mês**, 20 minutos. Anote os resultados na tabela do fim.

## 1. Os robôs estão chegando?

**Vercel → projeto → Logs** (ou Observability), filtre por `User-Agent`:

| Procure | Quem é | O que significa |
|---|---|---|
| `Googlebot` | Google Search | Indexação normal |
| `bingbot` | Bing (e Copilot) | Indexação normal |
| `GPTBot` | OpenAI, treino | Conteúdo entra em modelos futuros |
| `OAI-SearchBot` | Busca do ChatGPT | Pode aparecer nas respostas com fonte |
| `ChatGPT-User` | Usuário do ChatGPT abriu a página | Citação ao vivo |
| `ClaudeBot`, `Claude-SearchBot`, `Claude-User` | Anthropic: treino, busca, acesso do usuário | Idem |
| `PerplexityBot`, `Perplexity-User` | Perplexity | Indexação e citação ao vivo |
| `CCBot` | Common Crawl | Base usada por muitos modelos abertos |

Sinal bom: pedidos a `/llms.txt`, `/llms-full.txt` e aos `.md`. Sinal ruim: respostas 403 ou 429 para esses robôs (indica bloqueio em algum proxy).

Conferência rápida de que nada bloqueia:

```bash
curl -s https://www.harpya.org/robots.txt | head -20
curl -sI -A "GPTBot" https://www.harpya.org/ | head -1          # espera HTTP/2 200
curl -sI -A "ClaudeBot" https://www.harpya.org/llms.txt | head -1
curl -sI https://www.harpya.org/admin/ | grep -i x-robots-tag    # espera noindex
```

## 2. O Google está indexando?

**Search Console** (depois do cadastro descrito em `docs/SEO_GEO.md`):

- **Indexação → Páginas:** quantas das 26 URLs estão indexadas e por que as outras não estão.
- **Sitemaps:** status "Sucesso" e número de URLs descobertas.
- **Desempenho:** consultas, impressões e cliques. Filtre por página para ver quais caminhos atraem busca.
- **Melhorias:** trilha (breadcrumb) e dados estruturados sem erro.
- **Core Web Vitals:** tudo em "Bom".

No **Bing Webmaster Tools**, veja também **IndexNow** (URLs recebidas a cada deploy) e **Copilot/AI Performance**, quando disponível, para menções em respostas do Copilot.

## 3. Os assistentes citam o site?

Faça as mesmas perguntas, uma vez por mês, no ChatGPT (com busca), Claude (com busca), Perplexity, Gemini e Copilot. Use sessão sem login ou anônima quando possível, para reduzir personalização.

Perguntas de referência (são temas em que o Harpya tem conteúdo próprio):

1. "Como funciona um certificado de exclusão com leitura progressiva de bits em busca vetorial int8?"
2. "Raio probabilístico por concentração em quantização de embeddings: o que é?"
3. "Geometria hiperbólica ajuda a acelerar embeddings de texto?"
4. "Quais são as camadas de um LLM e a equação de cada uma, em português?"
5. "Linha do tempo das LLMs com as contribuições esquecidas (ADALINE, LSA, Hochreiter)."
6. "Vídeos para aprender LLMs do zero, organizados por nível, em português."

Para cada resposta, anote: o Harpya aparece como fonte? Em que posição? A informação atribuída está correta? Se aparecer erro atribuído ao site, abra uma pauta no fórum e corrija o texto da página para ficar inequívoco.

## 4. Os arquivos para máquinas estão saudáveis?

```bash
curl -s https://www.harpya.org/llms.txt | head -30
curl -s https://www.harpya.org/estudos/caminhos/raio-probabilistico.md | head -15
curl -s https://www.harpya.org/sitemap.xml | grep -c "<loc>"     # espera 26
curl -s https://www.harpya.org/rss.xml | head -c 300
```

O QA local (`scripts/qa_redesign.py`) já confere que todo link do `llms.txt` existe, que toda página tem gêmeo `.md`, sitemap, canonical e JSON-LD válidos.

## 5. Lighthouse

A cada push em `main` o workflow **lighthouse** mede cinco páginas. Em **Actions → lighthouse → artefato "lighthouse"** ficam os relatórios em HTML. Acompanhe desempenho e LCP; SEO e acessibilidade abaixo de 0,95 já falham o workflow.

## Registro mensal

| Mês | Páginas indexadas (Google) | Cliques / impressões | Robôs de IA vistos nos logs | Assistentes que citaram | Erros atribuídos | Ação |
|---|---|---|---|---|---|---|
| 10/2026 | cadastro pendente | | | | | Cadastrar Search Console e Bing |
