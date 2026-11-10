# Harpya Business: primeira construção

Publicado em 06/11/2026 em https://www.harpya.org/. Entrega de produção: `34ab18fd8dd0f37ca00ac48669326d924bde3ccc`, projeto Vercel `harpia-project`, equipe By Vulcan.

## Entrada e identidade

A raiz `/` apresenta dois grandes cards. O primeiro, em sépia, abre `/tecnologia/`, que preserva a composição e o conteúdo da home anterior. O segundo, em azul translúcido, abre `/business/`. As páginas técnicas existentes mantêm seus endereços.

As duas ilustrações em `public/img/ambientes/` foram geradas a partir da harpia original: repouso com asas fechadas para Tecnologia e Matemática; asas abertas para Business. Mantêm a linguagem geométrica de grafite e dourado. O arquivo original do logo não foi alterado.

A pergunta de preferência aparece ao entrar no ambiente sem um padrão salvo. A resposta afirmativa grava `harpya.ambiente.v1` no armazenamento local do navegador. A recusa não grava uma preferência. A sessão evita repetir a pergunta no mesmo ambiente. O encaminhamento automático ocorre somente na raiz. `/?ambientes=1` permite trocar de ambiente; o botão de redefinição permite escolher outro padrão. Os links diretos nunca são redirecionados pela preferência. Sem JavaScript, os cards continuam sendo links normais.

## Estrutura construída

Há 39 páginas Business: 17 páginas de seção, oito guias e 14 fichas de leituras, incluindo oito livros. As seções incluem home, Começando, Origens, Aprendizado, Estudos, Vídeos, Canais, Biblioteca, Livros, Fontes, Glossário, Métricas, Análises, Notícias, Radar, Fórum e Sobre. Existem busca, RSS, sitemap, llms.txt, texto completo, versões Markdown e imagens Open Graph.

As coleções `businessGuias`, `businessFontes` e `businessAcervo` ficam em `src/content/business/`. Os loaders e os índices não se misturam com os técnicos. A biblioteca permite filtrar por texto, trilha, formato e idioma. Vídeos também podem ser filtrados por nível e instituição. As coleções de livros, notícias e análises têm seleção própria; os mesmos registros são usados no HTML e nas versões de texto. Os guias têm índice e navegação em sequência. A busca Business carrega apenas `/business/busca.json`.

O painel `/admin/` passou a incluir as três coleções Business. As seis posições de anúncio estão na coleção Anúncios: as três posições antigas continuam técnicas; `business-topo`, `business-lateral-direita` e `business-lateral-esquerda` são exclusivas do Business e começam em rascunho. O editor rápido de anúncios permite escolher o ambiente e mantém as posições separadas. `/admin/anuncios/?ambiente=business` abre diretamente as posições Business.

O fórum reutiliza o motor existente, com identificação por `/business/forum/`. O Giscus mantém a categoria configurada no projeto e separa as conversas pelo endereço completo; não foi criada uma categoria remota nova. Os temas sugeridos não são apresentados como conversas existentes. A verificação local não envia mensagens ao fórum.

O contador continua sendo geral do portal, explicitado no rodapé. Não foi criada uma contagem separada por ambiente nem alterada a base remota de estatísticas.

## Conteúdo e curadoria

O cadastro aprovado possui 17 fontes de artigos/publicações, oito canais institucionais, oito guias didáticos autorais e 14 referências de leitura com autoria, natureza, idioma, limites e URL do original. Datas originais desconhecidas permanecem vazias; não são inventados mês e dia. Os guias não são apresentados como pesquisa empírica ou promessa de resultados.

A lista de vídeos está em preparação. Um candidato indicado pela própria HBR fica com `status: candidato` e não aparece no site, no feed, na busca ou nas versões para agentes. Publicar um vídeo exige ID, canal institucional aprovado pelo Channel ID e endereço correspondente, revisão integral, palestrante, qualificação, evidências da revisão, justificativa, responsável e data. O player usa youtube-nocookie e só é carregado após clique explícito. Um webinar também exige revisão integral. Coaches, agências de marketing digital, material promocional e afirmações sem base permanecem excluídos.

