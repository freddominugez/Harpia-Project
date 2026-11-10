---
titulo: "A Jacobian Lens escolhe melhor as camadas do encoder a trocar por um mapa linear?"
categoria: "Caminhos"
caminho: "atalho-entre-camadas"
links:
  - "https://arxiv.org/abs/2611.00015"
  - "https://www.harpya.org/estudos/caminhos/atalho-entre-camadas/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-03"
origem: "curadoria-diaria"
---

O artigo mostra, em Qwen3-8B, Llama-3.1-8B-IT e Gemma-3-12B-IT, que ponderar a influência de cada bloco pela Jacobian Lens, que leva uma perturbação da camada até a saída, melhora a acurácia depois da poda em até 19 pontos em relação ao critério de rotação local. O caminho 9 precisa decidir quais camadas finais do encoder substituir por um mapa linear ajustado. Fica em aberto se o mesmo critério vale para encoders de embedding, onde a saída é um vetor e não um token. Medir a perda de recall@10 ao trocar blocos escolhidos pela Jacobian Lens contra blocos escolhidos pela influência local, com o mesmo número de blocos.
