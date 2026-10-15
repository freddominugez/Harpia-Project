---
titulo: "A alocação de precisão do RCO serve para dar bits por coluna no índice?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://www.youtube.com/watch?v=ECZPAzT6VgQ"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-15"
origem: "curadoria-diaria"
---

A palestra apresenta o RCO, que distribui precisão entre partes de um modelo por otimização riemanniana sob um orçamento fixo de tamanho, aplicado a pesos em GGUF. O caminho 6 pede a mesma decisão para colunas de uma tabela de vetores, guiada pela sensibilidade de cada coluna no erro do produto interno. Fica em aberto se o objetivo do RCO pode ser trocado pela cota do caminho sem perder a garantia determinística. Vale medir, em bytes iguais, a taxa de sobreviventes com a alocação do RCO contra a alocação proporcional à faixa de cada coluna.
