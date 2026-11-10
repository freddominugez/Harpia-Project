---
titulo: "Estimar a sensibilidade em tempo de uso serve para dar bits por coluna?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://arxiv.org/abs/2611.10096"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-10"
origem: "curadoria-diaria"
---

O artigo distribui a largura de bits do cache KV entre agentes e camadas sob um orçamento de memória comum, a partir de uma estimativa de sensibilidade feita durante o uso. O caminho 6 propõe a mesma lógica para as colunas da tabela de embeddings, mas com uma regra determinística. Fica em aberto se uma estimativa feita sobre as consultas reais muda a alocação em relação à sensibilidade medida uma vez sobre a tabela. Medir, no mesmo orçamento de bits, o erro de produto interno e o recall@10 com as duas alocações.
