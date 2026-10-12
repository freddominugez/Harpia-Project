---
numero: 1
titulo: "Certificado inteiro com leitura progressiva em bits"
estatuto: "arte"
selo: "arte prévia: VA-file, FEXIPRO"
principal: true
resumo: "Ler primeiro os 4 bits altos de cada linha int8, excluir com certeza quem não pode vencer e ler os 4 bits baixos só dos sobreviventes."
equacao: "\\langle h,w_i\\rangle=\\langle h,\\hat w_i\\rangle+\\langle h,r_i\\rangle,\\quad |\\langle h,r_i\\rangle|\\le\\|h\\|\\,\\|r_i\\|"
arte_previa:
  - "VA-file (Weber, Schek e Blott, VLDB 1998)"
  - "FEXIPRO (SIGMOD 2017), estágio com aproximação inteira"
  - "PDX-BOND e Panorama (2025), poda determinística por dimensões"
proximo_teste: "Comparar com PDX-BOND, Panorama e varredura em blocos com SIMD, relatando melhor, mediana e pior consulta."
parar_se: "Os bytes lidos na mediana não caírem pela metade em relação ao 4/4 atual, ou o esquema perder em relógio para a varredura em blocos."
atualizado: "2026-10-12"
---

## Mecanismo

Cada linha da tabela é guardada em int8 e separada em parte alta e parte baixa. A primeira passagem lê só os 4 bits altos, $\hat w_i$, e calcula um limite superior para cada candidato. Quem não pode alcançar o $k$-ésimo melhor é excluído **com certeza**. A segunda passagem lê os 4 bits baixos apenas dos sobreviventes.

$$
U_i=\langle h,\hat w_i\rangle+\|h\|\,\rho_i,\qquad i\ \text{é excluído se}\ U_i<s_k
$$

com $\rho_i$ o maior resíduo possível da linha e $s_k$ a $k$-ésima melhor pontuação exata já vista.

## O que já foi medido no programa

- O limite de Cauchy-Schwarz é **cerca de 29 vezes mais largo** que o resíduo típico. É a folga que todos os outros caminhos tentam reduzir.
- Em embeddings, o encoder responde por cerca de **99% da latência** com 5 mil documentos (7,1 ms contra 0,075 ms da varredura). A vantagem do certificado aparece em bytes e em exatidão, não em milissegundos, nessa escala.

## O que já existe publicado

A leitura progressiva em bits é a estrutura do **VA-file** (1998). Limites inteiros para poda exata aparecem no **FEXIPRO** (2017). A poda por dimensões com limite determinístico está no **PDX-BOND** e no **Panorama** (2025). O que pode ser novo aqui é o limite específico, a sua folga em embeddings neurais de 768 a 3.072 dimensões e o regime em que vence.

> Antes de qualquer alegação de novidade, ler o artigo primário do FEXIPRO.

## Limites conhecidos

Busca exata por produto interno não admite garantia sublinear no pior caso (resultado sob a hipótese SETH). Todo ganho exato é um fator constante sobre a varredura. Em 2017, a multiplicação de matrizes em blocos venceu a poda exata em 53 de 92 configurações.
