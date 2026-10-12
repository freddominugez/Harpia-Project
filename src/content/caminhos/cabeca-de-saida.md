---
numero: 8
titulo: "Cabeça de saída: métrica do softmax e logits incrementais"
estatuto: "teste"
selo: "teste de minutos"
resumo: "Duas ideias para a camada que escolhe o próximo token, cada uma decidida por uma medida de posto efetivo."
equacao: "z_{t+1}=z_t+W\\,(h_{t+1}-h_t)"
arte_previa:
  - "SVD-softmax (2017), cerca de 20% da aritmética"
  - "FlashHead (2026), cabeça 4,9 vezes mais rápida sem garantia"
  - "Softmax adaptativo (2017)"
proximo_teste: "Em traços reais de decodificação de um modelo pequeno, medir o posto efetivo dos incrementos de estado e da métrica local do softmax."
parar_se: "90% da energia exigir mais de d/5 direções na maioria dos passos."
atualizado: "2026-10-12"
---

## Ideia 1: precisão guiada pela métrica local

$$
\nabla^2A(\lambda)=\mathrm{Cov}[\gamma\mid\lambda]=\sum_v p_v(\gamma_v-\bar\gamma)(\gamma_v-\bar\gamma)^\top
$$

Quando a distribuição se concentra em poucos tokens, essa métrica tem posto baixo. As linhas do unembedding só precisariam de precisão cheia em poucas direções.

## Ideia 2: logits incrementais

A identidade $z_{t+1}=z_t+W(h_{t+1}-h_t)$ é exata. Só economiza se o incremento for de posto baixo numa base com $WB$ pré-calculado.

## Teto

Lei de Amdahl: a cabeça pesa cerca de 25% do custo por token no Llama-3.2-1B em BF16 e cerca de 10% ou menos acima de 8B. Trabalho só na cabeça rende cerca de 1,1 vez em modelos grandes.
