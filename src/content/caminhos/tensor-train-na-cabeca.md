---
numero: 12
titulo: "Tensor-train na cabeça de saída"
estatuto: "arte"
selo: "arte prévia: word2ket, TT"
resumo: "Fatorar a tabela do vocabulário como produto de tensores pequenos e comparar com int4 em bytes iguais."
equacao: "W_{i,:}=G_1[i_1]\\,G_2[i_2]\\cdots G_N[i_N]"
arte_previa:
  - "TT-embedding (2020): tabela 15 a 58 vezes menor, perda de 0,4 a 1,3 ponto de Token BLEU no cenário citado"
  - "word2ket e word2ketXS"
  - "TensorGPT: compressão pós-treino de cerca de 2× com resultados comparáveis em cenários avaliados"
proximo_teste: "Cabeça tensor-train treinada junto, com int8, contra cabeça int4 simples no mesmo número de bytes, incluindo o custo de reconstruir as linhas."
parar_se: "Não vencer o int4 em perplexidade no mesmo orçamento, ou a reconstrução deixar a cabeça mais lenta."
atualizado: "2026-10-13"
---

## Evidência e alcance

Um [estudo de redes tensoriais para dados clássicos](https://arxiv.org/html/2103.06872v2) mediu crescimento da informação mútua com expoente próximo de 0,82 em um recorte de WikiText-2, com representação e comprimentos finitos específicos. Não é uma lei universal do texto. Crescimento logarítmico também pode permitir ranks polinomiais; saturação não é a única condição possível de eficiência.

O estudo trata a distribuição dos dados, não a matriz de unembedding. Não demonstra que a compressão TT de uma cabeça específica desaparecerá. É preciso medir ranks, espectros, erro e custo de reconstrução da matriz concreta.

## Comparadores publicados

[TT-embedding](https://aclanthology.org/2020.findings-emnlp.436.pdf) relata compressões de 15,3× a 58,5× com quedas de aproximadamente 0,41 a 1,32 ponto de **Token BLEU** no cenário WMT14 alemão–inglês da tabela citada. As quedas de SacreBLEU são diferentes. [TensorGPT](https://arxiv.org/abs/2307.00526) avalia outra construção; seus resultados não estabelecem um limiar universal de compressão de 2×.

## Origem

A fatoração se relaciona a representações usadas em simulação de estados quânticos estruturados. A economia depende dos ranks e da tolerância de aproximação; não vem de uma densidade especial de qubits simulados.
