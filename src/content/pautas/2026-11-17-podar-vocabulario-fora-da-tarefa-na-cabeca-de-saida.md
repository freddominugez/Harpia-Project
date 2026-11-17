---
titulo: "Podar o vocabulário fora da tarefa encolhe a cabeça de saída sem perda?"
categoria: "Caminhos"
caminho: "cabeca-de-saida"
links:
  - "https://arxiv.org/abs/2611.18587"
  - "https://www.harpya.org/estudos/caminhos/cabeca-de-saida/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-17"
origem: "curadoria-diaria"
---

O artigo comprime o gemma-3-12b-it para tradução numa H100 e relata que retirar a parte de visão e o vocabulário fora da tarefa, junto com pesos int8 ou ativações fp8, não deixa perda resolvida nas métricas usadas, enquanto int4 deixa um resíduo pequeno. O caminho 8 trata da camada que escolhe o próximo token, e a poda de vocabulário mexe direto no tamanho dessa tabela. Fica em aberto quanto da economia vem da poda e quanto da quantização, já que o artigo combina as duas. Medir o posto efetivo, o erro e o custo da cabeça de saída com e sem poda, em bytes iguais.
