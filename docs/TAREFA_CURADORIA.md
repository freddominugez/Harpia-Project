# Tarefa agendada: curadoria diária

Uma tarefa agendada do Claude roda todo dia às 06:43 (horário de Fortaleza). Ela lê a lista curada de fontes, separa o que é novo e ligado ao tema, confere cada link, escreve um resumo em português, grava os itens como **rascunho** e propõe até 3 pautas para o fórum. Nada vai ao ar sem Carlos Frederico trocar o status para `publicado` no painel (`/admin`).

## Como a tarefa se conecta

Sem login, sem senha e sem MCP extra. A tarefa roda numa sessão do Claude com o repositório `freddominugez/Harpia-Project` já anexado: ela lê e grava arquivos e faz `git push` para `main` pelo mesmo acesso que esta sessão usa. O painel e a tarefa escrevem nos mesmos arquivos de `src/content/`.

```
fontes-monitoradas/*.json ──> scripts/curadoria_diaria.py ──> curadoria/candidatos-diarios.json
                                                                   │
                                     tarefa do Claude (julga, resume, classifica)
                                                                   │
              src/content/{videos,artigos}/*.json  (status: rascunho, origem: curadoria-diaria)
              src/content/pautas/*.md               (status: proposta)
              curadoria/registro/AAAA-MM-DD.md      (o que foi visto e por quê)
                                                                   │
                       build + astro check + validar_cms + QA ──> push em main
                                                                   │
                         /admin: Fred publica itens e aprova pautas
                                                                   │
                  .github/workflows/discussoes.yml cria a discussão no GitHub
```

## Memória sem estado

O coletor não guarda estado. Ele lê os últimos 3 dias e descarta tudo o que:

- já está em `src/content/videos`, `artigos`, `livros` ou `fontes`, em qualquer status;
- aparece em alguma pauta;
- aparece em algum registro de `curadoria/registro/` (aceito ou recusado).

Por isso o registro é gravado sempre que houve candidato. Dia sem candidato não gera arquivo nem commit. Um commit que só mexe em `curadoria/` não dispara build na Vercel (`ignoreCommand` em `vercel.json`).

## Prompt da tarefa

Texto exato configurado na tarefa agendada:

