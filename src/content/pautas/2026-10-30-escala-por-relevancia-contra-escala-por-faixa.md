---
titulo: "Pesos calibrados por relevância ganham da escala por faixa na tabela?"
categoria: "Caminhos"
caminho: "escala-diagonal"
links:
  - "https://arxiv.org/abs/2610.37707"
  - "https://www.harpya.org/estudos/caminhos/escala-diagonal/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-30"
origem: "curadoria-diaria"
---

O artigo propõe o RRC, uma fórmula fechada que recalcula o peso de cada direção retida na compressão espectral de embeddings a partir de julgamentos de relevância, em vez de seguir só o espectro do corpus. O caminho 2 mostrou que, entre as matrizes diagonais, a escala pela faixa de cada coluna minimiza o limite de exclusão, mas não olha a relevância. Fica em aberto se uma escala escolhida pela relevância reduz a fração de sobreviventes ou só melhora a ordenação final. Medir sobreviventes e nDCG@10 com as duas escalas na mesma tabela int8, com e sem a rotação do caminho 3.
