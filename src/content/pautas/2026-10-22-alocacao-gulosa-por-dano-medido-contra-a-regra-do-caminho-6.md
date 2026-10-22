---
titulo: "Alocação gulosa por dano medido supera a regra fechada do caminho 6?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://arxiv.org/abs/2610.28773"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-22"
origem: "curadoria-diaria"
---

O LADDER distribui esparsidade entre camadas de forma incremental, escolhendo a cada passo a camada cujo corte causa o menor dano de ponta a ponta por parâmetro removido, e relata vantagem a partir de 70% de esparsidade. O caminho 6 distribui bits entre colunas por uma regra fechada, que iguala s_j|x_j| e rende o fator G. Fica em aberto se uma alocação gulosa de bits, avaliada pelo erro do certificado em consultas reais, chega perto do ótimo da regra fechada ou se afasta dele quando o orçamento de bits é baixo. Vale comparar as duas alocações nos mesmos embeddings, com 2, 3 e 4 bits médios por coluna.
