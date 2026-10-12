# Publicação: GitHub, Vercel e fórum

Tempo estimado: 20 minutos. Tudo nos planos gratuitos.

## 1. Repositório no GitHub

O código está em https://github.com/freddominugez/Harpia-Project (branch `main`). Para trabalhar no computador:

```bash
cd ~/Documents/GitHub
git clone https://github.com/freddominugez/Harpia-Project.git "Harpya"
cd "Harpya" && npm install && npm run dev
```

## 2. Vercel (plano Hobby, gratuito)

1. Em vercel.com, **Add New > Project** e importe `harpia-project`.
2. A Vercel detecta o Astro. Mantenha: build `npm run build`, saída `dist`.
3. **Deploy.** O endereço inicial será algo como `harpia-project.vercel.app`.
4. Se o endereço for outro, ajuste `site` em `astro.config.mjs` (usado no sitemap e nos links canônicos).
5. Domínio próprio (opcional): **Settings > Domains**, por exemplo `harpya.org`, com o CNAME indicado pela Vercel.

Cada push na branch `main` gera um novo deploy. O robô de news faz até 4 commits por dia, bem dentro do limite do plano gratuito.

## 3. Fórum com Giscus

1. No repositório: **Settings > General > Features**, marque **Discussions**.
2. Em **Discussions**, crie as categorias: `Caminhos` (formato Announcement ou Open-ended), `Perguntas`, `Resultados e reproduções`, `Propostas novas`.
3. Instale o app: https://github.com/apps/giscus, só neste repositório.
4. Em https://giscus.app/pt, informe o repositório, escolha o mapeamento **pathname** e a categoria **Caminhos**. Copie `data-repo-id` e `data-category-id`.
5. Repita para a categoria **Perguntas** e copie o `data-category-id` dela.
6. Preencha em `src/config.ts`:

```ts
export const GISCUS = {
  repo: "freddominugez/Harpia-Project",
  repoId: "R_...",
  categoria: "Caminhos",
  categoriaId: "DIC_...",
  categoriaGeral: "Perguntas",
  categoriaGeralId: "DIC_...",
};
```

7. Commit e push. Enquanto os IDs estiverem vazios, o site mostra um aviso de fórum não ativado.

**Estado atual (12/10/2026):** ativo. Repositório público, Discussions ligado, app giscus instalado só neste repositório e IDs preenchidos em `src/config.ts`. Para conferir os IDs a qualquer momento: `https://giscus.app/api/discussions/categories?repo=freddominugez/Harpia-Project`.

## 4. Robôs (GitHub Actions)

- **news** (`.github/workflows/news.yml`): roda a cada 6 horas e atualiza `public/data/news.json`. Rode uma vez à mão em **Actions > news > Run workflow**.
- **curadoria** (`.github/workflows/curadoria.yml`): toda segunda abre um pull request com candidatos em `curadoria/candidatos.json`.
  - Em **Settings > Actions > General > Workflow permissions**, marque **Read and write** e **Allow GitHub Actions to create and approve pull requests**.
  - Para vídeos, crie uma chave da **YouTube Data API v3** no Google Cloud e cadastre em **Settings > Secrets and variables > Actions** com o nome `YOUTUBE_API_KEY`. Sem a chave, o robô coleta só artigos e livros.
- **build** (`.github/workflows/build.yml`): confere que o site compila em cada push.

## 5. Fontes sem RSS

Anthropic e CERN não oferecem feed RSS confirmado. Opções:

- **RSSHub** (código aberto) gera feeds para sites sem RSS; depois é só acrescentar a URL em `src/content/feeds/`.
- **Crawl4AI** (código aberto, Python) raspa a página de notícias; pode virar um terceiro script no mesmo padrão.

Respeite os termos de uso de cada site. Para YouTube, use sempre a API oficial, nunca raspagem.
