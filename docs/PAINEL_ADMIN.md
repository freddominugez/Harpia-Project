# Painel de conteúdo (/admin)

Endereço: **https://www.harpya.org/admin/**

O painel é o [Sveltia CMS](https://github.com/sveltia/sveltia-cms) 0.221.8, uma biblioteca pública e gratuita que roda inteira no navegador. Não há servidor nem banco: cada alteração vira um commit no repositório `freddominugez/Harpia-Project`, e a Vercel publica o site sozinha depois do commit.

| Arquivo | Para que serve |
|---|---|
| `public/admin/index.html` | Carrega o Sveltia (versão fixa, via unpkg) e marca a página como `noindex` |
| `scripts/cms-config.fonte.yml` | Fonte editável da configuração (com âncoras YAML para não repetir campos) |
| `public/admin/config.yml` | Configuração gerada a partir da fonte. Não edite à mão |
| `scripts/gerar_config_cms.py` | Gera `config.yml` a partir da fonte |
| `scripts/validar_cms.py` | Confere que todo campo dos arquivos de conteúdo existe no painel e vice-versa |

O painel não é indexado: meta `noindex`, cabeçalho `X-Robots-Tag: noindex, nofollow` (em `vercel.json`) e `Disallow: /admin/` no `robots.txt`.

## Entrar

O login é por **token de acesso do GitHub**. Não há senha do site nem servidor de OAuth.

1. Abra https://github.com/settings/personal-access-tokens/new (token *fine-grained*).
2. **Token name:** `Harpya painel`. **Expiration:** 90 dias.
3. **Repository access:** *Only select repositories* e escolha `freddominugez/Harpia-Project`.
4. **Permissions → Repository permissions:**
   - **Contents:** Read and write
   - **Pull requests:** Read and write (o fluxo editorial usa pull requests)
   - **Metadata:** Read-only (já vem marcado)
5. Clique em **Generate token** e copie o valor.
6. Em https://www.harpya.org/admin/, clique em **Sign In Using Access Token** (não use "Sign In with GitHub", que exige um servidor de OAuth que o site não tem) e cole o token.

O token fica só no armazenamento local do seu navegador. Não o coloque em arquivo do repositório, e-mail ou conversa. Para sair, use o menu do avatar → **Sign Out**, que apaga o token do navegador.

### Renovar ou revogar

- Perto do vencimento, o GitHub avisa por e-mail. Gere outro token com as mesmas permissões, saia do painel e entre de novo com o novo.
- Se o token vazar: https://github.com/settings/personal-access-tokens → o token → **Revoke**. Nada mais no site depende dele.

## Coleções

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
| Páginas de texto | `sobre.md`, `glossario.md`, `arquivados.md`, `equacoes.md` | Textos longos |

Todo item curado tem `status` (rascunho ou publicado), `origem` (manual ou curadoria diária), `adicionado_em`, `verificado_em` e `ordem`. **Rascunho não aparece em nenhuma página, busca, sitemap, RSS ou llms.txt.**

O esquema em `src/content.config.ts` é a trava de qualidade: item fora do formato (ID de vídeo sem 11 caracteres, nível fora da lista, data fora de AAAA-MM-DD, URL sem `http`) quebra o build, e a Vercel mantém no ar a versão anterior.

## Fluxo editorial

O painel está em `publish_mode: editorial_workflow`. Toda alteração feita por ele passa por três colunas na aba **Workflow**:

1. **Draft (rascunho):** a alteração fica num branch próprio (`cms/...`), fora do site.
2. **In Review:** abre um pull request no GitHub. O build da Vercel gera uma prévia do site com a alteração.
3. **Ready → Publish:** o pull request é incorporado a `main` e o site é publicado em cerca de um minuto.

## Revisar a curadoria diária

A tarefa agendada (ver `docs/TAREFA_CURADORIA.md`) grava direto em `main`, sempre como **rascunho**, e anota tudo em `curadoria/registro/AAAA-MM-DD.md`.

1. No painel, abra **Vídeos** (ou **Artigos**) e use o filtro **Rascunhos** (ou **Da curadoria diária**).
2. Abra o item, confira título, canal, módulo, nível e resumo. Corrija o que quiser.
3. Troque **Status** para **Publicado** e salve. A alteração segue o fluxo editorial acima.
4. Item que não deve entrar: apague pelo painel (botão **Delete**). Como a URL já está no registro do dia, a curadoria não volta a propor.

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
