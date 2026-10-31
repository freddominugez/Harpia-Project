# Painel de conteúdo (/admin)

Endereço: **https://www.harpya.org/admin/**

O painel é o [Sveltia CMS](https://github.com/sveltia/sveltia-cms) 0.256.1, uma biblioteca pública e gratuita que roda inteira no navegador. Não há banco: o único código no servidor são duas funções pequenas que fazem o login pelo GitHub. Cada alteração vira um commit no repositório `freddominugez/Harpia-Project`, e a Vercel publica o site sozinha depois do commit.

| Arquivo | Para que serve |
|---|---|
| `public/admin/index.html` | Carrega o Sveltia (versão fixa, via unpkg) e marca a página como `noindex` |
| `scripts/cms-config.fonte.yml` | Fonte editável da configuração (com âncoras YAML para não repetir campos) |
| `public/admin/config.yml` | Configuração gerada a partir da fonte. Não edite à mão |
| `scripts/gerar_config_cms.py` | Gera `config.yml` a partir da fonte |
| `scripts/validar_cms.py` | Confere que todo campo dos arquivos de conteúdo existe no painel e vice-versa |
| `api/_oauth.js`, `api/auth.js`, `api/callback.js` | Login por e-mail e senha ou pelo GitHub (funções da Vercel em `/auth` e `/callback`) |
| `scripts/gerar_hash_senha.mjs` | Gera o hash da senha do painel |

O painel não é indexado: meta `noindex`, cabeçalho `X-Robots-Tag: noindex, nofollow` (em `vercel.json`) e `Disallow: /admin/` no `robots.txt`.

## Entrar com e-mail e senha

Quando as três variáveis abaixo existem na Vercel, o botão **Sign In with GitHub** abre uma tela própria do Harpya pedindo e-mail e senha. Se baterem, o painel recebe o token do GitHub guardado no servidor e entra direto.

| Variável (Vercel, ambiente Production) | Valor |
|---|---|
| `ADMIN_EMAIL` | o e-mail autorizado (maiúsculas não importam) |
| `ADMIN_PASSWORD_HASH` | o hash da senha, gerado por `node scripts/gerar_hash_senha.mjs` (a senha é digitada sem aparecer na tela). Marque como **Sensitive** |
| `GITHUB_CMS_TOKEN` | token *fine-grained* do GitHub só para `freddominugez/Harpia-Project`, com **Contents** e **Pull requests** em leitura e escrita. Marque como **Sensitive** |

A senha em texto nunca vai para o repositório nem para a Vercel: só o hash scrypt. Erro de e-mail ou senha leva 1 segundo para responder (freio contra tentativas em sequência), e o formulário só aceita envio vindo de `harpya.org`. Depois de criar ou trocar uma variável, faça **Redeploy**.

Para trocar a senha: gere um hash novo e substitua `ADMIN_PASSWORD_HASH`. Para cortar o acesso: apague `GITHUB_CMS_TOKEN` na Vercel e revogue o token no GitHub. Sem as três variáveis, o login volta a ser pelo GitHub, descrito a seguir.

## Entrar pelo GitHub

Em https://www.harpya.org/admin/, clique em **Sign In with GitHub** e entre com a sua conta do GitHub (e-mail, senha e verificação em duas etapas do próprio GitHub). Na primeira vez, o GitHub pergunta se autoriza o app "Harpya painel": clique em **Authorize**. Trocar a senha ou ativar a verificação em duas etapas se faz no GitHub, em https://github.com/settings/security.

Só consegue publicar quem tem permissão de escrita no repositório `freddominugez/Harpia-Project`. Outra pessoa até entra, mas o GitHub recusa qualquer gravação.

### Como funciona

| Peça | Onde |
|---|---|
| Botão "Sign In with GitHub" | Sveltia, com `base_url: https://www.harpya.org` e `auth_scope: public_repo` no `config.yml` |
| Ida ao GitHub (`/auth`) e volta (`/callback`) | Funções da Vercel `api/auth.js` e `api/callback.js` (código em `api/_oauth.js`), ligadas pelas `rewrites` do `vercel.json` |
| Credenciais do app | Variáveis de ambiente `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` na Vercel. Nunca no repositório |

Proteções: o pedido de login leva um valor aleatório guardado em cookie `HttpOnly` por 10 minutos e conferido na volta (contra CSRF); o token só é entregue a uma janela aberta por `https://www.harpya.org` ou `https://harpya.org`; o escopo pedido ao GitHub é o mínimo para repositório público (`public_repo`).

### Configuração única (só o dono da conta faz)

1. **Criar o OAuth App no GitHub.** Abra https://github.com/settings/applications/new e preencha:
   - **Application name:** `Harpya painel`
   - **Homepage URL:** `https://www.harpya.org`
   - **Application description:** `Login do painel de conteúdo do Harpya` (opcional)
   - **Authorization callback URL:** `https://www.harpya.org/callback`
   - **Enable Device Flow:** deixe desmarcado
   
   Clique em **Register application**. Na página do app, copie o **Client ID** e clique em **Generate a new client secret**; copie o segredo na hora (o GitHub não mostra de novo).
2. **Guardar as credenciais na Vercel.** Projeto do Harpya → **Settings → Environment Variables**. Crie duas variáveis, marcando o ambiente **Production**:
   - `GITHUB_CLIENT_ID` = o Client ID
   - `GITHUB_CLIENT_SECRET` = o client secret (marque como **Sensitive**)
3. **Publicar de novo.** Variável nova só vale para deploys novos: em **Deployments**, no deploy mais recente de produção, menu **⋯ → Redeploy**.
4. **Testar.** Abra https://www.harpya.org/admin/ numa janela anônima e clique em **Sign In with GitHub**.

Enquanto as duas variáveis não existirem, o botão abre uma janela com o aviso "Login pelo GitHub ainda não configurado". O resto do site não é afetado.

### Revogar acesso

- **Tirar o acesso de uma sessão aberta:** https://github.com/settings/applications → aba **Authorized OAuth Apps** → **Harpya painel** → **Revoke**. O próximo login pede autorização de novo.
- **Trocar o segredo do app** (se vazar): na página do OAuth App, **Generate a new client secret**, apague o antigo, atualize `GITHUB_CLIENT_SECRET` na Vercel e faça **Redeploy**.

### Alternativa: token de acesso

O botão **Sign In Using Access Token** continua disponível. Crie um token *fine-grained* em https://github.com/settings/personal-access-tokens/new, só para `freddominugez/Harpia-Project`, com **Contents** e **Pull requests** em leitura e escrita, e cole no painel. O token fica só no armazenamento local do navegador; **Sign Out** apaga.

## Coleções

### Anúncios e contador de visualizações

Abra **Anúncios** nas ferramentas do painel ou
https://www.harpya.org/admin/anuncios/. Escolha uma das três posições: banner
superior, lateral esquerda ou lateral direita. Os três cartões mostram o anunciante,
o estado e a imagem de cada posição. Clique para editar. Edite anunciante, título, texto,
link HTTPS e imagem. Você pode enviar PNG, JPG ou WebP de até 2 MB ou informar uma
imagem por endereço HTTPS. O upload aceita arrastar e soltar com FilePond 4.32.12
(licença MIT), hospedado localmente em `public/admin/anuncios/vendor/`, sem
serviço externo de upload. A licença original acompanha a distribuição.
Preencha a descrição da imagem para acessibilidade. As peças prontas ocupam
o espaço inteiro, com proporção preservada e sem repetir texto sobre a arte.

**Publicar anúncio** grava imagem e configuração juntas, em um único commit em
`main`. **Salvar como rascunho** e **Retirar anúncio do site** deixam a posição
com o aviso “Seu anúncio aqui”. A hospedagem processa a alteração antes de
atualizar o site. A tela confere o SHA do arquivo e preserva atualizações
concorrentes. Anúncios também estão disponíveis na coleção do CMS, que segue o
Workflow quando usada pelo editor padrão.

O contador público conta visualizações, não pessoas únicas, a partir da data
informada no rodapé. Não há números históricos inventados. O endpoint
`api/visitas.js` usa as funções do banco em `docs/sql/harpya_views.sql`, no esquema
isolado `harpya_stats` do projeto Supabase By Vulcan. As tabelas privadas têm RLS
e nenhum acesso direto por visitantes; as funções públicas são invocadoras e
as rotinas privilegiadas ficam no esquema privado. A gravação exige uma chave
aleatória do servidor, cujo hash é guardado no banco. A leitura só expõe total
e data inicial.

Configure `HARPYA_STATS_URL`, `HARPYA_STATS_KEY` e `HARPYA_STATS_SECRET` na Vercel.
Nunca grave a chave secreta no repositório. O rate limit usa HMAC diário do IP,
sem guardá-lo em texto, e permite até 30 eventos por minuto por chave. Eventos
repetidos usam o mesmo UUID e não aumentam a contagem. Identificadores técnicos
são eliminados após sete dias, na próxima atualização do contador. Contagens são aproximadas: robôs disfarçados,
bloqueadores e falhas de rede podem alterar os números.

Em **Divulgação**, https://www.harpya.org/admin/divulgacao/, há uma pesquisa com
fontes oficiais, regras dos canais e proposta de automação com revisão. Nenhum
envio a comunidades externas é disparado por essa ferramenta.

| Coleção | Pasta | O que é |
|---|---|---|
| Caminhos | `src/content/caminhos/*.md` | As fichas dos 12 caminhos (markdown com LaTeX) |
| Pautas do fórum | `src/content/pautas/*.md` | Propostas de discussão, com status |
| Vídeos | `src/content/videos/<ID>.json` | Catálogo de vídeos (filtros por status e origem, grupos por módulo) |
| Módulos de vídeo | `src/content/modulos/` | Os 12 módulos do catálogo |
| Artigos, Livros, Fontes | `src/content/{artigos,livros,fontes}/` | Biblioteca |
| Linha do tempo, Aprendizado | `src/content/{linha-do-tempo,aprendizado}/` | Origens e Aprendizado de Máquina |
| Fontes monitoradas | `src/content/fontes-monitoradas/` | Sites e canais que a curadoria diária lê |
| Feeds de news | `src/content/feeds/` | Feeds do robô de news (a cada 6 horas) |
| NotícIAs | `src/content/noticias/*.json` | Matérias curtas com fontes. A tarefa "Harpya · NotícIAs" grava como rascunho a cada dois dias (ver `docs/TAREFA_NOTICIAS.md`) |
| Páginas de texto | `sobre.md`, `glossario.md`, `arquivados.md`, `equacoes.md` | Textos longos |

Todo item curado tem `status` (rascunho ou publicado), `origem` (manual ou curadoria diária), `adicionado_em`, `verificado_em` e `ordem`. **Rascunho não aparece em nenhuma página, busca, sitemap, RSS ou llms.txt.**

O esquema em `src/content.config.ts` é a trava de qualidade: item fora do formato (ID de vídeo sem 11 caracteres, nível fora da lista, data fora de AAAA-MM-DD, URL sem `http`) quebra o build, e a Vercel mantém no ar a versão anterior.

## Fluxo editorial

O painel está em `publish_mode: editorial_workflow`. Toda alteração feita por ele passa por três colunas na aba **Workflow**:

1. **Draft (rascunho):** a alteração fica num branch próprio (`cms/...`), fora do site.
2. **In Review:** abre um pull request no GitHub. O build da Vercel gera uma prévia do site com a alteração.
3. **Ready → Publish:** o pull request é incorporado a `main` e o site é publicado em cerca de um minuto.

## Revisar a curadoria diária

### Publicar vários rascunhos de uma vez

No painel, clique em **Publicar conteúdos** (canto inferior direito), ou abra
https://www.harpya.org/admin/publicar/. A tela reutiliza o login do painel; se a
sessão não estiver disponível, oferece o mesmo login por e-mail e senha.

1. Escolha a coleção (NotícIAs, Vídeos, Artigos, Livros, Fontes, Linha do tempo ou Aprendizado).
2. Marque os rascunhos revisados, individualmente ou usando **Marcar todos os rascunhos**.
3. Clique em **Publicar selecionados** e confira os títulos na confirmação.
4. Clique em **Confirmar publicação**. A tela altera somente o `status` dos itens
   selecionados para `publicado`, em um único commit em `main`. A Vercel processa
   o commit antes de atualizar o site.

Essa ação publica os rascunhos já salvos no catálogo de `main`; alterações ainda
em revisão no Workflow continuam seguindo o fluxo editorial. Se um item mudar
desde o carregamento da lista, a publicação é interrompida para nova revisão.
Uma atualização concorrente de `main` faz o painel reler a versão atual e
tentar novamente, até três tentativas, sem sobrescrever o trabalho de outra
pessoa. Os itens selecionados são conferidos novamente a cada tentativa. As
leituras do GitHub não usam o cache do navegador, inclusive ao publicar duas
coleções em sequência. Erros de envio exigem atualizar a lista para conferir
o estado antes de tentar de novo.

Verificações da seleção e da preservação do conteúdo:
`node --test scripts/test_publicacao.mjs`.

A tela confere a permissão de gravação antes de habilitar a publicação. Essa
verificação usa a mesma árvore de arquivos existente e não cria commit nem
altera `main`. Se o GitHub responder `Resource not accessible by personal access
token`, edite o token em https://github.com/settings/personal-access-tokens e
defina **Contents: Read and write** para `Harpia-Project`. Salve e clique em
**Atualizar lista**. A permissão de escrita da conta, isoladamente, não garante
que o token também tenha acesso de escrita.

A tarefa agendada (ver `docs/TAREFA_CURADORIA.md`) grava direto em `main`, sempre como **rascunho**, e anota tudo em `curadoria/registro/AAAA-MM-DD.md`.

1. No painel, abra **Vídeos** (ou **Artigos**) e use o filtro **Rascunhos** (ou **Da curadoria diária**).
2. Abra o item, confira título, canal, módulo, nível e resumo. Corrija o que quiser.
3. Troque **Status** para **Publicado** e salve. A alteração segue o fluxo editorial acima.
4. Item que não deve entrar: apague pelo painel (botão **Delete**). Como a URL já está no registro do dia, a curadoria não volta a propor.

## Revisar as NotícIAs

1. Abra **NotícIAs** e use o filtro **Rascunhos**.
2. Confira o texto contra as fontes listadas na própria matéria e corrija o que quiser.
3. Troque **Status** para **Publicado** e salve. A matéria entra no card da home, na página `/noticias/`, no sitemap, no RSS e na busca.
4. Para recusar, apague pelo painel. A URL fica em `curadoria/noticias/` e a tarefa não volta a propor.

## Aprovar pautas e criar discussões

1. Abra **Pautas do fórum**. As da curadoria chegam com status **Proposta** e não aparecem no site.
2. Para abrir a discussão: mude o status para **Aprovada** e publique.
3. A automação `.github/workflows/discussoes.yml` roda quando a pauta chega em `main`: cria a discussão no GitHub Discussions, na categoria da pauta, grava o endereço em **Link da discussão** e muda o status para **Criada**. A home e o fórum mostram as discussões reais primeiro.
4. Para recusar: status **Descartada**.

Requisito único no GitHub (uma vez): **Settings → Actions → General → Workflow permissions**. O arquivo da automação já pede `discussions: write` e `contents: write`; se a conta estiver configurada para negar escrita a qualquer workflow, marque **Read and write permissions** e salve.

## Pausar a curadoria

- **Um dia ou mais:** desative a tarefa "Harpya · curadoria diária" na lista de tarefas agendadas do Claude.
- **Uma fonte:** em **Fontes monitoradas**, desmarque **Ativo**.

## Mudar a configuração do painel

```bash
# edite scripts/cms-config.fonte.yml e depois:
python3 scripts/gerar_config_cms.py
python3 scripts/validar_cms.py
```

Campo novo num esquema de `src/content.config.ts` precisa entrar também na fonte do painel; o `validar_cms.py` acusa a diferença, e o workflow `build` roda essa validação em cada push.

## Testar o painel no computador

O Sveltia só roda em HTTPS ou em `localhost`:

```bash
npm run build && npx astro preview   # http://localhost:4321/admin/
```
