---
numero: 8
titulo: "Cabeça de saída: métrica do softmax e logits incrementais"
estatuto: "teste"
selo: "teste de minutos"
resumo: "Duas ideias para a camada que escolhe o próximo token, a avaliar por posto efetivo, erro e custo de execução."
equacao: "z_{t+1}=z_t+W\\,(h_{t+1}-h_t)"
arte_previa:
  - "SVD-softmax (2017), cerca de 20% da aritmética"
  - "FlashHead (2026), cabeça 4,9 vezes mais rápida sem garantia"
  - "Softmax adaptativo (2017)"
proximo_teste: "Em traços reais de decodificação de um modelo pequeno, medir o posto efetivo dos incrementos de estado e da métrica local do softmax."
parar_se: "90% da energia exigir mais de d/5 direções na maioria dos passos."
atualizado: "2026-10-13"
---

## Ideia 1: precisão guiada pela métrica local

$$
\nabla^2A(\lambda)=\mathrm{Cov}[\gamma\mid\lambda]=\sum_v p_v(\gamma_v-\bar\gamma)(\gamma_v-\bar\gamma)^\top
$$

Quando a distribuição se concentra, essa métrica pode ter **posto efetivo** baixo, embora o posto algébrico permaneça alto. A hipótese é alocar precisão segundo o espectro; a aproximação precisa de orçamento de erro e comparação com a margem do argmax.

## Ideia 2: logits incrementais

A identidade $z_{t+1}=z_t+W(h_{t+1}-h_t)$ é exata. Só pode economizar se os incrementos da trajetória forem bem representados em um subespaço pequeno, com $WB$ pré-calculado, e se projeção e correção custarem menos que a multiplicação completa. O posto de um vetor isolado não prova essa estrutura.

## Teto

Lei de Amdahl: se a cabeça ocupa uma fração $\alpha$ da latência, acelerá-la por $s$ produz ganho total $1/[(1-\alpha)+\alpha/s]$. [FlashHead](https://arxiv.org/html/2603.14591v1) mede cerca de 25% no Llama-3.2-1B BF16 e ganho de 4,9× na cabeça, mas cerca de 1,2× ponta a ponta nesse cenário. Para $\alpha=0{,}10$, o teto ideal seria 1,11×; essa fração não é uma regra universal para modelos acima de 8B.
