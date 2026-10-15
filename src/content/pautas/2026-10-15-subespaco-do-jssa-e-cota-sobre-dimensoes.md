---
titulo: "O subespaço aprendido do JSSA admite uma cota que certifique o Top-K?"
categoria: "Caminhos"
caminho: "certificado-bits-dimensoes"
links:
  - "https://arxiv.org/abs/2610.19026"
  - "https://www.harpya.org/estudos/caminhos/certificado-bits-dimensoes/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-15"
origem: "curadoria-diaria"
---

O JSSA escolhe os tokens do cache KV por pontuação num subespaço de consulta e chave de dimensão baixa, obtido por solução espectral fechada, e relata vazão de decodificação até 6,43 vezes a da atenção completa em 128K de contexto numa B200. A seleção é aproximada: o artigo não dá cota para o erro da parte descartada. O caminho 4 soma um termo de cauda de dimensões ao resíduo de bits. Vale medir se a projeção espectral do JSSA reduz a cauda do caminho 4 em relação às primeiras m coordenadas, e quantos candidatos sobram com a cota resultante.
