---
titulo: "Uma escala diagonal por leitura sobre tabela única substitui tabelas separadas?"
categoria: "Caminhos"
caminho: "escala-diagonal"
links:
  - "https://arxiv.org/abs/2611.23386"
  - "https://www.harpya.org/estudos/caminhos/escala-diagonal/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-19"
origem: "curadoria-diaria"
---

O Chorus mantém uma só tabela de embeddings de n-gramas para a rede inteira e deixa cada camada reescalar os componentes com fatores tirados do estado oculto antes de projetar. Os autores relatam qualidade igual à dos métodos com tabelas por camada usando tabelas 87% menores. O caminho 2 reescala as colunas da tabela por uma diagonal fixa; fica em aberto se uma diagonal que depende da consulta preserva o ganho medido na triagem int8. Medir a fração de sobreviventes com a diagonal fixa contra uma diagonal calculada por consulta, nos mesmos bytes.