Notícias tem uma página funcional com estado inicial explícito, sem matérias inventadas. Oito livros foram aprovados pelo usuário e tiveram as fichas bibliográficas conferidas nos catálogos das editoras. Integram a biblioteca, a busca e as exportações com autoria, editora, edição/ISBN quando confirmados, link legal e roteiro de estudo autoral. Essa conferência não é apresentada como revisão integral da obra. Notícias e análises publicadas exigem texto autoral em pelo menos dois parágrafos e referências; o nome de uma fonte não substitui esse conteúdo. A meta inicial de oito livros foi atendida. As metas de 24 leituras externas e 16 vídeos revisados ainda não foram atingidas e não são exibidas como acervo existente.

## Coleta conectada

`python scripts/coletar_business.py` consulta apenas feeds cadastrados em fontes aprovadas. Valida HTTPS, domínio, redirecionamentos, tamanho, data e recorte temático. Remove rastreadores da URL, deduplica e grava somente `curadoria/business/candidatos.json`. Não escreve em `src/content/business/` nem publica candidatos. Falhas preservam os candidatos anteriores válidos da mesma fonte e registram a situação.

Na consulta real desta etapa, a McKinsey respondeu e gerou seis candidatos. O feed de marketing da INSEAD retornou HTTP de erro; não houve tentativa de contornar a restrição. As outras fontes estão conectadas como referências institucionais com seleção manual, sem simular feeds inexistentes.

O workflow `business-curadoria` foi preparado para execução diária e manual. Foi enviado ao GitHub na entrega de produção; a execução diária e manual está configurada no repositório. Sua atualização altera somente a fila de candidatos. A revisão e a publicação continuam pelo CMS. O workflow não publica vídeos automaticamente. `scripts/coletar_business_videos.py` consulta somente canais aprovados para o escopo de vídeos, valida o Channel ID do feed e de cada entrada e grava `curadoria/business/videos-candidatos.json`. Os oito canais agora estão aprovados e habilitados para consulta. A disponibilidade dos feeds é registrada individualmente na fila; aprovação não garante resposta do YouTube. Falhas preservam candidatos válidos do canal; a coleta nunca atribui revisão integral.

## Verificação

- `npm run check` e `npm run build`.
- `node --test scripts/test_ambientes.mjs scripts/test_business_schema.mjs scripts/test_midpage_ad.mjs scripts/test_anuncios.mjs scripts/test_business_admin.mjs`: 27 testes aprovados.
- `python -m unittest discover -s scripts -p 'test_business*.py'`: 13 testes aprovados, sem rede.
- `python scripts/gerar_config_cms.py` e `python scripts/validar_cms.py`: 17 coleções coerentes com os arquivos.
- `node scripts/test_business_build.mjs`: links internos, IDs, títulos principais, canonical, separação dos índices e ausência do vídeo candidato nas páginas públicas.
- Conferência no Safari: cards e artes, entrada Business, diálogo, salvamento, retorno automático, busca própria, filtro da biblioteca e reorganização em largura reduzida por zoom. A etapa local não enviou comentários. Após a publicação, foram conferidos no domínio público os cards, a entrada Business, o diálogo, a biblioteca e o filtro por autoria, sem enviar mensagens ao fórum.

O teste do CMS identificou um campo `lead` já exigido pelo painel e ausente em Sobre. Foi preenchido com a descrição já existente; a página também recebeu a explicação da nova preferência local.

## Rodar e continuar

Use `npm run dev` e abra `http://localhost:4321/?ambientes=1`. Para revisar o build, use `npm run build` e `npm run preview`. Não abra os HTMLs de `dist` diretamente por `file://`, pois os assets utilizam caminhos de site.

Próximas etapas editoriais: ampliar e revisar o acervo de artigos, livros e vídeos; preparar as primeiras notícias; resolver ou substituir o acesso automatizado à INSEAD por um método permitido; verificar navegação e conteúdo em dispositivos móveis; decidir se fórum e métricas precisam de configurações remotas próprias; manter a revisão individual antes de novas publicações. As alterações anteriores do checkout foram preservadas.

