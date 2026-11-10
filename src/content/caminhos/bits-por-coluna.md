---
numero: 6
titulo: "Bits por coluna segundo a sensibilidade"
estatuto: "arte"
selo: "arte prévia: SAQ"
resumo: "Dar mais bits às colunas que mais pesam no erro. A versão determinística proposta precisa de demonstração e comparação bibliográfica."
equacao: "|Z_i^\\top x|\\le\\sqrt{\\textstyle\\sum_j(Z_{ij}/s_j)^2}\\;\\sqrt{\\textstyle\\sum_j s_j^2x_j^2}"
arte_previa:
  - "SAQ (2025), bits por segmento por programação dinâmica"
  - "DFT conceitual e Optimal Brain Surgeon, como origem da ideia de sensibilidade"
proximo_teste: "Calcular o fator G nos estados reais e nos embeddings. Leva minutos."
parar_se: "G menor que 1,5."
atualizado: "2026-10-13"
---

## Mecanismo

Neste caminho, $b_j$ representa **bits descartados** de uma coordenada inteira e $s_j=2^{b_j}$ sua escala em unidades inteiras. Se $b_j$ designar bits retidos em uma faixa fixa, o passo cai aproximadamente como $r_j2^{-b_j}$; são convenções diferentes.

O limite de Cauchy–Schwarz ponderado exibido acima é válido para $s_j>0$. Seus dois fatores dependem da escala. Minimizar apenas o segundo exige uma hipótese adicional que mantenha o primeiro limitado, como um limite coordenado de resíduos normalizados.

## Hipótese de alocação

Para um objetivo contínuo de erro com pesos positivos $q_j=r_j^2\mathbb E[h_j^2]$, a razão entre médias aritmética e geométrica pode indicar o benefício de redistribuir precisão:

$$
G=\sqrt{\mathrm{MA}(q)/\mathrm{MG}(q)}.
$$

É um indicador do modelo contínuo, não uma garantia de ganho do certificado implementado. É preciso especificar o objetivo, demonstrar a alocação e medir os dois fatores do limite.

## Ressalvas

Bits inteiros, limites mínimo e máximo de precisão e colunas com $q_j=0$ exigem tratamento separado. Não interpretar média geométrica zero como ganho infinito. A implementação também pode perder o alinhamento de byte do 4/4 e acrescentar custo de leitura.
