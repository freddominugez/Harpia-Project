# Tarefa agendada: Harpya · NotícIAs

Roda todo dia, às 5h47 (horário de Fortaleza), numa sessão nova do Claude. Pesquisa o que saiu nos últimos dias sobre os temas do projeto, escreve matérias curtas com fontes e grava tudo como **rascunho** em `main`. A tarefa nunca publica: quem publica é o robô descrito em "Publicação automática", às 7h23, ou Fred pelo painel.

## Temas

| Tema (`categoria`) | O que entra |
|---|---|
| `letramento` | Letramento em IA: educação, formação de professores, bibliotecas, programas públicos, pesquisas sobre como as pessoas entendem e usam IA |
| `brasil` | Brasil e regulação: CNE, MEC, PL 2338/2023, ANPD, políticas públicas brasileiras sobre IA |
| `abertos` | Código e modelos abertos: pesos publicados, licenças, frameworks de inferência e treino abertos, ferramentas para rodar modelos em casa |
| `pesquisa` | Pesquisa e fronteira: interpretabilidade, como os modelos funcionam por dentro, avaliações independentes, limites medidos |

## Passo a passo

1. **Preparo.** `git checkout main && git pull --ff-only origin main`. Se `src/content/noticias/` ou `src/lib/noticias.ts` não existirem, pare e responda "NotícIAs ainda não está em main".
2. **O que já existe.** Leia os títulos e as URLs de fonte de `src/content/noticias/*.json` e todas as URLs de `curadoria/noticias/*.md`. Nenhuma delas pode virar matéria de novo.
3. **Coleta.** Pesquise na web os quatro temas, com consultas separadas por tema e em português e inglês. Janela: o que foi publicado desde a última execução, até 7 dias atrás.
4. **Julgamento.** Abra cada fonte com WebFetch antes de escrever. Aceite só o que tem fato verificável numa fonte primária ou num veículo reconhecido. Recuse: anúncio sem fato novo, número sem origem, boato, conteúdo pago, repetição. Entre 0 e 6 matérias por execução; o site publica 2 por dia, então procure entregar pelo menos 3 boas, de temas diferentes. Sem novidade boa, não grave matéria: só o registro. Quantidade nunca justifica matéria fraca: o robô não publica o que fica abaixo da nota mínima.
5. **Escrita.** Um arquivo por matéria em `src/content/noticias/<slug>.json`. O slug é o endereço da página (`/noticias/<slug>/`): minúsculas sem acento, números e hífens, até 60 caracteres, sem repetir um existente.

```json
{
  "titulo": "20 a 140 caracteres",
  "resumo": "60 a 200 caracteres, o que aparece nos cards",
  "data": "AAAA-MM-DD, a data do fato ou da publicação original",
  "categoria": "letramento | brasil | abertos | pesquisa",
  "icone": "livro | escola | onda | maquina | globo | chip | biblioteca | codigo | leitura | balanca | lupa",
  "corpo": ["2 a 8 parágrafos, cada um com pelo menos 40 caracteres"],
  "harpia": "Por que importa para o Harpya, 40 a 400 caracteres",
  "fontes": [{ "veiculo": "Nome do veículo", "titulo": "Título da matéria original", "url": "https://..." }],
  "status": "rascunho",
  "origem": "curadoria-diaria",
  "adicionado_em": "hoje",
  "verificado_em": "hoje",
  "ordem": 999
}
```

6. **Regras de texto.** Português do Brasil, sem travessão (use vírgula, ponto ou dois-pontos), sem adjetivo promocional. Escreva com as próprias palavras: nada de copiar parágrafos; no máximo uma citação curta (menos de 15 palavras) por fonte, entre aspas e atribuída. Nunca invente nome, número, data, citação ou link; o que não estiver na fonte não entra. Quando a afirmação é da empresa e não foi verificada por terceiros, diga isso. Sem fotos: a capa é gerada pelo site a partir do tema e do ícone.
7. **Registro.** Crie `curadoria/noticias/<hoje>.md` com a data, as consultas feitas e uma tabela com todo candidato avaliado: título, veículo, URL completa, decisão (aceito ou recusado) e motivo em uma linha. Toda URL avaliada aparece por extenso, porque é assim que a próxima execução evita repetir.
8. **Portões**, nesta ordem: `npm ci`, `npm run build`, `npx astro check`, `python3 scripts/validar_cms.py`. Se um portão falhar por causa de um arquivo novo, corrija ou remova a matéria e rode de novo. Se falhar por outro motivo, não faça push: anote o erro no registro e termine relatando a falha.
9. **Envio.** `git add src/content/noticias curadoria/noticias && git commit -m "NotícIAs <hoje>: N matérias em rascunho" && git push origin main`. Recusado por conflito: `git pull --rebase origin main` e uma nova tentativa.
10. **Relatório final**, em até 8 linhas: candidatos avaliados, matérias gravadas (título de cada uma) e o link https://www.harpya.org/admin/ para revisar.

