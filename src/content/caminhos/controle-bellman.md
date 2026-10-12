---
numero: 7
titulo: "Controle como problema de Bellman"
estatuto: "teste"
selo: "enquadramento"
resumo: "A hipótese central do programa escrita como problema de controle: diz o que otimizar e mede o teto do estado de contexto."
equacao: "V(s_k)=\\min\\big\\{\\lambda\\,P(\\text{erro}\\mid s_k),\\ c\\,|g_{k+1}|+\\mathbb E\\,V(s_{k+1})\\big\\}"
arte_previa:
  - "Equação de Hamilton-Jacobi-Bellman em tempo discreto"
  - "Parada antecipada aprendida em busca vetorial (DARTH, 2026)"
proximo_teste: "Portão G2 com o controle embaralhado: mede a diferença entre V sem e com o estado de contexto."
parar_se: "O estado de contexto não reduzir o custo esperado em relação ao controle embaralhado."
atualizado: "2026-10-12"
---

## Formulação

Um estado compacto, atualizado causalmente, decide o que ler. Isso é controle com custo por passo e custo terminal de erro. O estado $s_k$ contém o melhor score exato já visto, o limite $U$ do próximo grupo e o estado de contexto $\theta_t$.

## Consequências

- **Regime certificado:** a parada já está fixada pela exatidão. Sobram para o controle a ordem de abertura dos grupos e o número de bits da primeira passagem.
- **Teto do estado de contexto:** é a diferença entre $V$ sem $\theta_t$ e $V$ com $\theta_t$.
- **Regime estatístico:** com estado de poucas dimensões, a política ótima é um limiar calibrado. Não é preciso resolver a equação diferencial.
