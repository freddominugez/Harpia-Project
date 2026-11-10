---
numero: 7
titulo: "Controle como problema de Bellman"
estatuto: "teste"
selo: "enquadramento"
resumo: "A hipótese central do programa escrita como problema de controle: diz o que otimizar e permite testar o valor empírico do estado de contexto."
equacao: "V(s_k)=\\min\\big\\{\\lambda\\,P(\\text{erro}\\mid s_k),\\ c\\,|g_{k+1}|+\\mathbb E\\,V(s_{k+1})\\big\\}"
arte_previa:
  - "Equação de Bellman em tempo discreto; HJB na formulação contínua"
  - "Parada antecipada aprendida em busca vetorial (DARTH, 2026)"
proximo_teste: "Portão G2 com o controle embaralhado: estima o ganho empírico da política com contexto frente ao controle embaralhado."
parar_se: "O estado de contexto não reduzir o custo esperado em relação ao controle embaralhado."
atualizado: "2026-10-13"
---

## Formulação

Um estado compacto, atualizado causalmente, propõe o que ler. A equação de Bellman só descreve o valor ótimo se esse estado for suficiente para as transições e custos (propriedade de Markov); essa suficiência é uma hipótese a validar. Isso é controle com custo por passo e custo terminal de erro. O estado $s_k$ contém o melhor score exato já visto, o limite $U$ do próximo grupo e o estado de contexto $\theta_t$.

## Consequências

- **Regime certificado:** a parada já está fixada pela exatidão. Sobram para o controle a ordem de abertura dos grupos e o número de bits da primeira passagem.
- **Valor do contexto:** a diferença entre valores ótimos com e sem contexto depende dos modelos de estado. O controle embaralhado mede o ganho empírico da política testada, não necessariamente esse ótimo.
- **Regime estatístico:** uma política de limiar é uma hipótese testável. Poucas dimensões não garantem sua otimalidade; seriam necessárias propriedades adicionais de monotonicidade dos custos e transições.
