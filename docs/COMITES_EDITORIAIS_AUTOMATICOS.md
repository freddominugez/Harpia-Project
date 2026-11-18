# Comitês editoriais e publicação automática

Esta é a rotina editorial atual do Harpya. Uma tarefa agendada no Codex executa diariamente, às 08h30 no horário de Fortaleza, os comitês de Tecnologia e Business. Os coletores existentes de GitHub Actions continuam alimentando os radares e filas de candidatos; eles não transformam manchetes de feeds em matérias editoriais.

## Papéis e independência

Cada ambiente tem quatro papéis: pesquisa/pauta, verificação de alegações, classificação editorial e edição/publicação. A verificação e a classificação têm responsáveis distintos e ficam documentadas no manifesto. O agente que redige não usa sua própria memória como prova: abre o original e registra a URL de cada alegação material. O portão técnico exige nota mínima de 4/5; o Business exige 7/10. A instituição serve para localizar bons candidatos, sem dispensar o exame do método, autoria, dados e limites.

Fontes técnicas: o cadastro em `src/content/fontes-monitoradas/`, trabalhos originais de conferências e laboratórios, documentação técnica e páginas primárias das empresas. Fontes Business: apenas instituições aprovadas em `src/content/business/fontes/`, dentro dos escopos cadastrados. Página de fornecedor é evidência do que o fornecedor declarou, não comparação independente. Artigo de opinião, estudo, preprint, notícia, vídeo, livro e filme recebem identificação distinta.

## Contratos de exibição

O schema em `src/content.config.ts` e `src/lib/business-schema.ts` prevalece. Notícias técnicas exigem título de 20–140 caracteres, resumo de 60–200 e corpo de 2–8 parágrafos. O card de notícia mostra até três linhas do título e resumo, com duas linhas de resumo em tela estreita. O Business usa os mesmos componentes de notícias; matérias novas seguem chamada de 120–200 caracteres e corpo de 3–5 parágrafos. Vídeos usam ID de 11 caracteres, URL `https://www.youtube.com/watch?v=ID` e miniatura `https://i.ytimg.com/vi/ID/mqdefault.jpg`; título e resumo do catálogo são limitados a duas e três linhas. A ficha Business exige canal institucional aprovado, duração, palestrante, credenciais e escopo de revisão declarado. Livros têm capa 2:3 e link da edição identificada. Filmes e documentários têm coleções próprias por ambiente, card 16:9, resumo de 60–200 caracteres, fonte oficial, revisão, limites e arte geométrica original quando não há imagem licenciada.

Todos os cards devem ser conferidos em 320, 768 e 1440 px. O corte visual de CSS não substitui um resumo bem escrito. O texto essencial deve caber no início do resumo. Imagens de terceiros só entram com origem, crédito e condição de uso documentados. As notícias usam a ilustração SVG temática gerada no build.

## Ciclo diário

1. Sincronize com `origin/main`. Preserve qualquer alteração local; use outro checkout se houver trabalho de outra sessão.
2. Leia os registros das últimas execuções, os cadastros de fontes e os conteúdos de todos os status. Colete candidatos dos dois ambientes e descarte duplicatas por URL, DOI, ID de vídeo, ISBN ou assunto já coberto.
3. Redija apenas itens cujo original foi consultado. Registre limites de acesso e ausência de reprodução experimental. Vídeos não recebem selo de revisão integral sem exame integral.
4. Grave rascunhos técnicos em `src/content/{noticias,artigos,videos,livros,filmes}/` e itens Business em revisão em `src/content/business/acervo/` ou filmes em `src/content/business/filmes/`.
5. Grave manifesto versionado com `data`, `items`, `path`, `sha256` do arquivo antes da promoção, `verificacao` (responsável, evidências, alegações e resultados) e `selecao` (responsável distinto, nota e justificativa). Tecnologia: `curadoria/aprovacoes/tecnologia/AAAA-MM-DD.json`. Business: `curadoria/business/aprovacoes/AAAA-MM-DD.json`.
6. Simule a publicação com os dois portões. Só promova itens aprovados. Os scripts não escrevem material novo nem fingem que a fonte foi lida; eles conferem o manifesto, o conteúdo e a procedência antes de trocar o status.
7. Após promover, execute os testes, build, validação do CMS, QA visual e verificação de links. Se qualquer portão falhar, reverta apenas os arquivos da execução antes de enviar ao GitHub.
8. Faça commit dos arquivos de conteúdo e manifestos no mesmo commit, envie a `main`, espere o deploy de produção ficar `READY` e confira as URLs públicas. Se o deploy não ficar pronto, trate a rodada como incompleta e investigue.
9. Relate fontes consultadas, candidatos, recusas, itens publicados, URLs e falhas. Dia sem item qualificado não gera publicação fictícia nem commit vazio.

## Comandos dos portões

```bash
python3 scripts/publicar_curadoria_tecnologia.py --manifest curadoria/aprovacoes/tecnologia/AAAA-MM-DD.json
node scripts/publicar_curadoria_business.mjs --manifest curadoria/business/aprovacoes/AAAA-MM-DD.json

# Execute apenas depois da verificação e da classificação documentadas:
python3 scripts/publicar_curadoria_tecnologia.py --manifest curadoria/aprovacoes/tecnologia/AAAA-MM-DD.json --apply
node scripts/publicar_curadoria_business.mjs --manifest curadoria/business/aprovacoes/AAAA-MM-DD.json --apply

npm run check
npm run build
python3 scripts/validar_cms.py
python3 -m unittest scripts.test_publicar_curadoria_tecnologia
node --test scripts/test_publicar_curadoria_business.mjs
python3 -m unittest discover -s scripts -p 'test_business*.py'
node scripts/test_business_build.mjs
```

Use um ambiente Python com `scripts/requirements.txt` e `pyyaml==6.0.3` para o validador do CMS. Execute o QA visual de `scripts/qa_redesign.py` nas rotas afetadas antes do envio. O registro diário deve apontar o commit e as páginas efetivamente publicadas.

## Correção e responsabilidade

Correção de conteúdo já publicado passa por nova revisão e novo registro; o histórico Git preserva a versão anterior. Retirar um item pode ser feito com `status: rascunho` em Tecnologia ou `status: arquivado` em Business, seguido de build e deploy. A tarefa agendada da OpenAI/Codex é o orquestrador diário; os antigos prompts do Claude documentados em `docs/TAREFA_CURADORIA.md` e `curadoria/business/agendas-editoriais.json` continuam identificados como fluxos de preparação ou históricos e não constituem este portão de publicação.
