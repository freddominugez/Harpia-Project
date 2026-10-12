# QA do redesign · Harpya

**Rodada:** 12/10/2026. **Repositório:** produção (Astro 5.18.2), ramo `main`.
**Referências:** `referencia-home-exata.png` (home, 1672 × 941) e `referencia-visual-aprovada.png` (página de estudo), do pacote `Harpya-Redesign-Fiel-Referencia-2026`.
**Como reproduzir:** `npm run build`, servir `dist/` e rodar `python3 scripts/qa_redesign.py --base http://localhost:4321 --shots docs/qa`. O relatório completo, rota por rota e viewport por viewport, fica em `docs/qa/relatorio.json`.

## Gates

| Verificação | Resultado |
|---|---|
| `npm run build` | passa, 27 páginas + `busca.json` + sitemap |
| `astro check` (tipos, 48 arquivos) | 0 erros, 0 avisos, 0 dicas |
| Rotas × viewports com `scrollWidth <= innerWidth` | **243 de 243** (27 rotas × 9 larguras) |
| Links internos quebrados (inclui âncoras `#`) | **0** em 1.055 links internos |
| Arquivos locais faltando (`src`, `srcset`, CSS, JS) | **0** em 599 referências |
| Imagens que não carregaram no navegador | **0** |
| Erros de console ou exceções JS | **0** (a única resposta 404 é a própria página 404, esperada) |
| Erros de KaTeX no site | **0** (corrigido um erro que já existia em produção na página da ideia não euclidiana) |

## Home contra a referência (1672 × 941)

| Elemento | Referência | Implementação |
|---|---|---|
| Cabeçalho | ~58 px, links textuais, busca, botão | 63 px, 9 links textuais, busca real, "Participar" → `/forum/` |
| Hero | ~307 px, texto 52,5% / arte 47,5% | 303 px, mesma divisão; arte vai até a borda da tela |
| KPIs | 4 cards | 4 cards: 12 caminhos, 16 camadas, 8 + 16 livros e artigos, 10 vídeos |
| Colunas do painel | ~857 / 328 / 317 px | 847 / 335 / 326 px |
| Trilhas | 4 cards | 4 cards com ícone, título, resumo e contagem real |
| Artigos | 3 cards com imagem | 3 cards com imagem, chips, data, título, resumo e "Ler mais" |
| Vídeo | pôster, play, etiqueta | pôster, play, etiqueta e link real (3Blue1Brown, `wjZofJX0v4M`) |
| Fórum | lista de tópicos | 5 pautas **marcadas como propostas** + aviso "fórum aguardando ativação" |
| CTA | escuro com a marca | "Faça parte da comunidade Harpya" → `/forum/` |
| Rodapé | começa em ~895 px | começa em 901 px |

Comparação lado a lado: `qa/comparacao-home-1672.jpg` e `qa/comparacao-artigo-1672.jpg`.

## Responsividade

| Largura | Resultado |
|---|---|
| 1672, 1440, 1280 | 3 colunas; 4 trilhas e 3 artigos lado a lado |
| 1024, 768 | menu hambúrguer; 2 colunas (trilhas 2×2, artigos com imagem à esquerda, vídeo e citação ao lado); fórum e CTA abaixo |
| 430, 390, 360, 320 | 1 coluna; KPIs e trilhas em 2 colunas; artigos com imagem à esquerda; vídeo 16:9; fórum e CTA no fim |

## Interações testadas (Playwright)

- Menu móvel: abre com `aria-expanded="true"`, fecha com Esc, devolve o foco ao botão e navega (inclusive para `/news/`).
- Busca: abre com Ctrl/⌘ + K e pelo ícone, ignora acentos ("atencao" acha "Atenção"), "bellman" leva a `/estudos/caminhos/controle-bellman/`, Esc fecha. O Tab fica dentro do diálogo enquanto ele está aberto. O índice (`/busca.json`) é gerado no build a partir das rotas, dos 12 caminhos, das 16 seções de equações, dos arquivados e do glossário.
- Página de estudo: índice lateral fixo (`position: sticky`) com 7 itens e marcação da seção visível; 7 blocos KaTeX.
- Link "Pular para o conteúdo" recebe o primeiro Tab; foco visível dourado em links, botões e campos.

## Capturas

`docs/qa/`: `home-desktop-1672.png`, `home-desktop-1440.png`, `home-tablet-1024.png`, `home-mobile-390.png`, `home-mobile-390-menu.png`, `artigo-desktop-1672.png`, `artigo-mobile-390.png`, `busca-desktop-1440.png`.

## Divergências que ficaram, por decisão

1. **Marca.** A referência e o contrato mostram "Harpya Project". O proprietário pediu antes, de forma explícita, para retirar "Project" e manter só "Harpya". O H1 ficou "Harp**ya**", com "ya" em dourado para manter o contraste de duas cores do modelo; o subtítulo da marca é "Pesquisa aberta".
2. **Harpia.** A referência mostra outra ave. Foi usada a arte original `harpya-original.png`, no ângulo original, sem espelhar nem girar, como o contrato exige. O recorte `harpya-mark-head.png` aparece no cabeçalho, no rodapé e no CTA.
3. **Números.** Os KPIs fictícios da imagem (1.247, 8.430, 321, 2,8 M e percentuais) não foram copiados.
4. **Fórum.** Sem autores, horários ou contagens inventados: as pautas são identificadas como propostas até o Giscus ser ativado.
5. **Botão "Entrar".** Não existe login; o botão virou "Participar", que leva ao fórum.
6. **Redes sociais no rodapé.** Não há contas confirmadas. O ícone do GitHub só aparece quando `SITE.repositorioPublico` for `true` (o repositório ainda é privado).
7. **Contraste do botão dourado.** Texto branco sobre o dourado da referência fica em cerca de 3:1 (passa para elementos de interface e texto grande, não para texto pequeno). Mantido por fidelidade; textos dourados sobre branco usam `#9a6f17` (4,5:1).
8. **Imagens dos cards de artigo.** São as ilustrações do pacote, recortadas para remover restos de chips da captura. São editoriais, não figuras dos experimentos.
9. **Tema escuro.** O alternador antigo foi removido: o sistema aprovado é claro (`color-scheme: light`).

## Dependências externas (fora do código)

- Giscus: tornar o repositório público, ativar Discussions, instalar o app e preencher os IDs em `src/config.ts` (passo a passo em `docs/DEPLOY.md`). Até lá, o site mostra o estado vazio.
- Fonte Inter vem do Google Fonts; sem rede, o navegador usa a fonte do sistema.
- Miniaturas da página `/videos/` vêm de `img.youtube.com`.

## Verificação pós-deploy (www.harpya.org)

Commit `b3395b9` publicado pela integração Git da Vercel (deploy `dpl_A3YwQFNLHaLhdYN4kJfinqo3YjsV`, estado READY, aliases `www.harpya.org` e `harpya.org`).

- 16 rotas e `/busca.json` responderam 200 em 1672 × 941 e 390 × 844, todas com `scrollWidth <= innerWidth`.
- A home em produção é idêntica à captura local.
- No teste a partir do ambiente de QA, o ícone `/icons/rss.svg` recebeu duas vezes um 502 do proxy de saída desse ambiente; o mesmo arquivo respondeu 200 em três requisições diretas logo depois. Não é falha do site, mas fica registrado.
