# Agente de curadoria

O site recebe conteúdo novo por dois trilhos:

- **Diário:** a tarefa agendada do Claude lê a lista curada de sites e canais (`src/content/fontes-monitoradas/`) e grava itens em rascunho. Prompt completo e regras em `docs/TAREFA_CURADORIA.md`. Revisão e publicação no painel `/admin` (`docs/PAINEL_ADMIN.md`).
- **Semanal:** busca ampla em arXiv, YouTube e Open Library, descrita abaixo.

A régua desta página vale para os dois. O trilho semanal tem três tempos:

1. **Coleta (automática).** Toda segunda, `scripts/coletar_candidatos.py` busca artigos no arXiv, vídeos na YouTube Data API e livros na Open Library, e abre um pull request com `curadoria/candidatos.json`.
2. **Pontuação (agente).** Um agente lê os candidatos, aplica a régua abaixo e propõe as entradas em `src/content/videos/`, `src/content/artigos/` ou `src/content/livros/` (um arquivo por item) no mesmo pull request.
3. **Aprovação (humana).** Carlos Frederico revisa e faz o merge. Nada entra sem aprovação.

## Quem faz a pontuação

Recomendado: uma **tarefa agendada do Claude**, semanal, logo depois da coleta, com acesso ao repositório. Alternativas: o próprio Claude Code rodando sob demanda no repositório, ou qualquer agente que leia e edite arquivos no GitHub.

## Prompt da tarefa agendada

Copie o texto abaixo como instrução da tarefa:

> Você é o curador do Harpya (repositório `freddominugez/Harpia-Project`). Abra o pull request mais recente com título "Curadoria: candidatos da semana". Leia `curadoria/candidatos.json`, `docs/CURADORIA.md` e os caminhos em `src/content/caminhos/`. Para cada candidato, dê nota de 0 a 10 em cada critério da régua e calcule a média ponderada. Aprove só itens com média 7 ou mais e no máximo 5 por tipo. Crie um arquivo por aprovado em `src/content/videos/<ID>.json`, `src/content/artigos/<ano>-<slug>.json` ou `src/content/livros/<slug>.json`, no formato dos itens que já existem, com `status` "publicado", `origem` "manual" e as datas do dia, e confira cada link. Para artigos, preencha `selo` e `rotulo` dizendo qual caminho o artigo sustenta. Faça commit no mesmo branch do pull request e escreva um comentário com uma tabela: item, notas, média, decisão e uma linha de justificativa. Não faça merge. Não use travessões nos textos.

## Régua

| Critério | Peso | Pergunta |
|---|---|---|
| Ligação com um caminho | 3 | Sustenta, contesta ou é arte prévia de algum dos 12 caminhos? |
| Rigor | 3 | Traz equação, medida reproduzível ou demonstração? |
| Qualidade da fonte | 2 | Autor ou canal reconhecido, revisão por pares, instituição? |
| Atualidade | 1 | É recente, ou é um clássico que segue sendo a referência? |
| Acesso | 1 | Gratuito ou com versão aberta? |

Rejeitar sempre: conteúdo de fornecedor que se coloca em primeiro no próprio ranking, números de desempenho sem hardware nem base de comparação, vídeos sem conteúdo técnico.

## Regra para vídeos

Antes de acrescentar um vídeo, confirme o ID no YouTube:

```bash
curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json"
```

Só entra se a resposta trouxer título e canal (HTTP 200). Use o título e o canal que vierem nela. Em 12/10/2026, 83 dos 100 links do rascunho do catálogo "LLMs de ponta a ponta" não existiam ou apontavam para outro vídeo; todos foram trocados por vídeos reais conferidos dessa forma.

## Formato dos dados

```json
// src/content/videos/<ID>.json (módulos em src/content/modulos/, de 0 a 11)
{ "id": "ID_DO_YOUTUBE", "titulo": "título real do YouTube", "canal": "canal real",
  "modulo": 3, "nivel": "Iniciante | Intermediário | Avançado",
  "resumo": "1 ou 2 frases em português sobre o que o vídeo ensina", "catalogo": null, "trilha": "mat | redes | llm",
  "ordem": 999, "fonte_url": "https://www.youtube.com/watch?v=ID_DO_YOUTUBE",
  "status": "rascunho | publicado", "origem": "manual | curadoria-diaria",
  "adicionado_em": "AAAA-MM-DD", "verificado_em": "AAAA-MM-DD" }

// src/content/artigos/<ano>-<slug>.json
{ "ano": 2026, "titulo": "...", "autores": "... · venue", "url": "https://...",
  "grupo": "fund | busca | arte", "selo": "medido | arte | lacuna | teste", "rotulo": "arte prévia · caminho 1",
  "ordem": 999, "fonte_url": "https://...", "status": "...", "origem": "...", "adicionado_em": "...", "verificado_em": "..." }

// src/content/livros/<slug>.json
{ "titulo": "...", "autores": "...", "nota": "2024 · gratuito", "uso": "Caminho 3: ...", "url": "", "cor": "c1",
  "fonte_url": "", "ordem": 999, "status": "...", "origem": "...", "adicionado_em": "...", "verificado_em": "..." }
```
