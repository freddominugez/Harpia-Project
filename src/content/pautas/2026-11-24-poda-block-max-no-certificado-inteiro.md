---
titulo: "Limites por bloco, como no Block-Max MaxScore, apertam a exclusão do caminho 1?"
categoria: "Caminhos"
caminho: "certificado-inteiro"
links:
  - "https://arxiv.org/abs/2611.28555"
  - "https://www.harpya.org/estudos/caminhos/certificado-inteiro/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-24"
origem: "curadoria-diaria"
---

O abc index faz recuperação exata sobre representações esparsas aprendidas combinando avaliação termo a termo, Block-Max MaxScore e reordenação de ids, e relata ser o índice exato mais rápido no MS MARCO com quatro modelos. O caminho 1 também exclui candidatos com um limite superior conservador antes de ler o resto de cada linha. Fica em aberto se um limite guardado por bloco de linhas, somado ao limite dos 4 bits altos, aumenta a fração excluída sem perder a exatidão. Medir a fração de linhas que dispensam os 4 bits baixos e o tempo total, com e sem limite por bloco, no mesmo corpus do ensaio local.