## Catálogo aprovado e painel de curadoria

O usuário aprovou na conversa a seleção integral em 06/11/2026. `curadoria/business/catalogo-proposto.json` preserva a lista apresentada, agora com `estado: aprovado`, data, escopo e registro da mensagem de aprovação. As 17 fontes de artigos/publicações e os oito canais estão aprovados. As seis editoras são referências bibliográficas limitadas ao escopo de livros; Harvard Business School participa apenas do escopo de vídeos. São 24 registros institucionais ao todo. A página de revisão atualizada é `docs/propostas/catalogo-business-2026-11-06.html`.

Financial Times, Valor e Meio & Mensagem estão autorizados apenas para jornalismo de mercado, com exclusão de patrocinados. Não são tratados como evidência científica. As condições editoriais constam no CMS e na página de fontes. Consultorias, publicações executivas, pesquisa acadêmica e livros são identificados pela natureza do material.

A ferramenta `/admin/business/`, acessível pela aba Curadoria Business, lê as duas filas, o estado dos feeds e o catálogo no repositório autenticado. O botão de encaminhamento grava somente um candidato na coleção do CMS, em commit sem atualização forçada da branch. Falhas concorrentes não afirmam sucesso. Os links externos e os textos da fila são renderizados sem HTML fornecido pelos feeds. Nenhum candidato foi enviado ao GitHub nos testes locais.

A aprovação de uma fonte ou canal não promove seus itens. Os oito livros receberam revisão bibliográfica nesta etapa; vídeos e novos artigos continuam candidatos até revisão individual. Não há botão de publicação automática na fila.

Após alterações no schema importado, use `npx astro sync --force` se houver cache de conteúdo de uma construção anterior. A construção inclui 39 páginas Business e 99 páginas no projeto inteiro, após integrar as atualizações técnicas recentes do repositório. O relatório `docs/evidencias/harpya-business-qa-2026-11-06.json` registra links, índices, testes e disponibilidade das consultas. A entrega foi publicada e verificada no domínio público; os workflows build e lighthouse passaram no commit de produção.

A consulta real após a ativação respondeu nos oito canais e gerou oito candidatos de vídeo, além dos seis candidatos de artigos da McKinsey. Foi corrigida a leitura do identificador abreviado no cabeçalho Atom do YouTube; o endereço do autor e o ID completo de cada vídeo continuam obrigatórios. Vídeos de divulgação de cursos/programas são excluídos na coleta. Os candidatos não aparecem no HTML, na busca, no RSS ou nas exportações Business.

## Publicação em produção

O commit `34ab18fd8dd0f37ca00ac48669326d924bde3ccc` foi enviado para `main` e publicado pela integração Git existente. Deployment `dpl_8QfAkmbK6RwrBxMArXCCxugmQH4E`, estado READY, domínio https://www.harpya.org/. A entrega foi construída sobre `939e5f7`, preservando notícias, artigos, vídeos e dados técnicos mais recentes. Nenhuma configuração de credenciais, banco ou fórum foi alterada.

Uma instalação limpa identificou que os tipos do Node estavam apenas como peer opcional no lockfile. `@types/node@22.20.5` foi declarado como dependência de desenvolvimento, compatível com Node 22 do projeto. Validação da entrega: 42 verificações Node, 23 testes Python, Astro check sem erros/warnings (quatro hints preexistentes), build de 99 páginas, CMS coerente e 3.647 referências internas verificadas. Build e Lighthouse passaram no GitHub.

Foram conferidas 14 URLs de produção com resposta 200, incluindo portal, Tecnologia, Business, biblioteca, canais, ficha de livro, índices de busca, RSS, sitemap, artes e páginas administrativas. No Safari, clicar no card Business abriu a pergunta de preferência; a biblioteca mostrou oito livros e o filtro “Kotler” encontrou um resultado. Candidatos continuam fora do acervo público.
