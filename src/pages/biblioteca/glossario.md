---
layout: ../../layouts/Texto.astro
titulo: "Glossário"
kicker: "Biblioteca"
lead: "Os termos que aparecem no site, em uma ou duas linhas cada."
descricao: "Glossário do Harpya: embeddings, quantização, busca vetorial e medição."
atualizado: "2026-10-13"
relacionados:
  - { href: "/equacoes/", titulo: "Equações", sub: "As 16 etapas e componentes de um LLM", icone: "sigma" }
  - { href: "/biblioteca/", titulo: "Livros e artigos", sub: "O acervo do projeto", icone: "book" }
  - { href: "/biblioteca/fontes/", titulo: "Fontes", sub: "Onde pesquisar", icone: "globe" }
---

**Arte prévia.** Trabalho já publicado que contém a ideia ou parte dela. Todo caminho lista a sua.

**Cauchy-Schwarz.** $|\langle a,b\rangle|\le\|a\|\,\|b\|$. É o limite usado para excluir candidatos com certeza.

**Embedding.** Vetor que representa um token, uma frase ou um documento. Textos parecidos ficam com vetores próximos.

**Encoder.** A rede que transforma texto em embedding. Sua participação na latência depende de corpus, índice, lote e hardware; foi dominante no ensaio local com 5 mil documentos.

**Latência p95.** O tempo abaixo do qual ficam 95% das requisições. Ajuda a avaliar a cauda da distribuição; não é o máximo nem um limite de pior caso.

**Matryoshka.** Treino em que os prefixos do vetor também são vetores válidos, permitindo cortar dimensões depois.

**MIPS.** Busca do produto interno máximo: achar o vetor com maior $\langle q,x\rangle$. Na decodificação gulosa, o argmax de uma cabeça linear equivale a MIPS antes de ajustes de logits; amostragem exige a distribuição.

**Quantização.** Representar valores por um conjunto discreto de códigos. Pode usar inteiros com escala, formatos de precisão reduzida, níveis não uniformes ou codebooks vetoriais.

**RaBitQ.** Quantização de 1 a poucos bits por dimensão, com rotação aleatória e limite de erro probabilístico.

**Rastreamento (tracing) e spans.** Registro de cada etapa de uma chamada a um modelo, com início, fim e metadados. Usado para medir latência e custo por etapa.

**Regra de parada.** Condição, definida antes do teste, que encerra um caminho se o resultado não vier.

**Sobreviventes.** Fração de candidatos que o limite não conseguiu excluir e que precisa de leitura completa.

**Token.** Pedaço de texto que o modelo trata como unidade, em geral parte de uma palavra.

**Varredura em blocos.** Calcular todos os produtos internos de uma vez com multiplicação de matrizes otimizada. É o comparador obrigatório de qualquer método exato.
