---
titulo: "Ordenar a leitura dos bits baixos por um peso ajuda o certificado inteiro?"
categoria: "Caminhos"
caminho: "certificado-inteiro"
links:
  - "https://arxiv.org/abs/2610.35985"
  - "https://www.harpya.org/estudos/caminhos/certificado-inteiro/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-28"
origem: "curadoria-diaria"
---

O GateRQ guarda cada linha de uma tabela de memória condicional como uma escada de códigos residuais de 1 bit, mantém o primeiro nível na GPU e lê os níveis seguintes só para as consultas que o portão ordena mais alto; os autores relatam perda de cerca de 1 ponto no PopQA com 1,50 bit lido por consulta. O caminho 1 propõe algo parecido para busca: ler os 4 bits altos, excluir quem não pode vencer e ler os bits baixos só dos sobreviventes. Fica em aberto se uma ordem de leitura guiada por peso, em vez da simples sobrevivência ao limite, reduz os bytes lidos sem perder a garantia de exatidão. Medir bytes lidos por consulta e recall exato nas duas ordens, no mesmo índice int8.
