---
titulo: "A importância por atributo do FI-ITEP serve de régua para dar bits por coluna?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://arxiv.org/abs/2611.25288"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-21"
origem: "curadoria-diaria"
---

O artigo usa a importância de cada atributo para decidir quanto podar de cada tabela de embeddings e relata de 20% a 40% de memória a menos em três modelos de recomendação, com acurácia igual ou maior que a poda por percentil, e reproduz a tendência no DLRM com Criteo 1TB. O caminho 6 propõe dar mais bits às colunas que mais pesam no erro. Fica em aberto se um sinal de importância barato como esse ordena as colunas de um índice vetorial do mesmo jeito que a sensibilidade do erro de produto interno. Medir, num corpus de teste e com orçamento de bytes igual, o recall com bits alocados pela importância contra a alocação uniforme e contra a alocação pela sensibilidade.
