---
numero: 6
titulo: "Bits por coluna segundo a sensibilidade"
estatuto: "arte"
selo: "arte prévia: SAQ"
resumo: "Dar mais bits às colunas que mais pesam no erro. A versão determinística ainda não foi publicada."
equacao: "|Z_i^\\top x|\\le\\sqrt{\\textstyle\\sum_j(Z_{ij}/s_j)^2}\\;\\sqrt{\\textstyle\\sum_j s_j^2x_j^2}"
arte_previa:
  - "SAQ (2025), bits por segmento por programação dinâmica"
  - "DFT conceitual e Optimal Brain Surgeon, como origem da ideia de sensibilidade"
proximo_teste: "Calcular o fator G nos estados reais e nos embeddings. Leva minutos."
parar_se: "G menor que 1,5."
atualizado: "2026-10-12"
---

## Mecanismo

O certificado vale com passo $s_j=2^{b_j}$ próprio de cada coluna. Por Cauchy-Schwarz ponderado, com a soma dos $b_j$ fixa, o segundo fator é mínimo quando $s_j|x_j|$ é igual em todas as colunas. O limite encolhe por

$$
G=\sqrt{\mathrm{MA}/\mathrm{MG}}\quad\text{de}\quad q_j=r_j^2\,\mathbb E[h_j^2]
$$

a razão entre as médias aritmética e geométrica do perfil de colunas.

## Ressalva

Os $b_j$ são inteiros e se perde o alinhamento de byte do 4/4, único ponto em que bytes viraram tempo nas medições.
