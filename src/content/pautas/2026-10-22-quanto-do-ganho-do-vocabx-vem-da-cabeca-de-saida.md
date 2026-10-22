---
titulo: "Quanto do ganho do VocabX vem da cabeça de saída e quanto de gerar menos tokens?"
categoria: "Caminhos"
caminho: "cabeca-de-saida"
links:
  - "https://huggingface.co/blog/Dharma-AI/vocabx-vocabulary-specialization"
  - "https://www.harpya.org/estudos/caminhos/cabeca-de-saida/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-22"
origem: "curadoria-diaria"
---

O texto do VocabX relata, num corretor de redações sobre Qwen3-4B servido com vLLM numa RTX 5090, queda de 77% no custo medido ao trocar só o tokenizador, com a resposta caindo de 350 para 101 tokens em média. O vocabulário menor reduz duas coisas ao mesmo tempo: o número de passos de decodificação e o tamanho da cabeça de saída em cada passo. O texto não separa as duas parcelas, e o caminho 8 estima que a cabeça pesa cerca de 25% do custo por token em modelos de 1B. Vale medir o tempo por token gerado com o vocabulário original e com o reduzido, mantendo o mesmo número de tokens, para isolar o efeito da cabeça.
