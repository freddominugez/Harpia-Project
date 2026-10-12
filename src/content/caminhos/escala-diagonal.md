---
numero: 2
titulo: "Escala diagonal da tabela"
estatuto: "medido"
selo: "medido: 0,397% de sobreviventes"
resumo: "Centralizar a tabela e reescalar cada coluna pela sua faixa. Foi o único ganho claro medido até aqui."
equacao: "\\tilde W=(W-\\mu)D^{-1},\\quad \\tilde h=Dh,\\quad D_j=r_j=\\max_i|w_{ij}-\\mu_j|"
arte_previa:
  - "Normalização por coluna é prática comum em quantização escalar"
proximo_teste: "Verificar se o ganho sobrevive à rotação aleatória e ao precondicionador em blocos 64x64."
parar_se: "A rotação necessária para o raio probabilístico desfizer o ganho da escala diagonal."
atualizado: "2026-10-12"
---

## Mecanismo

O produto interno não muda sob a reparametrização $(W-\mu)D^{-1}\cdot Dh$, mas a quantização em int8 muda. Escolher $D$ altera quanto erro cada coluna recebe.

## Resultado demonstrado

A razão entre o limite de exclusão e o sinal é proporcional a $\|Dh\|\cdot\max_j(r_j/D_j)$. Ela não muda se $D$ for multiplicado por uma constante e é mínima em $D_j=r_j$ para todo $h$. **Entre as matrizes diagonais, esta escolha já é ótima.**

## Medido

| Variante | Sobreviventes |
|---|---|
| Original | 2,345% |
| Só centralização | 3,191% |
| Rotação por autovetores e escala | 5,455% |
| **Escala diagonal** | **0,397%** |

## Próximo passo

A rotação aleatória do caminho 3 pode desfazer este ganho. O teste é medir as duas coisas juntas.
