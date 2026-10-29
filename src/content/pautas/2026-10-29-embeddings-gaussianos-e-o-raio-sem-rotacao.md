---
titulo: "Embeddings treinados com SIGReg dispensam a rotação no raio probabilístico?"
categoria: "Caminhos"
caminho: "raio-probabilistico"
links:
  - "https://www.youtube.com/watch?v=dTq1nNGbv28"
  - "https://www.harpya.org/estudos/caminhos/raio-probabilistico/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-29"
origem: "curadoria-diaria"
---

A aula sobre o LeWorldModel apresenta a perda SIGReg, que empurra projeções aleatórias de uma dimensão dos embeddings para uma gaussiana durante o treino. O caminho 3 depende de o resíduo se comportar como ruído gaussiano e já registrou no NFCorpus mais excedências do raio do que o modelo gaussiano prevê. Fica em aberto se embeddings treinados com esse tipo de regularização deixam o resíduo de quantização mais perto da gaussiana, ou se a garantia continua exigindo o sorteio do índice. Medir a taxa de excedência do raio de seis desvios, com e sem rotação aleatória, numa tabela 4/4 de embeddings com e sem SIGReg.
