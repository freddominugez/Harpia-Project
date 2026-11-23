---
titulo: "Escolher âncoras por ponto mais distante melhora o mapa linear do caminho 9?"
categoria: "Caminhos"
caminho: "atalho-entre-camadas"
links:
  - "https://arxiv.org/abs/2611.26919"
  - "https://www.harpya.org/estudos/caminhos/atalho-entre-camadas/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-23"
origem: "curadoria-diaria"
---

O ERA ajusta um adaptador leve entre dois encoders usando poucos documentos âncora, escolhidos por amostragem de ponto mais distante pelo cosseno, e relata nDCG@10 igual ou maior que as bases de conversão em cinco conjuntos do BEIR, com 1,2 ms de custo extra. O caminho 9 também ajusta um mapa linear, mas de uma camada intermediária até a saída do mesmo encoder, hoje com todos os documentos. Fica em aberto se um subconjunto pequeno de âncoras bem espalhadas basta para ajustar esse mapa sem perder qualidade. Medir, no MiniLM de 6 camadas, o nDCG@10 do mapa ajustado com âncoras por ponto mais distante contra âncoras aleatórias de mesmo tamanho e contra o ajuste com o corpus inteiro.
