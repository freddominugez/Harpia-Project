---
titulo: "Correção linear aprendida ou escala diagonal depois da compressão?"
categoria: "Caminhos"
caminho: "escala-diagonal"
links:
  - "https://arxiv.org/abs/2610.14196"
  - "https://www.harpya.org/estudos/caminhos/escala-diagonal/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-14"
origem: "curadoria-diaria"
---

O artigo aprende uma matriz linear global, por destilação das pontuações do modelo sem compressão, e a aplica aos vetores guardados depois de comprimidos, sem retreinar o codificador. Relata ganho sobre a compressão pura em 154 de 160 configurações do BEIR no cenário dentro do domínio. A escala diagonal do caminho 2 é o caso particular de matriz diagonal sem treino. Vale medir quanto da recuperação vem só da diagonal e quanto exige a matriz cheia, em bytes iguais por vetor.
