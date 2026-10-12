---
titulo: "Quantos bits ler na primeira passagem?"
categoria: "Caminhos"
caminho: "certificado-inteiro"
links:
  - "https://www.harpya.org/estudos/caminhos/certificado-inteiro/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-12"
origem: "manual"
---

O certificado inteiro lê primeiro os 4 bits altos de cada linha int8 e só depois os 4 bits baixos dos sobreviventes. Dividir em 4 e 4 é a melhor escolha, ou 3 e 5 (ou 2 e 6) reduziria os bytes lidos na mediana sem perder a garantia de exclusão? Que medida vocês usariam para comparar: bytes lidos, sobreviventes ou tempo em blocos com SIMD?
