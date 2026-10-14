---
titulo: "O certificado de Top-K do DoSA serve à leitura progressiva em bits?"
categoria: "Caminhos"
caminho: "certificado-inteiro"
links:
  - "https://arxiv.org/abs/2610.13990"
  - "https://www.harpya.org/estudos/caminhos/certificado-inteiro/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-14"
origem: "curadoria-diaria"
---

O DoSA parte da mesma ideia do caminho 1: para escolher o Top-K basta ter evidência suficiente para rejeitar um candidato, sem calcular a pontuação inteira. O artigo usa um conjunto semente para fixar um piso do limiar e cotas superiores por cabeça de atenção. Fica em aberto se esse piso semeado reduz os sobreviventes da primeira passagem nos 4 bits altos. A medida a comparar seria a fração de linhas que precisam da segunda leitura, com e sem a semente, no mesmo índice.
