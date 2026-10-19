---
titulo: "O critério de posto efetivo do caminho 8 precisa de uma base de ruído?"
categoria: "Caminhos"
caminho: "cabeca-de-saida"
links:
  - "https://arxiv.org/abs/2610.22438"
  - "https://www.harpya.org/estudos/caminhos/cabeca-de-saida/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-19"
origem: "curadoria-diaria"
---

O artigo mostra que medidas de posto que contam direções e o posto estável, calculados dos mesmos valores singulares, dão leituras opostas para atualizações de ajuste fino, e que uma matriz aleatória do mesmo tamanho é a comparação que falta. O caminho 8 decide as duas ideias pela energia: parar se 90% dela exigir mais de d/5 direções. Fica em aberto onde ficam os incrementos de estado e a métrica do softmax em relação a um vetor aleatório da mesma norma. Vale medir as duas medidas de posto nos traços de decodificação ao lado dessa base de ruído antes de aplicar o critério de parada.
