---
titulo: "Depois de quantizar, o custo dos logits passa a dominar a cabeça de saída?"
categoria: "Caminhos"
caminho: "cabeca-de-saida"
links:
  - "https://arxiv.org/abs/2611.21852"
  - "https://www.harpya.org/estudos/caminhos/cabeca-de-saida/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-18"
origem: "curadoria-diaria"
---

O artigo perfila um modelo MoE de difusão de 26B numa GB10 e relata que, com os pesos quantizados, o pipeline de amostragem sobre o tensor de logits do vocabulário passa a ser o maior consumidor do tempo de decodificação, e que a fatia cai para 3,6% num modelo de difusão denso. O caminho 8 trata da camada que escolhe o próximo token, e o resultado sugere que o gargalo pode estar na etapa depois da projeção, não só na tabela. Fica em aberto quanto disso aparece em decodificação autorregressiva, onde cada token toca uma posição só. Medir a fração do tempo gasta em projeção, softmax e amostragem antes e depois de quantizar o restante do modelo.
