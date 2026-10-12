---
numero: 5
titulo: "Reticulados E8 e Leech para o vetor armazenado"
estatuto: "lacuna"
selo: "não usado em embeddings"
resumo: "Códigos de reticulado aninhado, hoje usados em pesos de LLM, aplicados ao vetor guardado no índice."
equacao: "\\Gamma(R)=2\\cdot2^{-2R}-2^{-4R},\\quad R\\ge R^*\\approx 0{,}906"
arte_previa:
  - "NestQuant (2025)"
  - "QuIP# (2024), dicionário E8"
  - "Ordentlich e Polyanskiy, limite de taxa e distorção para produto interno"
proximo_teste: "Encoder fixo, rotação de Hadamard e comparação em bits iguais entre int4, Extended RaBitQ e código de Voronoi em E8."
parar_se: "O E8 não igualar o código escalar com pelo menos 5% menos bits entre 2 e 4 bits por dimensão, ou o núcleo por tabela for mais lento que o núcleo inteiro de 4 bits."
atualizado: "2026-10-12"
---

## Mecanismo

Depois de uma rotação que torna as coordenadas aproximadamente gaussianas, o vetor é cortado em blocos de 8 (E8) ou 24 (Leech) dimensões, e cada bloco vai para o ponto mais próximo do reticulado. Para dois vetores gaussianos comprimidos a $R$ bits por entrada, o menor erro quadrático do produto interno é

$$
\Gamma(R)=2\cdot 2^{-2R}-2^{-4R}\qquad (R\ge R^*\approx 0{,}906)
$$

e reticulados aninhados atingem esse limite. Abaixo de cerca de 0,9 bit por entrada, o ótimo é manter menos dimensões, o que é a contrapartida teórica de Matryoshka com 1 bit.

## Teto

O ganho de forma sobre a grade inteira fica em fração de bit por dimensão. Como reforço do certificado, o raio de cobertura em taxa igual encolhe cerca de 1,41 vez com E8 e 1,73 vez com Leech (constantes clássicas, a conferir em fonte). É pouco diante da folga de 29 vezes.

## Riscos

Produtos internos por tabela podem ser mais lentos que popcount e multiplica-acumula inteiros. Foi o que a Elastic mediu contra o TurboQuant.
