---
numero: 4
titulo: "Certificado único sobre bits e dimensões"
estatuto: "lacuna"
selo: "hipótese: combinação de limites"
resumo: "Um só limite que soma o resíduo de bits e a cauda de dimensões, escolhendo por consulta o que ler."
equacao: "|\\langle q,x\\rangle-\\langle q_{1:m},\\hat x^{(b)}_{1:m}\\rangle|\\le\\|q_{1:m}\\|\\,\\|r^{(b)}_{1:m}\\|+\\|q_{m+1:d}\\|\\,\\|x_{m+1:d}\\|"
arte_previa:
  - "VA-file (resíduo de bits)"
  - "Panorama e LEMP (cauda de dimensões)"
  - "PDX-BOND (ordem de dimensões por consulta)"
proximo_teste: "Na tabela 4/4, calcular offline, para uma grade de (m, b), a fração excluída e os bytes lidos até a exclusão."
parar_se: "Os bytes lidos na mediana não caírem pela metade em relação ao 4/4, ou o esquema perder em relógio para a varredura em blocos."
atualizado: "2026-10-13"
---

## Mecanismo

Com as dimensões ordenadas por energia e um código de $b$ bits lido até o prefixo $m$:

$$
\langle q,x\rangle=\langle q_{1:m},\hat x^{(b)}_{1:m}\rangle+\langle q_{1:m},r^{(b)}_{1:m}\rangle+\langle q_{m+1:d},x_{m+1:d}\rangle
$$

Cada parcela já existe em separado na literatura. A combinação específica permanece uma hipótese de pesquisa; esta página não documenta uma busca bibliográfica exaustiva e não estabelece prioridade. Para exatidão, aplicar também as [condições do certificado inteiro](/estudos/caminhos/certificado-inteiro/), incluindo a representação de referência e arredondamento conservador.

## Obstáculos

- Há métodos probabilísticos e determinísticos de filtragem. Identificar a garantia de cada comparador, sem classificar todos os códigos de poucos bits ou métodos determinísticos por uma única regra.
- A poda exata é fraca em embeddings quase gaussianos: o PDX-BOND perde em OpenAI de 1.536 dimensões.
- A compactação de energia pede uma rotação, que pode desfazer a escala diagonal.
