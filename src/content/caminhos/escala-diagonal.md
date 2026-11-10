---
numero: 2
titulo: "Escala diagonal da tabela"
estatuto: "medido"
selo: "medido: 0,397% de sobreviventes"
resumo: "Centralizar a tabela e reescalar cada coluna pela sua faixa. Foi o único ganho claro medido até aqui."
equacao: "\\tilde W=(W-\\mu)D^{-1},\\quad \\tilde h=Dh,\\quad D_j=r_j=\\max_i|w_{ij}-\\mu_j|"
arte_previa:
  - "Normalização por coluna é prática comum em quantização escalar"
proximo_teste: "Verificar se o ganho sobrevive à rotação aleatória e ao precondicionador em blocos 64x64."
parar_se: "A rotação necessária para o raio probabilístico desfizer o ganho da escala diagonal."
atualizado: "2026-10-13"
---

## Mecanismo

A centralização acrescenta um termo comum ao score:

$$
\langle w_i,h\rangle=\langle\mu,h\rangle+\langle(w_i-\mu)D^{-1},Dh\rangle.
$$

O termo $\langle\mu,h\rangle$ não altera a ordenação nem o softmax. Para recuperar scores absolutos e comparar certificados, é preciso incluí-lo ou trabalhar consistentemente com scores centralizados. A reparametrização preserva o produto centralizado; a quantização em int8 pode mudar o erro.

## Resultado demonstrado sob hipóteses

Para faixas $r_j>0$ e escalas $D_j>0$, o limite $\|Dh\|\max_j(r_j/D_j)$ é mínimo em $D_j=r_j$, salvo uma escala comum. Normalizando o máximo para 1, tem-se $D_j\ge r_j$, e essa escolha minimiza a norma. Isso é ótimo para esse limite, não uma prova de ótimo em latência ou erro de quantização. Colunas constantes ($r_j=0$) devem ter sua contribuição separada, sem divisão por zero.

## Medido no ensaio local

| Variante | Sobreviventes |
|---|---|
| Original | 2,345% |
| Só centralização | 3,191% |
| Rotação por autovetores e escala | 5,455% |
| **Escala diagonal** | **0,397%** |

A redução de candidatos foi de cerca de 83,1%; isso não implica a mesma redução de latência. Veja o [estado da documentação experimental](/estudos/#evidencia-experimental).

## Próximo passo

A rotação aleatória do caminho 3 pode desfazer este ganho. O teste é medir as duas coisas juntas.
