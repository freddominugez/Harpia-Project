---
titulo: "A leitura em duas passagens do caminho 1 se beneficia de depender da consulta?"
categoria: "Caminhos"
caminho: "certificado-inteiro"
links:
  - "https://arxiv.org/abs/2610.24890"
  - "https://www.harpya.org/estudos/caminhos/certificado-inteiro/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-20"
origem: "curadoria-diaria"
---

O artigo separa o orçamento de bits guardados do orçamento de bits lidos e prova que, se a escolha do que ler não depende da consulta, guardar mais bits não reduz o erro do produto interno. Com leitura dependente da consulta, um protocolo em dois lotes faz o erro cair à medida que o armazenamento cresce. O caminho 1 já lê os 4 bits altos e decide pela consulta quem recebe os 4 bits baixos, mas o resultado é teórico, para erro quadrático médio no pior caso, e não para exclusão certa no top-k. Vale medir, nos embeddings do programa, quantos bits por linha a segunda passagem lê na mediana quando a regra de leitura usa a consulta e quando não usa, no mesmo armazenamento int8.
