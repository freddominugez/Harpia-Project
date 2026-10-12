---
layout: ../../layouts/Texto.astro
titulo: "Glossário"
kicker: "Biblioteca"
lead: "Os termos que aparecem no site, em uma ou duas linhas cada."
descricao: "Glossário do Harpya: embeddings, quantização, busca vetorial e medição."
---

**Arte prévia.** Trabalho já publicado que contém a ideia ou parte dela. Todo caminho lista a sua.

**Cauchy-Schwarz.** $|\langle a,b\rangle|\le\|a\|\,\|b\|$. É o limite usado para excluir candidatos com certeza.

**Embedding.** Vetor que representa um token, uma frase ou um documento. Textos parecidos ficam com vetores próximos.

**Encoder.** A rede que transforma texto em embedding. Em busca semântica, é onde está quase todo o custo.

**Latência p95.** O tempo abaixo do qual ficam 95% das requisições. Mostra o pior caso comum, que a média esconde.

**Matryoshka.** Treino em que os prefixos do vetor também são vetores válidos, permitindo cortar dimensões depois.

**MIPS.** Busca do produto interno máximo: achar o vetor com maior $\langle q,x\rangle$. A cabeça de saída de um LLM resolve um MIPS a cada token.

**Quantização.** Trocar números de 16 ou 32 bits por inteiros de poucos bits mais uma escala.

**RaBitQ.** Quantização de 1 a poucos bits por dimensão, com rotação aleatória e limite de erro probabilístico.

**Rastreamento (tracing) e spans.** Registro de cada etapa de uma chamada a um modelo, com início, fim e metadados. Usado para medir latência e custo por etapa.

**Regra de parada.** Condição, definida antes do teste, que encerra um caminho se o resultado não vier.

**Sobreviventes.** Fração de candidatos que o limite não conseguiu excluir e que precisa de leitura completa.

**Token.** Pedaço de texto que o modelo trata como unidade, em geral parte de uma palavra.

**Varredura em blocos.** Calcular todos os produtos internos de uma vez com multiplicação de matrizes otimizada. É o comparador obrigatório de qualquer método exato.
