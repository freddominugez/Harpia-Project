---
titulo: "Escolher b de k seções em duas passadas muda o custo por passo do caminho 7?"
categoria: "Caminhos"
caminho: "controle-bellman"
links:
  - "https://arxiv.org/abs/2610.30664"
  - "https://www.harpya.org/estudos/caminhos/controle-bellman/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-24"
origem: "curadoria-diaria"
---

O artigo compila a escolha de b entre k seções, em cada nível de uma árvore de documentos, numa árvore rasa de prefixos de ação avaliada em duas passadas, sem tokens de saída. Relata a mesma política da decodificação serial em 84% a 89% das perguntas e de 35% a 47% menos latência de controle, medido em MetaX e repetido em H800. O caminho 7 trata a ordem de abertura dos grupos como controle com custo por passo. Fica em aberto se tornar a decisão de abrir quase gratuita muda a política ótima do caminho 7; medir, com o portão G2, o custo esperado com o termo de decisão zerado e com o termo atual.
