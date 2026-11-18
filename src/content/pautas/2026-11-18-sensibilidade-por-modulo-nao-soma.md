---
titulo: "Se a sensibilidade por módulo não soma, como distribuir bits por coluna?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://arxiv.org/abs/2611.21974"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-18"
origem: "curadoria-diaria"
---

O artigo quantiza o Qwen3-8B numa B200 com precisão mista e relata que o efeito de restaurar cada módulo isoladamente é fortemente não aditivo, e que os rankings de sensibilidade mudam conforme a tarefa avaliada. O caminho 6 propõe dar mais bits às colunas que mais pesam no erro, o que supõe que a sensibilidade de cada coluna possa ser estimada em separado. O próprio autor diz que o efeito isolado da alocação não ficou estabelecido. Medir, numa camada, o erro com pares de colunas protegidas juntas contra a soma dos efeitos individuais.
