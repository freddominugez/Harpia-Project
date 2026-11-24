---
titulo: "O critério de erro do RefineKV serve de modelo ao certificado único do caminho 4?"
categoria: "Caminhos"
caminho: "certificado-bits-dimensoes"
links:
  - "https://arxiv.org/abs/2611.28171"
  - "https://www.harpya.org/estudos/caminhos/certificado-bits-dimensoes/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-24"
origem: "curadoria-diaria"
---

O RefineKV agrupa o cache KV, usa representantes compactos para os grupos de erro pequeno e expande os demais, escolhendo por consulta a partir de um limite superior do erro na saída da atenção. O caminho 4 propõe algo análogo na busca: um só limite que soma o resíduo de bits e a cauda de dimensões e decide, por consulta, o que ler. Fica em aberto se um orçamento de erro distribuído por grupos, como no RefineKV, lê menos dados que o limite por linha mantendo o mesmo top-k. Medir bytes lidos por consulta e recall@10 das duas regras no mesmo corpus.
