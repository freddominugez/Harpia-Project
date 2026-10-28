---
titulo: "Mais dimensões com menos bits preservam a cauda também em busca vetorial?"
categoria: "Caminhos"
caminho: "certificado-bits-dimensoes"
links:
  - "https://arxiv.org/abs/2610.36267"
  - "https://www.harpya.org/estudos/caminhos/certificado-bits-dimensoes/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-28"
origem: "curadoria-diaria"
---

Com 168 bytes por linha, os autores comparam uma fatoração de posto 300 em 4 bits com uma de posto 40 em 32 bits, em sete pares de base e modelo de recomendação, e a de posto alto em poucos bits teve o maior recall dos itens raros em todos eles. O caminho 4 trata exatamente essa troca entre bits e dimensões, mas para um certificado de busca exata. Fica em aberto se a mesma vantagem aparece em embeddings de texto e se o certificado único escolhe essa configuração sozinho. Medir recall@k dos vizinhos raros e bytes lidos para posto alto com poucos bits contra posto baixo com muitos bits, no mesmo orçamento.
