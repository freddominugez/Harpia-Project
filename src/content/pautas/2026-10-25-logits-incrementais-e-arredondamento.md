---
titulo: "Logits incrementais acumulam erro de arredondamento que estraga o softmax?"
categoria: "Caminhos"
caminho: "cabeca-de-saida"
links:
  - "https://www.youtube.com/watch?v=dYxEmKbZfr4"
  - "https://www.harpya.org/estudos/caminhos/cabeca-de-saida/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-25"
origem: "curadoria-diaria"
---

O vídeo mostra que, em ponto flutuante, somar um valor muito pequeno a 1 devolve 1, e que isso zera o gradiente do softmax e da entropia cruzada quando a margem entre logits fica grande. A ideia 2 do caminho 8 atualiza os logits somando W(h_{t+1}-h_t) passo a passo, o que acumula arredondamento a cada token. Fica em aberto quanto essa soma se afasta do cálculo completo em BF16 e em FP32 ao longo de uma geração longa. Medir, em traços de decodificação de um modelo pequeno, a diferença entre logits incrementais e recalculados, a troca do token de maior probabilidade e a margem do top-1, a cada 64 passos.
