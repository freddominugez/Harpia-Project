---
titulo: "Um lembrete compacto do estado mede o teto do estado de contexto?"
categoria: "Caminhos"
caminho: "controle-bellman"
links:
  - "https://arxiv.org/abs/2610.20633"
  - "https://www.harpya.org/estudos/caminhos/controle-bellman/"
status: "proposta"
discussao_url: ""
proposta_em: "2026-10-16"
origem: "curadoria-diaria"
---

Numa tarefa de 400 passos com o Qwen3-8B, um bloco de conteúdo irrelevante antes de cada passo fez o contador falhar em 20 de 20 sementes, e um lembrete exato e compacto do estado, dado por um oráculo antes de cada mensagem, levou a zero sementes com erro contra 15 sem ele. O artigo compara o lembrete com um texto neutro de mesmo tamanho, que é um controle parecido com o controle embaralhado do portão G2 do caminho 7. Fica em aberto se esse desenho serve para medir a diferença de V com e sem o estado de contexto quando o estado é produzido pelo próprio sistema, e não por um oráculo. Vale reproduzir com o código publicado e trocar o oráculo por um estado aprendido.
