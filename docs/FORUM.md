# Fórum próprio (Waline)

O fórum sai do GitHub Discussions (Giscus) e passa a ser do próprio Harpya, para que o repositório possa ser fechado e para que qualquer pessoa entre com **e-mail e senha** ou com a **conta Google**, sem precisar de GitHub.

| Peça | Onde |
|---|---|
| Biblioteca | [Waline](https://waline.js.org), código aberto (MIT): servidor `@waline/vercel` 1.41.6 (com jsdom 26: o runtime da Vercel não aceita `require()` de módulos ESM, de que as versões 1.42 em diante dependem), cliente `@waline/client` 3.15.2 |
| Servidor | Pasta `forum/` deste repositório, publicada como um segundo projeto na Vercel (`harpya-forum`), no endereço **https://forum.harpya.org** |
| Banco | Supabase, projeto "By Vulcan", esquema próprio `harpya` (tabelas `wl_comment`, `wl_counter`, `wl_users`), papel próprio `harpya_forum`, RLS ligado, fora da API pública |
| Login pelo Google | Intermediário próprio em `forum/oauth.js` (`/oauth/google`). Os dados de quem entra não passam por serviço de terceiros |
| Moderação | Painel do Waline em https://forum.harpya.org/ui (o primeiro usuário cadastrado vira administrador) |
| No site | `src/components/Forum.astro`, ligado por `FORUM.motor` em `src/config.ts` |

## O que cada página tem

- **Cada caminho**, a ideia não euclidiana e a página **/forum/** têm a sua conversa.
- **Pauta aprovada** no painel vira uma página própria em `/forum/<arquivo-da-pauta>/`, com o texto da pauta, as referências e a conversa. Ela aparece primeiro na home e no fórum, como "Discussão".
- Para comentar é preciso entrar (`LOGIN=force`). Todo comentário passa por moderação antes de aparecer (`COMMENT_AUDIT=true`).

## Configuração única (só o dono das contas faz)

Faça na ordem. Em cada passo, valores secretos ficam só no serviço de destino: nunca no repositório nem no chat.

### 1. DNS do subdomínio

Na Cloudflare, zona `harpya.org` → **DNS → Add record**:

- **Type:** CNAME · **Name:** `forum` · **Target:** `1a087360475f784a.vercel-dns-016.com` (valor indicado pela Vercel para este projeto; `cname.vercel-dns.com` também funciona) · **Proxy status:** DNS only (nuvem cinza)

### 2. Senha do papel do banco

No Supabase, projeto **By Vulcan** → **SQL Editor**, rode trocando a senha por uma longa e aleatória (guarde-a no seu gerenciador de senhas):

```sql
alter role harpya_forum with password 'COLE_AQUI_UMA_SENHA_LONGA';
```

Depois, em **Connect** (botão no topo do projeto) → aba **Transaction pooler**, anote o **host** (algo como `aws-0-us-east-1.pooler.supabase.com`).

### 3. App do Google para login

Em https://console.cloud.google.com/apis/credentials (um projeto "Harpya"):

1. **OAuth consent screen:** tipo *External*, nome "Harpya", e-mail de suporte, domínio autorizado `harpya.org`, escopos `openid`, `email`, `profile`. Publique o app (*In production*).
2. **Create credentials → OAuth client ID → Web application**, nome "Harpya fórum":
   - **Authorized JavaScript origins:** `https://forum.harpya.org`
   - **Authorized redirect URIs:** `https://forum.harpya.org/oauth/google`
3. Copie o **Client ID** e o **Client secret**.

### 4. Variáveis do fórum (Doppler, sincronizado com a Vercel)

A fonte das variáveis é o **Doppler**, workplace "Vulcan Apps", projeto **`harpya-forum`**, config **`prd`**. Uma sync do tipo **Vercel** leva o `prd` para o projeto `harpya-forum` da Vercel, ambiente **Production**. Depois da sync ligada, edite as variáveis só no Doppler: o que for mudado direto na Vercel é sobrescrito na sync seguinte.

Já cadastradas no `prd` (não secretas): `SITE_NAME`, `SITE_URL`, `SERVER_URL`, `SECURE_DOMAINS`, `LOGIN`, `COMMENT_AUDIT`, `DISABLE_REGION`, `DISABLE_USERAGENT`, `OAUTH_URL`, `GRAVATAR_STR`, `AKISMET_KEY`, `IPQPS`, `WALINE_ADMIN_MODULE_ASSET_URL`, `MARKDOWN_TEX` (katex), `PG_DB`, `PG_PORT`, `PG_SSL`, `PG_USER`.

Acrescente no Doppler (`harpya-forum` → `prd` → **+** → nome e valor → **Save**):

| Nome | Valor |
|---|---|
| `PG_HOST` | o host do *Transaction pooler* do passo 2 |
| `PG_PASSWORD` | a senha do passo 2 |
| `JWT_TOKEN` | uma sequência aleatória longa (no Mac: `openssl rand -hex 32`) |
| `GOOGLE_ID` | Client ID do passo 3 |
| `GOOGLE_SECRET` | Client secret do passo 3 |

Opcional, para confirmar e-mail no cadastro e permitir "esqueci a senha": `SMTP_SERVICE` (ou `SMTP_HOST` e `SMTP_PORT`), `SMTP_USER`, `SMTP_PASS`, `SENDER_NAME` (Harpya), `SENDER_EMAIL`. Sem SMTP, o cadastro por e-mail funciona sem confirmação.

A sync envia os valores para a Vercel em poucos segundos. Depois: na Vercel, **Deployments → ⋯ → Redeploy** no deploy mais recente (a Vercel só lê variáveis novas num deploy novo).

### 5. Criar a conta de administrador (logo em seguida)

O **primeiro** usuário cadastrado vira administrador. Assim que o deploy terminar, abra https://forum.harpya.org/ui/register e cadastre a sua conta (ou entre com o Google em https://forum.harpya.org/ui/login). Depois avise para a troca do site.

### 6. Troca no site e fechamento do repositório

1. `FORUM.motor` muda para `"waline"` em `src/config.ts`; o Giscus, a automação `.github/workflows/discussoes.yml` e o `scripts/criar_discussoes.py` saem.
2. Conferido o fórum no ar, o repositório pode ser fechado: GitHub → **Settings → General → Danger Zone → Change visibility → Private**. Antes, troque `auth_scope: public_repo` por `auth_scope: repo` no painel (`scripts/cms-config.fonte.yml`) e `repositorioPublico` para `false` em `src/config.ts`.

## Moderação

- **Painel:** https://forum.harpya.org/ui → **Comentários**. Aprovar, marcar como spam, fixar ou apagar.
- **Usuários:** aba **Usuários**. Dá para promover outro moderador a administrador.
- **Avisos por e-mail** de comentário novo: configure SMTP e a variável `AUTHOR_EMAIL`.

## Privacidade

O fórum guarda nome, e-mail, o texto dos comentários, a data e o IP de quem comenta (para conter abuso). Região e navegador não são guardados (`DISABLE_REGION`, `DISABLE_USERAGENT`). O avatar padrão é uma imagem do próprio site, sem enviar o e-mail a serviços de avatar; quem entra pelo Google usa a foto da conta Google. O anti-spam externo (Akismet) fica desligado; a moderação é manual.

## Limitações conhecidas

- Uma conta criada por e-mail e senha não pode ser criada de novo pelo Google com o mesmo e-mail: entre com a senha e ligue o Google no perfil (https://forum.harpya.org/ui/profile).
- O painel de moderação do Waline carrega de `unpkg.com` (versão fixa 0.34.2).
