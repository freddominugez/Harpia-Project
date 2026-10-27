---
titulo: "Um compressor SSM de contexto serve de medida para o teto do estado de contexto?"
categoria: "Caminhos"
caminho: "controle-bellman"
links:
  - "https://arxiv.org/abs/2610.33006"
  - "https://www.harpya.org/estudos/caminhos/controle-bellman/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-27"
origem: "curadoria-diaria"
---

O Boa Compressor codifica o contexto com um modelo Mamba numa passada linear e é treinado por destilação, aproximando os logits do modelo que leu o contexto inteiro, e os autores relatam taxas de compressão de até 16x. O caminho 7 pede uma medida do teto do estado de contexto. Fica em aberto se a curva entre taxa de compressão e divergência dos logits, obtida com um compressor desse tipo, funciona como estimativa desse teto. Medir essa curva num modelo pequeno, para algumas taxas de compressão, e comparar com a medida que o caminho 7 já propõe.
