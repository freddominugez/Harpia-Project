# Tarefa agendada: Harpya · NotícIAs

Roda a cada dois dias, às 7h17 (horário de Fortaleza), numa sessão nova do Claude. Pesquisa o que saiu nos últimos dias sobre os temas do projeto, escreve matérias curtas com fontes e grava tudo como **rascunho** em `main`. Nada aparece no site antes de Fred publicar pelo painel.

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
4. **Julgamento.** Abra cada fonte com WebFetch antes de escrever. Aceite só o que tem fato verificável numa fonte primária ou num veículo reconhecido. Recuse: anúncio sem fato novo, número sem origem, boato, conteúdo pago, repetição. Entre 0 e 6 matérias por execução. Sem novidade boa, não grave matéria: só o registro.
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

Não altera páginas, componentes, estilos nem configuração. Nunca grava `status: "publicado"`. Não expõe tokens nem chaves.

## Revisar e publicar

No painel, abra **NotícIAs** e use o filtro **Rascunhos**. Confira o texto contra as fontes, ajuste o que quiser, troque **Status** para **Publicado** e salve. Depois do fluxo editorial, a matéria entra no card da home (as três mais recentes), nos destaques da página `/noticias/` (as oito mais recentes) e no arquivo, além do sitemap, do RSS e da busca. Para recusar, apague a matéria pelo painel: a URL continua no registro e não volta.
