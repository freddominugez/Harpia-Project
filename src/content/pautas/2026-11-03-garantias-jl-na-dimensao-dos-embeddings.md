---
titulo: "As garantias do tipo JL valem na dimensão dos embeddings que usamos?"
categoria: "Caminhos"
caminho: "raio-probabilistico"
links:
  - "https://arxiv.org/abs/2611.02808"
  - "https://www.harpya.org/estudos/caminhos/raio-probabilistico/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-03"
origem: "curadoria-diaria"
---

O artigo calcula versões concretas das garantias de imersões de subespaço do tipo Johnson-Lindenstrauss e conclui que, para precisão usada na prática, a dimensão reduzida exigida fica grande demais para dar ganho em dados de tamanho comum. O caminho 3 troca a folga determinística por uma taxa de falha explícita, que também vem de concentração. Fica em aberto se o limite que o caminho usa é apertado o bastante para excluir candidatos na dimensão dos embeddings do site ou se só vale com folga inútil. Medir a fração excluída com o limite teórico contra a fração excluída com o quantil empírico, no mesmo conjunto.
