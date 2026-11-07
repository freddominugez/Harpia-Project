---
titulo: "Atribuição, incrementalidade e decisões de marketing"
titulo_curto: "Atribuição, incrementalidade e decisões de marketing"
resumo: "Como ligar seleção, desenho de comparação, incerteza e contribuição econômica à decisão de marketing, sem confundir crédito observado e efeito de uma intervenção."
serie: "Evidências para decisões de marketing"
parte: 1
total: 1
data: "2026-11-06"
atualizado: "2026-11-06"
autor: "Harpya"
status: "publicado"
fontes: ["https://pubsonline.informs.org/doi/10.1287/mksc.2018.1135", "https://journals.sagepub.com/doi/10.1509/jmr.15.0297", "https://journals.sagepub.com/doi/10.1177/00222429221082977", "https://www.ama.org/marketing-news/causal-inference-with-quasi-experimental-data/", "https://pubsonline.informs.org/doi/10.1287/mksc.2016.0998", "https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=4197"]
revisor: "Harpya · revisão conceitual e aritmética"
revisado_em: "2026-11-06"
---

## O problema começa na decisão

Um relatório de marketing pode estar correto sobre os contatos registrados e ainda ser insuficiente para decidir um investimento. Distribuir crédito entre interações observadas e estimar o que muda quando uma ação é realizada são tarefas distintas. Nesta análise autoral do Harpya, atribuição designa uma regra ou modelo de distribuição de crédito; incrementalidade designa a diferença esperada entre alternativas de intervenção bem definidas.

A decisão deve aparecer antes da métrica: manter uma campanha, ampliar seu orçamento, trocar a mensagem ou substituir um canal? Cada alternativa define um contraste. Desabilitar uma campanha de retargeting, por exemplo, não é a mesma intervenção que retirar toda a publicidade. Misturar essas perguntas permite que um único número pareça responder a problemas diferentes.

## O mecanismo de seleção

Pessoas mais próximas da compra podem procurar a marca e se tornar elegíveis a anúncios. A entrega também depende de acesso à plataforma, orçamento e oportunidades de exibição. Comparar expostos e não expostos pode reunir populações com propensões distintas. A sequência contato–compra, isoladamente, não separa essas diferenças do efeito da ação.

Gordon e colegas relatam, no resumo de seu estudo, divergências frequentes entre abordagens observacionais e resultados experimentais no contexto analisado. Essa evidência deve conservar seu alcance. Não estamos reproduzindo seus modelos, nem afirmando que todo ajuste falha. A advertência é que uma base detalhada e um ajuste aparentemente preciso não tornam, por si sós, a exposição comparável a um sorteio.

## O que o sorteio precisa preservar

Um ensaio randomizado define elegibilidade e grupos antes da entrega. Sua comparação principal pode ser entre habilitar e suprimir a campanha, conservando os participantes nos grupos originalmente sorteados. Comparar apenas quem recebeu uma impressão com o controle inteiro muda a pergunta e pode reintroduzir seleção. Sorteio e exposição realizada não são a mesma variável.

O resumo de Ghost Ads descreve uma metodologia para identificar contrapartes de controle de consumidores expostos. A existência dessa solução especializada não transforma qualquer lista de não expostos em controle válido. Implementação, entrega e comparação precisam ser compatíveis. Aqui, citamos o propósito metodológico do artigo, sem reivindicar leitura integral ou capacidade de executar sua infraestrutura.

## Precisão e alcance do resultado

A amostra deve permitir distinguir efeitos que mudariam a decisão. O resumo de Johnson, Lewis e Reiley mostra que escolhas de desenho podem melhorar precisão de maneira diferente da simples adição de covariáveis. Não extraímos dele uma quantidade universal de usuários. Planejamento real deve considerar variabilidade, alocação e efeito de interesse.

Também convém separar o efeito médio do público estudado da escolha para cada segmento. O manuscrito MIT sobre morphing discute heterogeneidade e adaptação. Um resultado médio positivo não informa automaticamente a melhor mensagem para toda pessoa, nem autoriza extrapolar para outro orçamento. Essa passagem exige outra pergunta e evidência correspondente.

## Quase experimentos: a comparação exige uma história convincente

Quando o sorteio não existe, um quase experimento busca variação que sustente uma comparação causal. Goldfarb, Tucker e Wang enfatizam explicitar de onde vem essa variação e por que explicações concorrentes seriam menos plausíveis. O nome de um método não substitui o conhecimento do contexto. Placebos e verificações de robustez podem revelar fragilidades; não provam todas as hipóteses.

Em diferenças em diferenças, comparam-se mudanças de grupos ao longo do tempo. O texto institucional de Li e colegas ressalta a hipótese de trajetórias paralelas na ausência da intervenção e riscos de interferência. Tendências anteriores ajudam a avaliar plausibilidade, mas não tornam observável o futuro sem tratamento. Uma mudança simultânea de preço ou estoque pode comprometer a comparação.

