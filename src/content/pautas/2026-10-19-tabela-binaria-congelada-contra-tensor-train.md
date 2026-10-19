---
titulo: "Uma tabela binária congelada entra como terceira base contra o tensor-train?"
categoria: "Caminhos"
caminho: "tensor-train-na-cabeca"
links:
  - "https://arxiv.org/abs/2610.22428"
  - "https://www.harpya.org/estudos/caminhos/tensor-train-na-cabeca/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-19"
origem: "curadoria-diaria"
---

O artigo troca a tabela de vocabulário de um modelo com o formato do Gemma 3 270M por códigos de 512 bits congelados, obtidos por projeção em componentes principais e sinal, em 16 MB, e relata empate ou vantagem em LAMBADA, HellaSwag e PIQA contra a tabela aprendida, com 0,20 nat a mais de perda de validação. O caminho 12 compara tensor-train com int4 no mesmo número de bytes, mas não tem uma base de 1 bit sem parâmetros treináveis. Fica em aberto se o resultado vale para a cabeça de saída, e não só para a entrada, e se resiste em modelos maiores que 270M. Vale medir as três tabelas no mesmo orçamento de bytes e na mesma perplexidade, contando o custo de reconstruir as linhas.
