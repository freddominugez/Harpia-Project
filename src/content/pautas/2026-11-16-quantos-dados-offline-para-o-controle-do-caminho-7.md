---
titulo: "Quantos registros de busca bastam para estimar a política do caminho 7?"
categoria: "Caminhos"
caminho: "controle-bellman"
links:
  - "https://arxiv.org/abs/2611.17603"
  - "https://www.harpya.org/estudos/caminhos/controle-bellman/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-11-16"
origem: "curadoria-diaria"
---

O artigo dá limites inferiores e superiores para o número de amostras offline em aprendizado por reforço com regularização KL, em processos de decisão finitos com transições estocásticas, e mostra que dados coletados pela própria política de referência bastam em certa faixa de temperatura. O caminho 7 também pretende aprender a política a partir de registros de buscas feitas com uma política fixa. Fica em aberto se o estado compacto do caminho cabe nessas hipóteses (estados finitos, horizonte efetivo pequeno). Medir quantos registros de consultas são necessários para que o ganho estimado da política com contexto sobre o controle embaralhado se estabilize.
