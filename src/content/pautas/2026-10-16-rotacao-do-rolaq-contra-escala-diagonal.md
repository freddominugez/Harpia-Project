---
titulo: "A rotação calibrada do RoLaQ preserva o ganho da escala diagonal?"
categoria: "Caminhos"
caminho: "escala-diagonal"
links:
  - "https://arxiv.org/abs/2610.20686"
  - "https://www.harpya.org/estudos/caminhos/escala-diagonal/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-16"
origem: "curadoria-diaria"
---

O RoLaQ aprende, junto, uma rotação dentro de subespaços e as faixas de quantização de um cache KV latente em 2 bits, com os pesos do modelo congelados, e relata a maior acurácia média entre os métodos de 2 bits comparados em três modelos MLA. O caminho 2 mediu que a rotação por autovetores seguida de escala piorou os sobreviventes (5,455% contra 0,397% da escala diagonal) e deixou em aberto se o ganho sobrevive a uma rotação. Fica em aberto se uma rotação calibrada contra o erro, como a do RoLaQ, se comporta diferente da rotação por autovetores. Vale medir os sobreviventes com a rotação calibrada aplicada antes da escala diagonal, na mesma tabela e no mesmo int8.
