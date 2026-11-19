---
titulo: "A divergência KL da saída serve de critério rápido para dar bits por coluna?"
categoria: "Caminhos"
caminho: "bits-por-coluna"
links:
  - "https://arxiv.org/abs/2611.23388"
  - "https://www.harpya.org/estudos/caminhos/bits-por-coluna/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-19"
origem: "curadoria-diaria"
---

O artigo usa a divergência KL entre a saída do modelo quantizado e a do original, em traços de raciocínio, para pontuar receitas de quantização em minutos em vez de horas de avaliação. O caminho 6 precisa de um critério para decidir quais colunas recebem mais bits, e hoje propõe o indicador G sobre um objetivo contínuo de erro. Fica em aberto se a KL ordena as colunas da mesma forma que o erro ponderado do caminho. Medir, numa camada, a correlação entre a queda de KL ao proteger cada coluna e o peso q_j previsto.
