---
titulo: "Um estágio de sinais de 1 bit antes dos 4 bits altos reduz a leitura no caminho 1?"
categoria: "Caminhos"
caminho: "certificado-inteiro"
links:
  - "https://arxiv.org/abs/2611.32203"
  - "https://www.harpya.org/estudos/caminhos/certificado-inteiro/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-25"
origem: "curadoria-diaria"
---

O OmniEVIE guarda, para cada registro, um vetor médio, sinais de 1 bit e multivetores int8, usados em busca grossa, intermediária e final, e relata consultas de 54,2 ms em 1 milhão de registros em uma thread. O caminho 1 lê hoje duas camadas da mesma linha int8: os 4 bits altos e, só para os sobreviventes, os 4 bits baixos. Fica em aberto se uma passagem anterior com os sinais de 1 bit exclui candidatos com limite ainda conservador, sem perder a exatidão em relação à tabela int8. Medir bytes lidos na mediana e no pior caso, e tempo total, com e sem o estágio de sinais, no mesmo corpus do ensaio local.
