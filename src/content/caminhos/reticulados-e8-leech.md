---
numero: 5
titulo: "Reticulados E8 e Leech para o vetor armazenado"
estatuto: "lacuna"
selo: "aplicação proposta: embeddings"
resumo: "Códigos de reticulado aninhado, hoje usados em pesos de LLM, aplicados ao vetor guardado no índice."
equacao: "\\Gamma(R)=2\\cdot2^{-2R}-2^{-4R},\\quad R\\ge R^*\\approx 0{,}906"
arte_previa:
  - "NestQuant (2025)"
  - "QuIP# (2024), dicionário E8"
  - "Ordentlich e Polyanskiy, limite de taxa e distorção para produto interno"
proximo_teste: "Encoder fixo, rotação de Hadamard e comparação em bits iguais entre int4, Extended RaBitQ e código de Voronoi em E8."
parar_se: "O E8 não igualar o código escalar com pelo menos 5% menos bits entre 2 e 4 bits por dimensão, ou o núcleo por tabela for mais lento que o núcleo inteiro de 4 bits."
atualizado: "2026-10-13"
---

## Mecanismo proposto

Após uma rotação, o vetor é dividido em blocos de 8 (E8) ou 24 (Leech) dimensões, quantizados por um código finito derivado do reticulado. A rotação não garante que quaisquer embeddings se tornem gaussianos; essa aproximação precisa ser verificada.

## O que o teorema estabelece

[Ordentlich e Polyanskiy](https://arxiv.org/html/2410.13780v1) estudam produtos de matrizes gaussianas independentes, com ambos os fatores comprimidos a $R$ bits por entrada. Sob as hipóteses e normalização do artigo, a função assintótica inclui

$$
\Gamma(R)=2\cdot2^{-2R}-2^{-4R},\qquad R\ge R^*\approx0{,}906.
$$

O erro total tem a escala de variância e dimensões do problema; $\Gamma$ não é o erro absoluto de qualquer embedding. Construções aninhadas assintóticas atingem o limite, mas um código finito E8 ou Leech não herda automaticamente essa otimalidade. A subamostragem ótima no regime de baixa taxa desse modelo é uma analogia com redução de dimensões, não uma prova sobre Matryoshka aprendido.

## Comparação necessária

Comparar distorção e raio em igual número de bits e mesma escala/covolume. As razões numéricas de raio antes mencionadas não ficam como ganho garantido: um raio de cobertura de reticulado infinito não determina sozinho o custo de um código finito ou do índice.

## Riscos

Produtos por tabela podem custar mais que operações inteiras. Medir memória total, reconstrução e latência no mesmo hardware, com int4 e Extended RaBitQ como comparadores.
