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
atualizado: "2026-10-12"
---

## Mecanismo

Se o resíduo de quantização se comporta como ruído centrado com variância $\sigma_i^2=N_iQ/d$, o limite determinístico $\sqrt{d}\,\sigma_i$ pode ser trocado por $t\,\sigma_i$:

$$
P\big(|Z_i^\top x|\ge t\,\sigma_i\big)\lesssim 2e^{-t^2/2}
$$

Para falha de $10^{-9}$ por linha basta $t\approx 6{,}5$. O raio encolhe por $\sqrt d/6{,}5$: cerca de 3 vezes em $d=384$, 7 em 2.048 e 10 em 4.096. O ganho cresce com a largura.

## Medido

O raio de seis desvios levou o refinamento em 4/4 de 16,7% e 35,7% para 0,31% e 0,83%, sem perder vencedor. No NFCorpus, 1 par em 10 milhões excedeu o raio, mais do que o modelo gaussiano prevê.

## Condição para virar garantia

A probabilidade precisa vir do sorteio do índice, não de uma suposição sobre os dados. É o desenho do RaBitQ e do ADSampling. A novidade possível está em acoplar esse raio a um certificado inteiro exato com reserva determinística, não no raio em si.
