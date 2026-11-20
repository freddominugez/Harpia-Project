---
titulo: "A decomposição aditiva do LQ-Rec limita a queda de ranking num índice vetorial?"
categoria: "Caminhos"
caminho: "certificado-bits-dimensoes"
links:
  - "https://arxiv.org/abs/2611.25256"
  - "https://www.harpya.org/estudos/caminhos/certificado-bits-dimensoes/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-20"
origem: "curadoria-diaria"
---

O artigo mantém consulta e score em espaço contínuo, quantiza só o lado dos itens com um quantizador residual e prova uma decomposição aditiva do erro e um teorema de ordenação por pares que limitam a queda de ranking causada pela quantização. Um mesmo modelo serve vários comprimentos de código sem retreino. O caminho 4 busca um só limite que some resíduo de bits e cauda de dimensões. Fica em aberto se o limite do artigo, escrito para recomendação, vale para produto interno num índice de embeddings e se é mais apertado que o do caminho. Medir, num corpus de teste, a fração de pares cuja ordem o limite garante em cada comprimento de código.
