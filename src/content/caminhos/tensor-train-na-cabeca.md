---
numero: 12
titulo: "Tensor-train na cabeça de saída"
estatuto: "arte"
selo: "arte prévia: word2ket, TT"
resumo: "Fatorar a tabela do vocabulário como produto de tensores pequenos e comparar com int4 em bytes iguais."
equacao: "W_{i,:}=G_1[i_1]\\,G_2[i_2]\\cdots G_N[i_N]"
arte_previa:
  - "TT-embedding (2020): tabela 15 a 58 vezes menor, perda de 0,4 a 1,3 ponto de BLEU"
  - "word2ket e word2ketXS"
  - "TensorGPT: aplicado depois do treino, degrada acima de 2 vezes"
proximo_teste: "Cabeça tensor-train treinada junto, com int8, contra cabeça int4 simples no mesmo número de bytes, incluindo o custo de reconstruir as linhas."
parar_se: "Não vencer o int4 em perplexidade no mesmo orçamento, ou a reconstrução deixar a cabeça mais lenta."
atualizado: "2026-10-12"
---

## Limite de princípio

A informação mútua em texto cresce com expoente 0,82, perto de uma lei de volume. Redes tensoriais unidimensionais só são eficientes quando ela satura. Para modelar texto bem, a dimensão de ligação cresce e a compressão some.

## Origem

É a mesma fatoração que simuladores clássicos usam para estados quânticos de pouco emaranhamento. Simular qubits em binário não aumenta a densidade de um modelo; a fatoração em produto tensorial, sim, com perda.
