# Aplicação da revisão científica e editorial — 13/10/2026

## Contrato e escopo

Aplicar os 39 apontamentos aprovados pelo pedido do usuário aos arquivos-fonte publicados no GitHub. Base: `origin/main` em `66b409dadbf2bca7617d21e35546bc7376770d87`. Branch: `fix/revisao-cientifica-editorial`. A branch de design permanece independente.

Itens: (1) mecanismos e hipóteses matemáticas; (2) literatura e cronologia; (3) catálogo, glossário e política editorial; (4) fontes duplicadas de Markdown/SEO; (5) validação e publicação da branch. Conteúdo reversível; execução serial. Orçamento: até duas correções dirigidas por falha de validação. Fora do escopo: alterar layout, refazer experimentos, inventar protocolos ou resultados, merge e publicação em produção.

## Evidência e limites

Os números próprios foram preservados como resultados locais relatados, com aviso público de documentação de reprodução pendente. Não foram criados hardware, dados brutos, sementes ou intervalos inexistentes. Novidade sem busca documentada foi reformulada como hipótese. A revisão auditou a versão pública; as novas páginas incluídas por outros trabalhos não receberam uma auditoria integral nesta alteração.

## Rastreabilidade

| Nº | Apontamento | Aplicação |
|---|---|---|
| 1 | k-means não minimiza o maior raio | `src/pages/estudos/arquivados.md` |
| 2 | O piso de distorção não é universal | `src/pages/equacoes.md` |
| 3 | Normas inferiores a 1 não garantem decaimento exponencial | `src/data/origens.ts` |
| 4 | LIMIT precisa explicitar a margem e a versão do resultado | `src/content/linha-do-tempo/2025-limites-do-vetor-unico.json` |
| 5 | Ganhos de Chami não se resumem a décimos de ponto | `src/pages/estudos/a-ideia-mais-interessante.astro + src/lib/rotas.ts` |
| 6 | O descarte da geometria hiperbólica excede a evidência | `src/components/IdeaCard.astro + src/pages/estudos/arquivados.md` |
| 7 | SETH não implica que todo ganho exato é constante | `src/content/caminhos/certificado-inteiro.md` |
| 8 | “Exato” precisa identificar o objeto preservado | `src/content/caminhos/certificado-inteiro.md` |
| 9 | δ por candidato não é δ por consulta | `src/content/caminhos/raio-probabilistico.md` |
| 10 | Resultados experimentais precisam de protocolo público | `src/pages/estudos/index.astro + src/lib/rotas.ts` |
| 11 | Centralizar pesos acrescenta um termo ao score | `src/content/caminhos/escala-diagonal.md` |
| 12 | A escala ótima vale para um objetivo específico | `src/content/caminhos/escala-diagonal.md` |
| 13 | Bits por coluna: esclarecer passo e restrições | `src/content/caminhos/bits-por-coluna.md` |
| 14 | Reticulados: distinguir teorema assintótico de construção finita | `src/content/caminhos/reticulados-e8-leech.md` |
| 15 | Bellman: estado pequeno não garante política de limiar | `src/content/caminhos/controle-bellman.md` |
| 16 | Concentração do softmax não garante posto algébrico baixo | `src/content/caminhos/cabeca-de-saida.md` |
| 17 | MI do texto não prova impossibilidade de TT na cabeça | `src/content/caminhos/tensor-train-na-cabeca.md` |
| 18 | MIPS no token descreve decodificação gulosa | `src/pages/equacoes.md + src/pages/biblioteca/glossario.md` |
| 19 | O gradiente precisa acompanhar a temperatura | `src/pages/equacoes.md` |
| 20 | Custos de atenção precisam separar prefill e decode | `src/pages/equacoes.md` |
| 21 | KV cache maior que pesos depende da configuração | `src/pages/equacoes.md` |
| 22 | Compressão pode alterar tempo; vocabulário não garante texto menor | `src/pages/equacoes.md` |
| 23 | Atalho entre camadas: fração de blocos não é latência | `src/content/caminhos/atalho-entre-camadas.md` |
| 24 | Valor e derivada: maior expressividade precisa de comparação formal | `src/content/caminhos/valor-e-derivada.md` |
| 25 | BitNet não torna todos os parâmetros ternários | `src/data/origens.ts` |
| 26 | SVM de 1995: distinguir margem rígida e suave | `src/content/aprendizado/1995-maquinas-de-vetores-de-suporte.json` |
| 27 | Cronologia: reduzir alegações de prioridade e solução definitiva | `src/data/origens.ts + src/content/aprendizado + src/content/linha-do-tempo` |
| 28 | RoPE preserva dependência posicional relativa, não só distância | `src/pages/equacoes.md` |
| 29 | RLHF não garante utilidade, honestidade e inocuidade | `src/content/modulos/07.json` |
| 30 | AutoGPT e BabyAGI não são os primeiros agentes autônomos | `src/content/videos/5cnk5zpf1EA.json` |
| 31 | RAG e PagedAttention: trocar absolutos por resultados condicionais | `src/content/videos/_sq3ixXMQTc.json + src/content/videos/5ZlavKF_98U.json` |
| 32 | 16 camadas são 16 etapas ou componentes | `src/config.ts + src/lib/rotas.ts + src/pages/equacoes.md` |
| 33 | Níveis do catálogo não estão presentes em todos os módulos | `src/pages/videos.astro` |
| 34 | Glossário: ampliar quantização e refinar p95 | `src/pages/biblioteca/glossario.md` |
| 35 | Selos de novidade não demonstram ausência na literatura | `src/pages/sobre.md + src/content/caminhos` |
| 36 | Notícias precisam distinguir publicação original de atualização | `src/components/NewsCard.astro + src/pages/news.astro` |
| 37 | Holevo não estabelece custo geral de simulação clássica | `src/pages/estudos/arquivados.md` |
| 38 | iFairy: números corretos, comparação precisa de legenda | `src/content/caminhos/pesos-de-fase.md` |
| 39 | Biblioteca: distinguir artigo comparativo dos métodos originais | `src/content/artigos/2017-to-index-or-not-to-index-optimizing-exact-maximum.json + src/pages/estudos/index.astro` |

## Validação

- `npm run check`: validação Astro e TypeScript.
- `npm run build`: geração de todas as rotas, fórmulas e representações Markdown.
- Conferência do conteúdo gerado: ausência das alegações substituídas, presença das ressalvas e links internos/âncoras.
- `git diff --check`: integridade do patch.

Resultados: `npm run check` — exit 0, 72 arquivos, zero erros/avisos; `npm run build` — exit 0, 32 páginas; `python3 scripts/validar_cms.py` — exit 0, painel e conteúdo coerentes; conferência do HTML/Markdown — exit 0, 32 páginas sem links internos/âncoras quebrados ou erros KaTeX e sem as alegações antigas; `git diff --check` — exit 0. A primeira tentativa de build revelou apenas uma dependência local ausente; `npm ci` sincronizou o ambiente pelo lockfile existente, sem alterar dependências do projeto. Estado: VERIFIED para as correções editoriais e a geração estática; benchmarks não reproduzidos. Rollback: reverter o commit desta branch; nenhum dado ou experimento foi modificado.
