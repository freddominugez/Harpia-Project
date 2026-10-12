# Agente de curadoria

O site recebe conteúdo novo em três tempos:

1. **Coleta (automática).** Toda segunda, `scripts/coletar_candidatos.py` busca artigos no arXiv, vídeos na YouTube Data API e livros na Open Library, e abre um pull request com `curadoria/candidatos.json`.
2. **Pontuação (agente).** Um agente lê os candidatos, aplica a régua abaixo e propõe as entradas em `src/data/*.json` no mesmo pull request.
3. **Aprovação (humana).** Carlos Frederico revisa e faz o merge. Nada entra sem aprovação.

## Quem faz a pontuação

Recomendado: uma **tarefa agendada do Claude**, semanal, logo depois da coleta, com acesso ao repositório. Alternativas: o próprio Claude Code rodando sob demanda no repositório, ou qualquer agente que leia e edite arquivos no GitHub.

## Prompt da tarefa agendada

Copie o texto abaixo como instrução da tarefa:

> Você é o curador do Harpya Project (repositório `freddominugez/harpia-project`). Abra o pull request mais recente com título "Curadoria: candidatos da semana". Leia `curadoria/candidatos.json`, `docs/CURADORIA.md` e os caminhos em `src/content/caminhos/`. Para cada candidato, dê nota de 0 a 10 em cada critério da régua e calcule a média ponderada. Aprove só itens com média 7 ou mais e no máximo 5 por tipo. Acrescente os aprovados em `src/data/videos.json`, `src/data/artigos.json` ou `src/data/livros.json`, no formato dos itens que já existem, e confira cada link. Para artigos, preencha `selo` e `rotulo` dizendo qual caminho o artigo sustenta. Faça commit no mesmo branch do pull request e escreva um comentário com uma tabela: item, notas, média, decisão e uma linha de justificativa. Não faça merge. Não use travessões nos textos.

## Régua

| Critério | Peso | Pergunta |
|---|---|---|
| Ligação com um caminho | 3 | Sustenta, contesta ou é arte prévia de algum dos 12 caminhos? |
| Rigor | 3 | Traz equação, medida reproduzível ou demonstração? |
| Qualidade da fonte | 2 | Autor ou canal reconhecido, revisão por pares, instituição? |
| Atualidade | 1 | É recente, ou é um clássico que segue sendo a referência? |
| Acesso | 1 | Gratuito ou com versão aberta? |

Rejeitar sempre: conteúdo de fornecedor que se coloca em primeiro no próprio ranking, números de desempenho sem hardware nem base de comparação, vídeos sem conteúdo técnico.

## Formato dos dados

```json
// src/data/videos.json
{ "id": "ID_DO_YOUTUBE", "titulo": "...", "canal": "...", "trilha": "mat | redes | llm" }

// src/data/artigos.json
{ "ano": 2026, "titulo": "...", "autores": "... · venue", "url": "https://...",
  "grupo": "fund | busca | arte", "selo": "medido | arte | lacuna | teste", "rotulo": "arte prévia · caminho 1" }

// src/data/livros.json
{ "titulo": "...", "autores": "...", "nota": "2024 · gratuito", "uso": "Caminho 3: ...", "url": "", "cor": "c1" }
```
