---
numero: 11
titulo: "Valor em precisão alta e derivada em poucos bits"
estatuto: "lacuna"
selo: "hipótese: comparação pendente"
resumo: "Cada item guarda um vetor e uma direção de variação. É a forma de primeira ordem do estado de controle."
equacao: "s(q,i;c)=\\langle q,v_i\\rangle+c\\,\\langle q,t_i\\rangle"
arte_previa:
  - "Números duais: (a+bε)(c+dε)=ac+(ad+bc)ε, com ε²=0"
proximo_teste: "Em orçamento igual de bytes, treinar (v, t) com controle c e comparar com um vetor real de 2d e com um Matryoshka de 2d."
parar_se: "Não superar os dois em nDCG@10."
atualizado: "2026-10-13"
---

## Mecanismo

Um estado escalar $c$ modula muitos vetores sem reindexar. A versão útil guarda $v_i$ em precisão alta e $t_i$ em 1 a 2 bits.

## Obstáculo

Algebricamente é o mesmo que guardar dois vetores reais por item. Com consulta restrita a $(q,cq)$, o score equivale a $\langle q,v_i+ct_i\rangle$. A comparação de expressividade depende de $c$ ser fixo ou variável e da família de consultas. Igualar bytes não iguala automaticamente parâmetros treináveis ou custo de gerar as features. O caminho precisa demonstrar sua vantagem contra as duas alternativas sob um orçamento explicitamente definido.
