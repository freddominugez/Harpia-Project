---
numero: 3
titulo: "Raio probabilístico por concentração"
estatuto: "arte"
selo: "arte prévia: RaBitQ, ADSampling"
resumo: "Trocar a folga de raiz de d do limite determinístico por uma taxa de falha explícita."
equacao: "P\\big(|Z_i^\\top x|\\ge t\\,\\sigma_i\\big)\\lesssim 2e^{-t^2/2}"
arte_previa:
  - "RaBitQ e Extended RaBitQ (2024)"
  - "ADSampling (SIGMOD 2023)"
  - "SAQ (2025), estimador em estágios"
proximo_teste: "Duas variantes sobre a tabela 4/4: com rotação aleatória antes da reparametrização (garantia pelo sorteio) e sem rotação (rotulada como não garantida)."
parar_se: "A excedência medida passar de 10 vezes a prevista, ou os sobreviventes não caírem pela metade em relação ao certificado determinístico."
atualizado: "2026-10-13"
---

## Mecanismo e hipóteses

Se $Z_i$ é o resíduo aleatório e $x$ a consulta, uma hipótese subgaussiana para $Z_i^\top x$ permite uma cota da forma

$$
P(|Z_i^\top x|\ge t\sigma_i)\le 2e^{-t^2/2}.
$$

Aqui $\sigma_i$ é um parâmetro subgaussiano da projeção, não necessariamente apenas seu desvio padrão. É preciso demonstrar essa hipótese para o sorteio empregado; ruído centrado e variância conhecida, sozinhos, não a garantem. Para essa cota e risco de $10^{-9}$ por candidato, $t\ge6{,}545$. O raio encolhe em relação ao limite $\sqrt d\sigma_i$ quando ambos são válidos.

## Orçamento de risco

O risco por candidato não é o risco por consulta. Com $N$ candidatos, a união dos eventos limita a falha por $N\delta$, sem supor independência. Para $N=10^6$ e $\delta=10^{-9}$, esse limite é $10^{-3}$ por consulta. Para garantir um orçamento global $\varepsilon$, distribuir o risco entre candidatos e etapas; consultas repetidas ou decisões adaptativas precisam de controle adicional.

## Medido no ensaio local

O raio de seis desvios levou o refinamento em 4/4 de 16,7% e 35,7% para 0,31% e 0,83%, sem perda observada do vencedor. No NFCorpus, 1 par em 10 milhões excedeu o raio, mais do que o modelo gaussiano prevê. Ausência de perda observada não demonstra garantia. Veja a [documentação experimental pendente](/estudos/#evidencia-experimental).

## Condição para virar garantia

A probabilidade precisa ser provada sobre o sorteio do índice, com orçamento global definido. [RaBitQ](https://arxiv.org/abs/2405.12497) e [ADSampling](https://arxiv.org/abs/2303.09855) oferecem referências, com suas próprias hipóteses. Acoplar um raio estatístico a uma reserva determinística não torna automaticamente toda poda exata: a reserva só preserva exatidão se candidatos forem descartados por limites seguros.
