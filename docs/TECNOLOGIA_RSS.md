# Leituras de tecnologia na coluna direita

Os anúncios estão em uma única coluna à direita em telas a partir de 1280 px.
Em telas menores, a coluna é empilhada depois do conteúdo principal. O banner
superior não é exibido. As chaves históricas dos dois anúncios foram mantidas
para preservar imagens, links e compatibilidade com o CMS.

Os cards usam RSS públicos gratuitos e não exigem chave nem agregador:

| Tema | Fonte | Feed |
| --- | --- | --- |
| Eletrônica | MIT News, pesquisa acadêmica | https://news.mit.edu/rss/topic/electronics |
| Chips | IEEE Spectrum, jornalismo de engenharia | https://spectrum.ieee.org/feeds/topic/semiconductors.rss |
| LLMs | Hugging Face, blog editorial técnico | https://huggingface.co/blog/feed.xml |

Os três canais responderam durante a implementação em 02/11/2026. As matérias
de destino podem ter políticas próprias de acesso; o consumo dos feeds não
depende de assinatura. O feed da Hugging Face também inclui colaboradores:
aceitamos somente artigos do blog editorial em `/blog/slug`, sem caminhos de
autores `/blog/autor/slug`. Anúncios de fabricantes não são validação independente.

`scripts/fontes_tecnologia.json` define fontes, domínios, caminhos e termos por
tema. `scripts/coletar_tecnologia.py` reutiliza o transporte e a validação do
radar de IA: HTTPS, redirecionamentos restritos aos hosts autorizados, timeout,
limite de 2 MB, datas válidas e até 45 dias. A seleção usa apenas títulos, para
não classificar textos por menus ou termos ocasionais no corpo da matéria.
O resultado em `public/data/tecnologia.json` guarda título original, fonte,
data e link, sem corpo nem resumo da publicação. São exibidos até dois cards
por tema, com nova validação de domínio e data durante o build Astro.

O workflow existente `.github/workflows/news.yml` executa a coleta a cada seis
horas e permite execução manual. Seu commit inclui o JSON e dispara a
publicação já configurada do site. A rotina passa a funcionar na hospedagem
quando esses arquivos forem enviados ao GitHub e o workflow estiver habilitado.
Execuções agendadas do GitHub podem sofrer atrasos; não é atualização em tempo real.

Em falha de uma fonte, o coletor preserva itens anteriores ainda válidos sem
alterar sua data de verificação. A interface informa a indisponibilidade; se
não houver notícia recente, apresenta o link da fonte. A data de última coleta
bem-sucedida é mostrada, com aviso quando ultrapassa 24 horas.

```sh
python -m pip install -r scripts/requirements.txt
python scripts/coletar_tecnologia.py
python -m unittest discover -s scripts -p test_tecnologia.py
npm run check
npm run build
```

## Verificação local em 02/11/2026

Astro check sem erros ou warnings (quatro hints preexistentes), build de 50
páginas e nove testes de coleta/publicidade aprovados. O HTML das 50 páginas
contém exatamente dois anúncios, ambos no único `aside.ad-rail-right`.
No Chrome, a home foi conferida em 13 larguras entre 320 e 1920 px, com cinco
cards de três temas, sem rolagem horizontal ou erros de JavaScript. Foram
conferidas ainda 12 combinações de rota/largura em notícias, estudos e
Começando, incluindo a largura efetiva do texto junto à coluna. Capturas da
home e da série em tema escuro foram inspecionadas visualmente.
