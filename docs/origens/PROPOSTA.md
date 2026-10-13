# Proposta estética: Origens

A página passa a funcionar como um atlas editorial da inteligência artificial: uma abertura com presença visual, quatro entradas claras por era e um percurso que alterna os marcos conhecidos com as fundações menos visíveis.

## Direção visual revisada

Revisão pedida pelo usuário: mais organicidade e detalhes coloridos, com redução da aparência artificial.

- Fundo quente de papel, com textura discreta na abertura.
- Três retratos do acervo em composição assimétrica, pequenas inclinações e legendas com nomes, datas e contribuições. A atribuição permanece na galeria, acessível por link junto aos retratos.
- Azul, verde, terracota e ameixa identificam as quatro eras, em marcadores e pequenos fundos de cor. O contraste de dez pares de texto/fundo foi calculado, todos com pelo menos 4,5:1; isso não substitui auditoria completa de acessibilidade.
- Título direto: “Origens da inteligência artificial”. Menos slogans, rótulos, setas e títulos duplicados.
- Navegação por eras em colunas abertas e linha do tempo com fluxo contínuo. Quatro marcos recebem fundo colorido: 1943, 2013, 2017 e 2022.
- Capítulos em uma coluna de leitura, equações separadas e fontes expansíveis.
- Galeria com pequenos retratos ao lado das biografias, sem cards repetidos. No mobile, os personagens seguem em uma coluna.

Os estilos pertencem exclusivamente ao contêiner de Origens. A home, os vídeos, o painel e as outras páginas não recebem o novo CSS.

## Conteúdo integrado

O texto “A Odisseia da Cognição Sintética” foi incorporado como 21 aprofundamentos de 1943 a 2026. GPT-3/RAG/leis de escala (2020) e RoPE (2021) têm entradas separadas, assim como já ocorre na cronologia original. Todos os temas das quatro partes estão presentes. As eras existentes foram mantidas para compatibilidade com os 34 eventos e os cinco capítulos.

A integração faz uma revisão editorial de precisão: Dartmouth distingue proposta de 1955 e encontro de 1956; retropropagação distingue antecedentes e popularização; LSTM distingue o portão de esquecimento posterior; word2vec apresenta analogias como regularidades empíricas; Transformer distingue treino paralelo e geração sequencial; RAG não promete eliminar alucinações; RoPE não é geometria fractal; Matryoshka depende de treinamento específico; disponibilidade de pesos não equivale a licença irrestrita; RaBitQ não conserva distâncias exatas.

O marco de 2025 inclui o debate publicado em 2026. A atualização impede tratar capacidade geométrica, margem e aprendibilidade como uma impossibilidade universal do vetor único. Uma frase correspondente no capítulo sobre ColBERT foi qualificada. As fontes estão junto aos aprofundamentos e também na versão Markdown.

A moldura histórica do anexo foi mantida, com substituição de superlativos, atribuições absolutas e metáforas apresentadas como prova por explicações verificáveis. Não foi feita uma auditoria histórica exaustiva de todas as fontes originais dos cinco capítulos.

## Isolamento e revisão

Branch: `design/origens-atlas-editorial`, criada sobre `main` em `faadada54b2fe62e86ed1418d8fbc4dcae005ba6`. A branch `prototipo/origens` e a `main` não são alteradas por esta proposta.

A versão está pronta para avaliação de conteúdo e estética. Não há merge nem solicitação de publicação em produção. Para experimentar no checkout: `npm ci`, `npm run dev`, abrir `/origens/`.

## Validação executada

| Sensor | Resultado |
|---|---|
| `npm run check` | 64 arquivos, zero erros, avisos ou hints |
| `npm run build` | 27 páginas geradas |
| `python3 scripts/validar_cms.py` | Painel e coleções coerentes |
| Inspeção do HTML/Markdown gerado | 34 eventos, 21 aprofundamentos, cinco capítulos, 12 personagens, 149 links locais conferidos, 39 âncoras antigas preservadas, nenhum erro KaTeX |
| Script da página compilado executado em jsdom | 11 verificações, incluindo busca, filtros, vazio, reset, recuperação de âncora e conteúdo sem JavaScript |
| `git diff --check` | Sem erros de whitespace |

**Limite:** jsdom verifica o DOM e as interações, mas não renderiza layout. A revisão visual em navegador, o contraste medido e os testes reais de viewport/teclado continuam pendentes: a capacidade suportada de controle de navegador não está disponível neste ambiente. Não há capturas ou declaração de aceite visual. O QA de navegador existente pode ser executado depois com `scripts/qa_redesign.py`.

Os arquivos `QA_ESTRUTURAL.json` e `QA_INTERACOES.json` registram os resultados. A reversão consiste em abandonar a branch ou reverter seu commit.
