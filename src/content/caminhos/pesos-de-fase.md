---
numero: 10
titulo: "Pesos de fase {±1, ±i}"
estatuto: "arte"
selo: "arte prévia: iFairy"
resumo: "Pesos complexos de 2 bits contra pesos reais de 2 bits no mesmo orçamento. Resultado publicado a comparar com baselines reais."
equacao: "w\\in\\{+1,-1,+i,-i\\}"
arte_previa:
  - "iFairy (2025): perplexidade 10,14 contra 11,29 do BitNet b1.58 em 1,3B"
proximo_teste: "Reprodução em escala pequena, com medição ponta a ponta de latência e memória, além da comparação analítica de armazenamento."
parar_se: "A vantagem de perplexidade não se reproduzir com mais de uma semente."
atualizado: "2026-10-13"
---

## Por que é diferente das outras álgebras

Para busca com pontuação fixa, números complexos não mudam nada: $\mathrm{Re}\langle a,b\rangle$ em $\mathbb C^d$ é o produto interno em $\mathbb R^{2d}$. O ganho do iFairy está nos **pesos** do modelo, no mesmo número de bits.

## O que falta

Na [versão 3 do iFairy](https://arxiv.org/html/2508.05571v3), a média de perplexidade 10,14 contra 11,29 em 1,3B corresponde à tabela publicada; o baseline BitNet assinalado vem de trabalho anterior. Não tratar isso como reprodução simultânea no mesmo protocolo. O artigo não estabelece aqui a variabilidade entre sementes; a reprodução deve medi-la. Dois bits por peso não incluem automaticamente ativações, escalas e todos os componentes, nem demonstram economia total de energia ou latência.