Como exemplo lógico próprio, se uma região aumenta 80 vendas e o controle aumenta 50, a diferença de mudanças é 30. A aritmética não estabelece a causa. Precisamos justificar por que a região tratada teria acompanhado a mudança do controle sem a ação estudada. Um choque exclusivo de demanda fornece uma explicação alternativa para os mesmos números.

## Economia: converter a estimativa em contribuição

Retomemos um exercício totalmente hipotético, sem dados empresariais: 10 mil pessoas por grupo, com 1.200 compradores na campanha habilitada e 1.000 no controle. Cada pessoa faz no máximo uma compra. A estimativa é de 200 compradores adicionais. Suponha contribuição unitária de R\$60, já descontados os custos variáveis pertinentes, e gasto incremental de mídia de R\$8 mil.

Nesse cenário simplificado, a contribuição adicional estimada é 200 × R\$60 = R\$12 mil; após a mídia, restam R\$4 mil. Se o ticket for R\$200, a receita incremental estimada será R\$40 mil e a razão receita incremental/mídia será 5. Contar as 1.200 compras como incrementais produziria R\$240 mil e uma razão de 30, respondendo outra pergunta.

O equilíbrio econômico exige aproximadamente 133,33 compras adicionais, pois R\$8 mil ÷ R\$60 = 133,33. Em contagens inteiras, 134 superariam esse custo sob as mesmas premissas. A análise real deve incorporar custos e horizontes adequados, sem somar receitas futuras imaginadas para tornar uma decisão favorável.

## Uma estimativa favorável pode ser insuficiente para decidir

Sob independência entre pessoas e aproximação normal para duas proporções, o exemplo fornece intervalo aproximado de 95% entre 1,13 e 2,87 pontos percentuais para a diferença. O ponto de equilíbrio corresponde a 1,33 ponto percentual. Portanto, o intervalo ilustrativo inclui efeitos abaixo do equilíbrio e acima dele. A estimativa central positiva não elimina a incerteza econômica.

Esse cálculo é didático, não uma análise de dados reais. Dependência entre unidades, sorteio por regiões, várias análises ou uma distribuição diferente do resultado exigiriam outro tratamento. O valor de aprender mais deve ser considerado junto ao custo e ao prazo da decisão.

## Checklist interpretativo

Antes de agir, nossa sequência editorial é verificar: qual decisão está em jogo; qual intervenção e alternativa foram comparadas; quem era elegível; como os grupos foram formados; e se o resultado usa os denominadores originais. Depois, examinar janela, dados ausentes, ações concomitantes e explicações concorrentes.

Por fim, registrar a precisão, as premissas que a sustentam, o público ao qual a estimativa se aplica e a contribuição econômica compatível com a decisão. A conclusão deve caber nesse alcance. Um resultado local informa uma escolha localizada; não certifica um canal para sempre. Essa sequência é uma síntese autoral de interpretação, não um protocolo já executado pelo Harpya.

## Referências e alcance da consulta

- [Gordon, Zettelmeyer, Bhargava e Chapsky — comparação de métodos de mensuração publicitária (2019)](https://pubsonline.informs.org/doi/10.1287/mksc.2018.1135). 2026-11-06 Não houve leitura integral do artigo nem dos suplementos. Resumo descreve 15 experimentos dos EUA numa plataforma; dois autores tinham afiliação Facebook. Não generalizar o resultado a toda mídia ou campanha.

- [Johnson, Lewis e Nubbemeyer — desenho com ghost ads (2017)](https://journals.sagepub.com/doi/10.1509/jmr.15.0297). 2026-11-06 Artigo restrito; não lido integralmente. A menção descreve o propósito metodológico de identificar contrapartes no controle, sem instrução de implementação nem reprodução de estimativas.

- [Goldfarb, Tucker e Wang — pesquisa com quase experimentos (2022)](https://journals.sagepub.com/doi/10.1177/00222429221082977). 2026-11-06 Leitura parcial explicitamente delimitada; não revisão integral de métodos ou aplicações. Não tratar testes de robustez como prova das hipóteses não observáveis.

- [Li, Luo e Pattabhiramaiah — inferência com dados quase experimentais (2024)](https://www.ama.org/marketing-news/causal-inference-with-quasi-experimental-data/). 2026-11-06 Síntese metodológica institucional, não experimento de campanha. A consulta de suas referências não significa leitura dos artigos nelas citados.

- [Johnson, Lewis e Reiley — dados e precisão em experimentos publicitários (online 2016; fascículo 2017)](https://pubsonline.informs.org/doi/10.1287/mksc.2016.0998). 2026-11-06 Sem leitura integral ou reanálise dos dados. Um estudo específico não oferece um tamanho universal de amostra nem garante precisão semelhante em outra campanha.

- [Liberali, Hauser e Urban — experimentação e heterogeneidade (versão de 2016)](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=4197). 2026-11-06 Leitura parcial; não alegar aplicação do algoritmo ou reprodução de seus resultados. Média experimental e personalização por segmento são problemas distintos.
