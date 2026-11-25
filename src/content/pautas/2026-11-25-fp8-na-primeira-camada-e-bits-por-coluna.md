---
titulo: "NVFP4 com escala por bloco é a linha de base certa para bits por coluna?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://arxiv.org/abs/2611.31436"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-25"
origem: "curadoria-diaria"
---

O estudo compara 13 configurações de quantização pós-treino em classificação de sono por EEG, em emulação, e relata que NVFP4 supera MXFP4 com o mesmo tamanho de bloco e que a primeira camada é a mais sensível; manter primeira e última camadas em FP8 deixa os dois formatos de 4 bits a até 0,48 ponto de FP32. O caminho 6 propõe dar mais bits às colunas que mais pesam no erro, mas ainda não tem comparação contra formatos com escala por bloco. Fica em aberto se a alocação por sensibilidade supera NVFP4 em bits médios iguais nos embeddings do site. Medir o fator G e o erro de produto interno das duas opções com o mesmo orçamento de bits.
