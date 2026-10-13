# Origens: atlas editorial

Pedido autorizado em 12/10/2026: ler /origens/ integralmente, melhorar a apresentação, incorporar o texto anexado e trabalhar em branch separada devido a trabalho concorrente.

Base: main, faadada54b2fe62e86ed1418d8fbc4dcae005ba6.
Branch: design/origens-atlas-editorial.
Arquitetura: NO_DECISION_NEEDED. Manter Astro estático, KaTeX e ativos existentes. Execução serial.

## Aceite e sensores

1. Verde: preservar os 34 eventos, cinco capítulos, 12 personagens, equações, créditos e âncoras existentes. Sensor: inspeção do HTML gerado e comparação dos dados com a base.
2. Verde: incorporar todos os assuntos do anexo em 21 aprofundamentos, distinguindo metáforas e fatos, com fontes e correções explícitas. Sensor: revisão editorial, cobertura por ano e HTML/Markdown.
3. Amarela: implementar pesquisa/filtros acessíveis, resultado vazio e navegação por eras. Sensor: astro check, build, validação estática; teste de navegador se a capacidade de controle suportada estiver disponível.
4. Verde: limitar estilos à página e preservar arquivos das demais seções. Sensor: diff, arquivos compartilhados limitados à integração do conteúdo de Origens.
5. Verde: commit e publicação apenas na branch; apresentar para revisão, sem merge ou deploy de produção. Sensor: ref remota e comparação com base.

Escrita: src/pages/origens.astro, src/styles/origens-atlas.css, src/data/origens-aprofundamentos.ts, src/data/origens.ts (uma qualificação editorial sobre ColBERT e o debate de 2025/2026), src/lib/rotas.ts (apenas Origens), docs/origens/.
Fora de escopo: home, admin, robôs, autenticação, infraestrutura, dependências e alteração da main.
Orçamento: duas rodadas de correção guiadas por evidência.
Rollback: abandonar esta branch ou reverter o commit; nenhuma migração ou mudança de dados persistentes.

## Revisão autorizada em 12/10/2026

O usuário considerou a proposta visual excessivamente artificial e pediu mais organicidade e alguns detalhes coloridos. Escopo: nova composição com retratos do acervo, fundo de papel, acentos azul/verde/terracota/ameixa, menos caixas repetidas e rótulos mais simples. Manter conteúdo, IDs e interações. Sensores: build, tipos, DOM e conferência estrutural; aceite visual pendente enquanto não houver controle de navegador suportado. Permanecer na mesma branch local; a autorização de publicação remota continua pendente.