## Limites

Não altera páginas, componentes, estilos nem configuração. A tarefa de curadoria nunca grava `status: "publicado"`: só o robô de publicação e o painel fazem isso. Não expõe tokens nem chaves.

## Nota de qualidade

Cada rascunho recebe uma nota de 0 a 100, calculada por `public/admin/noticias/score.js`. A conta é fixa e só lê o próprio arquivo da matéria, então a página do painel e o robô chegam sempre ao mesmo número.

| Critério | Pontos | O que conta |
|---|---|---|
| Fontes | 30 | Veículos independentes (1, 2 ou 3 domínios diferentes: 8, 15 ou 20) e mais 10 se houver fonte primária (governo, universidade, organismo internacional, artigo, repositório) |
| Atualidade | 20 | Dias entre a `data` do fato e hoje: até 2 dias vale 20; depois 16, 12, 8, 5 e 2 |
| Substância | 20 | Número de parágrafos, tamanho do texto e quantidade de números e datas que dá para conferir |
| Rigor | 15 | Afirmações atribuídas ("segundo", "afirma", "de acordo com"), ressalvas e limites registrados, ausência de adjetivo promocional |
| Forma | 10 | Sem travessão, título entre 40 e 120 caracteres, resumo e "por que importa" completos |
| Variedade | 5 | Tema pouco presente entre as seis últimas publicadas |

Bloqueios, que impedem a publicação automática com qualquer nota: sem fonte, fonte sem `https`, data inválida ou no futuro, fato com mais de 21 dias, mesma URL de fonte de uma notícia que já está no ar.

A nota mede sinais do texto e das fontes. Ela não abre as fontes nem confere se o fato é verdadeiro: essa checagem continua sendo da tarefa de curadoria (passo 4) e de quem revisa na página.

## Publicação automática

O workflow `.github/workflows/noticias-publicar.yml` roda todo dia às 7h23 (Fortaleza) e executa `scripts/publicar_noticias.mjs`:

1. Pontua todos os rascunhos e descarta os que têm bloqueio ou nota abaixo de **60**.
2. Publica os **2** melhores. Se o segundo colocado for do mesmo tema do primeiro e houver outro tema até 5 pontos abaixo, entra o outro tema.
3. Grava `curadoria/noticias/publicacao/<dia>.json` com o que publicou, a nota de cada critério e a fila que sobrou.
4. Faz o commit em `main`; a Vercel publica em cerca de um minuto.

Se não houver 2 rascunhos aptos, publica os que houver e o resumo da execução (aba **Actions** do GitHub) avisa quantos faltaram. O robô não baixa a régua para cumprir a meta. Rodar de novo no mesmo dia só completa o que faltou. Uma notícia que o robô publicou e que voltou a rascunho não é republicada por ele.

Para mudar a meta de um dia, rode o workflow à mão (**Run workflow**) informando a quantidade. Para mudar a meta permanente ou a nota mínima, edite `POR_DIA` e `NOTA_MINIMA` em `score.js`. Para pausar, desative o workflow em **Actions → noticias-publicar → Disable workflow**. Simulação local, sem gravar nada: `node scripts/publicar_noticias.mjs --simular`. Testes: `node --test scripts/test_noticias_score.mjs`.

## Revisar e publicar

No painel, abra a aba **NotícIAs** (https://www.harpya.org/admin/noticias/). A fila mostra os rascunhos da melhor nota para a pior, com a nota de cada critério, o texto completo, as fontes e a marca das duas que o robô publica na próxima rodada. **Publicar agora** antecipa a publicação, **Descartar** apaga a matéria e **Voltar para rascunho**, na lista **No ar**, tira uma notícia do site. Para corrigir o texto, use **Editar texto no CMS**. Depois de publicada, a matéria entra no card da home (as três mais recentes), nos destaques da página `/noticias/` (as oito mais recentes) e no arquivo, além do sitemap, do RSS e da busca. Para recusar, descarte a matéria na página: a URL continua no registro e não volta.
