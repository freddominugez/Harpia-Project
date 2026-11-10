---
numero: 9
titulo: "Atalho linear entre camadas do encoder"
estatuto: "arte"
selo: "arte prévia: 2D Matryoshka"
resumo: "Substituir as camadas finais do encoder por um mapa linear ajustado. Ataca o encoder, dominante no ensaio local com 5 mil documentos."
equacao: "\\hat e=M_\\ell\\,\\bar x^{(\\ell)},\\quad M_\\ell=\\arg\\min_M\\|M\\bar X^{(\\ell)}-E\\|_F^2+\\lambda\\|M\\|_F^2"
arte_previa:
  - "2D Matryoshka Sentence Embeddings (2024)"
  - "Leitura de camadas intermediárias (logit lens, tuned lens)"
proximo_teste: "MiniLM de 6 camadas, mapa ajustado nos documentos, nDCG@10 no teste para camadas 3 a 5, contra encoder truncado e contra destilado de mesmo custo."
parar_se: "A perda em nDCG@10 na camada 4 passar de 0,02, ou o destilado de mesmo custo vencer."
atualizado: "2026-10-13"
---

## Por que importa

Com 5 mil documentos, o encoder custa 7,1 ms e a varredura 0,075 ms. A fração $(6-\ell)/6$ estima o trabalho poupado nos blocos se todos tiverem custo igual. Não é a latência total: tokenização, pooling, projeção e overhead permanecem. É preciso medir a execução ponta a ponta e a qualidade no mesmo corpus. Veja o [estado das medições](/estudos/#evidencia-experimental).

## Origem

A teoria de Koopman lineariza uma dinâmica num espaço de observáveis. Como as camadas têm pesos distintos, não há operador único; sobra um mapa linear ajustado de uma camada até a saída. A expectativa é moderada a baixa, porque a destilação costuma ganhar.
