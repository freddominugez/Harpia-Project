---
titulo: "Comparações justas para Tensor-Train na cabeça de saída"
categoria: "Propostas novas"
caminho: "tensor-train-na-cabeca"
links:
  - "https://www.harpya.org/estudos/caminhos/tensor-train-na-cabeca/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-12"
origem: "manual"
---

A proposta é fatorar a tabela do vocabulário como produto de tensores pequenos e comparar com int4 no mesmo número de bytes. O que torna essa comparação justa: incluir o custo de reconstruir as linhas, treinar junto ou ajustar depois, e qual perplexidade de referência usar?
