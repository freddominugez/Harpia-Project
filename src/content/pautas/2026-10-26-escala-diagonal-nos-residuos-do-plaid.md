---
titulo: "A escala diagonal reduz o erro dos resíduos comprimidos no índice PLAID?"
categoria: "Caminhos"
caminho: "escala-diagonal"
links:
  - "https://arxiv.org/abs/2610.31932"
  - "https://www.harpya.org/estudos/caminhos/escala-diagonal/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-26"
origem: "curadoria-diaria"
---

O artigo do MICE-P guarda as representações contextualizadas dos tokens de cada documento num índice PLAID, que comprime cada vetor como centroide mais resíduo em poucos bits, e relata vazão próxima da interação tardia com a eficácia de um cross-encoder. O caminho 2 mediu que centralizar e reescalar cada coluna pela sua faixa reduziu os sobreviventes de 2,345% para 0,397% em int8. Fica em aberto se a mesma escala diagonal, aplicada antes da quantização dos resíduos, reduz o erro de reconstrução e a perda de nDCG@10 no mesmo orçamento de bits. Medir, num índice PLAID pequeno, o erro dos resíduos e o nDCG@10 com e sem a escala diagonal, com 1 e 2 bits por dimensão.
