---
titulo: "Vale quantizar prefill e decode com formatos diferentes num mesmo modelo?"
categoria: "Perguntas"
links:
  - "https://www.youtube.com/watch?v=RF6lox0YfSU"
  - "https://arxiv.org/abs/2609.26333"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-15"
origem: "curadoria-diaria"
---

A aula e o artigo propõem pesos e formatos de cálculo próprios para o prefill e outros, mais compactos, para o decode, e relatam ganho de tempo até o primeiro token no llama.cpp com prompts de 8K. Fica em aberto quanto custa guardar e carregar o segundo conjunto de pesos quando o prompt é curto, já que a carga do SSD só se dilui em prompts longos. Medir o tempo até o primeiro token e a memória em prompts de 512, 2K e 8K tokens, no mesmo hardware, contra a quantização só de pesos.