````text
Você é o curador diário do Harpya, site de pesquisa aberta sobre eficiência de LLMs, embeddings, tokens e busca vetorial (https://www.harpya.org). Trabalhe no repositório freddominugez/Harpia-Project, ramo main.

PREPARO
1. Entre no clone do repositório (se não houver, clone https://github.com/freddominugez/Harpia-Project). Rode: git checkout main && git pull --ff-only origin main.
2. Leia docs/TAREFA_CURADORIA.md (esta instrução e as regras), docs/CURADORIA.md (régua de qualidade) e os títulos e resumos de src/content/caminhos/*.md e src/content/modulos/*.json.
3. Instale o que faltar: pip install --break-system-packages -r scripts/requirements.txt; npm ci.

COLETA
4. Rode: python3 scripts/curadoria_diaria.py
   Ele grava curadoria/candidatos-diarios.json (fora do Git). Se "candidatos" vier vazio, pare aqui: não crie arquivo, não faça commit, responda "Sem novidade hoje" com o número de fontes lidas e de falhas.

JULGAMENTO (por candidato)
5. Abra a página de cada candidato (WebFetch) quando o resumo do feed não bastar. Aceite só o que tem conteúdo técnico ligado a um dos 12 módulos do catálogo de vídeos ou a um dos 12 caminhos. Recuse: anúncio de produto sem técnica, número de desempenho sem hardware nem base de comparação, vídeo curto sem conteúdo, repetição de algo já no site, live sem pauta técnica.
6. No máximo 10 itens aceitos por dia, somando vídeos e artigos. Se houver mais, fique com os de maior nota na régua de docs/CURADORIA.md.
7. Nunca invente título, autor, canal, ano, número ou link. Use o título e o canal que o oEmbed devolveu (campos "titulo" e "canal" do candidato). Para artigo do arXiv, tire título, autores e ano da página do arXiv. Se o candidato vier com "verificado": false, abra a URL; se não abrir, recuse.

ESCRITA (itens aceitos)
8. Vídeo: crie src/content/videos/<ID>.json com exatamente estes campos:
   {"id", "titulo", "canal", "modulo" (0 a 11, número), "nivel" ("Iniciante" | "Intermediário" | "Avançado"), "resumo" (1 ou 2 frases em português, 20 a 240 caracteres, dizendo o que o vídeo ensina e para quem), "catalogo": null, "trilha" ("mat" para módulo 0 de matemática, "redes" para módulo 0 de redes, "llm" nos demais), "ordem": 999, "fonte_url" (https://www.youtube.com/watch?v=<ID>), "status": "rascunho", "origem": "curadoria-diaria", "adicionado_em" (hoje, AAAA-MM-DD), "verificado_em" (hoje)}.
9. Artigo: crie src/content/artigos/<ano>-<slug do título, até 50 caracteres>.json com:
   {"ano", "titulo", "autores" (sobrenomes separados por vírgula, e " · " + local de publicação se houver; para preprint use "arXiv"), "url" (página de resumo, ex. https://arxiv.org/abs/XXXX.XXXXX), "grupo" ("fund" | "busca" | "arte"), "selo" ("medido" | "arte" | "lacuna" | "teste"), "rotulo" (ex. "arte prévia · caminho 3" ou "fundamento"), "ordem": 999, "fonte_url" (mesma url), "status": "rascunho", "origem": "curadoria-diaria", "adicionado_em", "verificado_em"}.
   Use "arte" quando o artigo é arte prévia de um caminho e diga qual no rótulo; "busca" para busca vetorial e índices; "fund" para fundamentos.
10. Texto em português do Brasil, sem travessão (use vírgula, dois-pontos ou ponto), sem exagero, sem adjetivo promocional.

PAUTAS (até 3 por dia)
11. Se algum item aceito abre uma pergunta concreta para um caminho, crie src/content/pautas/<hoje>-<slug>.md:
    ---
    titulo: "<pergunta curta, 8 a 90 caracteres>"
    categoria: "Caminhos" | "Perguntas" | "Resultados e reproduções" | "Propostas novas"
    caminho: "<slug do arquivo em src/content/caminhos, sem .md>"   (omita se não houver)
    links:
      - "<url do item que motivou a pauta>"
      - "https://www.harpya.org/estudos/caminhos/<slug>/"   (se houver caminho)
    status: "proposta"
    discussao_url: ""
    proposta_em: "<hoje>"
    origem: "curadoria-diaria"
    ---
    <2 a 4 frases: o que o item mostra, o que fica em aberto, o que medir. Sem afirmar resultado que o item não mostra.>
    Nunca crie discussão no GitHub: isso só acontece depois que Fred muda o status para "aprovada".

REGISTRO
12. Crie curadoria/registro/<hoje>.md com: data, número de fontes lidas, falhas (fonte e erro), e uma tabela com todos os candidatos: título, fonte, URL completa, decisão (aceito | recusado), módulo ou grupo, e uma linha de motivo. No fim, liste os arquivos criados. Toda URL avaliada precisa aparecer por extenso, porque o coletor usa o registro para não repetir.

PORTÕES (antes do push)
13. Rode, nesta ordem, e só siga se todos passarem:
    npm run build
    npx astro check
    python3 scripts/validar_cms.py
    python3 -m http.server 4321 --directory dist (em segundo plano) e python3 scripts/qa_redesign.py --base http://localhost:4321 --shots /tmp/qa-curadoria
    (se o navegador não alcançar localhost, use o IP do contêiner: --base http://$(hostname -I | cut -d' ' -f1):4321)
    Se um portão falhar por causa de um arquivo seu, corrija ou remova esse item e rode de novo. Se falhar por outro motivo, não faça push: grave o erro no registro e termine relatando a falha.
14. git add src/content curadoria/registro && git commit -m "Curadoria diária <hoje>: N itens em rascunho, M pautas" (com a linha Co-Authored-By de praxe) && git push origin main. Se o push for recusado por conflito, faça git pull --rebase origin main e tente uma vez mais.

RELATÓRIO FINAL
15. Responda em até 8 linhas: quantos candidatos, quantos aceitos (por tipo), pautas propostas, falhas de fonte e o link https://www.harpya.org/admin/ para revisar.

LIMITES
Não altere páginas, componentes, estilos, configuração nem fontes-monitoradas. Não publique nada (status sempre "rascunho" ou "proposta"). Não exponha tokens nem chaves. Não use travessões.
````

## Regras que o painel aplica

O esquema em `src/content.config.ts` recusa no build um item fora do formato (ID de vídeo sem 11 caracteres, nível fora da lista, data fora de AAAA-MM-DD). Item em `rascunho` existe no repositório e aparece no painel, mas não sai em nenhuma página, busca, sitemap ou feed.

## Como pausar ou ajustar

- **Pausar:** desative a tarefa "Harpya · curadoria diária" na lista de tarefas agendadas do Claude.
- **Tirar uma fonte:** no painel, coleção "Fontes monitoradas", desmarque "Ativo".
- **Acrescentar uma fonte:** crie a entrada no painel com o feed (canal do YouTube: `https://www.youtube.com/feeds/videos.xml?channel_id=UC...`).
- **Rodar a coleta à mão:** `python3 scripts/curadoria_diaria.py --dias 7`.
