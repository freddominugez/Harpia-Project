---
layout: ../layouts/Texto.astro
titulo: "Camadas de um LLM e as equações de cada uma"
kicker: "Equações"
lead: "Do texto ao token, do token ao vetor, do vetor à probabilidade do próximo token, e o caminho paralelo dos modelos de embedding. Arquitetura de referência: transformer decodificador com RMSNorm, RoPE, atenção com grupos de chaves e valores e FFN SwiGLU."
descricao: "As 16 camadas de um LLM e de um modelo de embedding, com as equações que regem cada uma e o custo de cada etapa."
relacionados:
  - { href: "/estudos/", titulo: "Os 12 caminhos", sub: "Onde cada camada vira pesquisa", icone: "file" }
  - { href: "/biblioteca/glossario/", titulo: "Glossário", sub: "Termos em uma ou duas linhas", icone: "book" }
  - { href: "/aprendizado/", titulo: "Aprendizado de Máquina", sub: "As regras que vieram antes", icone: "brain" }
---

**Notação.** $V$ tamanho do vocabulário, $n$ tokens no contexto, $d$ dimensão do modelo, $L$ número de blocos, $h$ e $h_{kv}$ cabeças de consulta e de chave e valor, $d_h=d/h$, $d_{ff}$ largura da FFN, $N$ documentos no índice. FLOPs contam multiplicação e soma como 2.

## 1. Tokenização

No BPE, o treino do tokenizador funde repetidamente o par adjacente mais frequente até o vocabulário chegar a $V$:

$$
(a,b)^{*}=\arg\max_{(a,b)}\ \mathrm{freq}(a\,b),\qquad \mathcal V\leftarrow\mathcal V\cup\{ab\}
$$

Na inferência, $\text{texto}\mapsto(t_1,\dots,t_n)$ com $t_i\in\{1,\dots,V\}$. Vocabulário maior encurta $n$ e barateia a atenção, mas aumenta as tabelas $V\times d$ da entrada e da saída.

## 2. Tabela de embeddings

$$
E\in\mathbb R^{V\times d},\qquad x^{(0)}_i=E_{t_i,:}=\mathbf e_{t_i}^{\top}E
$$

São $Vd$ parâmetros, lidos uma linha por token. Comprimir a tabela economiza memória, não tempo.

## 3. Posição com RoPE

Para a posição $m$ e cada par de coordenadas $j$:

$$
\begin{pmatrix}q'_{2j}\\ q'_{2j+1}\end{pmatrix}=\begin{pmatrix}\cos m\theta_j&-\sin m\theta_j\\ \sin m\theta_j&\cos m\theta_j\end{pmatrix}\begin{pmatrix}q_{2j}\\ q_{2j+1}\end{pmatrix},\qquad \theta_j=b^{-2j/d_h}
$$

A propriedade que interessa: $\langle R_mq,R_{m'}k\rangle=\langle q,R_{m'-m}k\rangle$. O produto depende só da distância. É a mesma operação que a rotação de relação do RotatE e a ligação de fasores em computação hiperdimensional.

## 4. RMSNorm

$$
\mathrm{RMSNorm}(x)=\frac{x}{\sqrt{\tfrac1d\sum_{j}x_j^2+\varepsilon}}\odot g
$$

## 5. Atenção causal com várias cabeças

$$
Q=\tilde XW_Q,\quad K=\tilde XW_K,\quad V=\tilde XW_V
$$

$$
A=\mathrm{softmax}\!\Big(\frac{QK^{\top}}{\sqrt{d_h}}+M\Big),\qquad M_{ij}=\begin{cases}0,&j\le i\\-\infty,&j>i\end{cases},\qquad O=AV
$$

$$
\mathrm{Attn}(X)=\big[O^{(1)}\,\|\,\cdots\,\|\,O^{(h)}\big]W_O
$$

Parâmetros: $2d^2+2d\,h_{kv}d_h$. É a única camada cujo custo cresce com $n$: cerca de $4nd$ FLOPs por token para pontuar e combinar.

## 6. Cache de chaves e valores

$$
o_t=\mathrm{softmax}\!\Big(\frac{q_tK_{1:t}^{\top}}{\sqrt{d_h}}\Big)V_{1:t},\qquad \text{memória}=2\,L\,n\,h_{kv}\,d_h\cdot\text{bytes}
$$

Em contexto longo, o cache pesa mais que os pesos.

## 7. FFN SwiGLU

$$
\mathrm{FFN}(x)=W_2\big(\mathrm{SiLU}(W_1x)\odot W_3x\big),\qquad \mathrm{SiLU}(u)=\frac{u}{1+e^{-u}}
$$

São $3\,d\,d_{ff}$ parâmetros e $6\,d\,d_{ff}$ FLOPs por token. Em modelos de mistura de especialistas, um roteador escolhe poucas FFNs por token.

## 8. Conexões residuais

$$
X'=X^{(\ell-1)}+\mathrm{Attn}\big(\mathrm{RMSNorm}(X^{(\ell-1)})\big),\qquad X^{(\ell)}=X'+\mathrm{FFN}\big(\mathrm{RMSNorm}(X')\big)
$$

O estado final é a soma das contribuições de todas as camadas, $x^{(L)}_i=x^{(0)}_i+\sum_\ell\big(a^{(\ell)}_i+f^{(\ell)}_i\big)$. É isso que permite ler camadas intermediárias e atalhos entre camadas.

## 9. Cabeça de saída

$$
z=W_U\,h\in\mathbb R^{V},\qquad p(t_{n+1}=v\mid t_{1:n})=\frac{e^{z_v/T}}{\sum_{u}e^{z_u/T}}
$$

Cada logit é um produto escalar $z_v=\langle w_v,h\rangle$: escolher o token é uma busca de produto interno máximo sobre $V$ linhas, com $2Vd$ FLOPs por token.

## 10. Decodificação

Guloso: $t_{n+1}=\arg\max_v z_v$. Amostragem: $t_{n+1}\sim p(\cdot\mid t_{1:n})$, com top-$p$ restrito ao menor conjunto cuja soma passa de $p$.

## 11. Perda e gradiente

$$
\mathcal L=-\frac1n\sum_{i}\log p(t_{i+1}\mid t_{1:i}),\qquad \frac{\partial\mathcal L_i}{\partial z}=p-\mathbf e_{t_{i+1}}
$$

Treinar custa cerca de $6P$ FLOPs por token; inferir, cerca de $2P$.

## 12. Otimizador AdamW

$$
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,\qquad v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^{2}
$$

$$
\theta_t=\theta_{t-1}-\eta_t\Big(\frac{\hat m_t}{\sqrt{\hat v_t}+\varepsilon}+\lambda\theta_{t-1}\Big)
$$

## 13. Modelo de embedding: pooling

$$
e=\frac1n\sum_{i}x^{(L)}_i,\qquad \hat e=\frac{e}{\|e\|_2},\qquad \mathrm{sim}(a,b)=\langle\hat e_a,\hat e_b\rangle
$$

Quase todo o custo de uma consulta está no encoder: 7,1 ms contra 0,075 ms de varredura em 5 mil documentos, nas medições do projeto.

## 14. Perda contrastiva e Matryoshka

$$
\mathcal L_{\text{InfoNCE}}=-\log\frac{e^{\mathrm{sim}(q,d^{+})/\tau}}{e^{\mathrm{sim}(q,d^{+})/\tau}+\sum_j e^{\mathrm{sim}(q,d^{-}_j)/\tau}},\qquad \mathcal L_{\text{MRL}}=\sum_{m}c_m\,\mathcal L(e_{1:m})
$$

## 15. Quantização

$$
\hat x=\mathrm{clip}\Big(\mathrm{round}\big(\tfrac{x}{s}\big),-2^{b-1},2^{b-1}-1\Big),\qquad \langle q,x\rangle=s\langle q,\hat x\rangle+\langle q,r\rangle,\quad |\langle q,r\rangle|\le\|q\|\,\|r\|
$$

Binário: $\langle\hat a,\hat b\rangle=d-2\,\mathrm{Hamming}(\hat a,\hat b)$. Piso teórico para vetores unitários: $D_{\text{mse}}\ge 4^{-b}$.

## 16. Recuperação vetorial

$$
\mathrm{top}\text{-}k(q)=\operatorname*{arg\,top\text{-}k}_{i}\ \langle\hat e_q,\hat e_i\rangle,\qquad \max_{i\in c}\langle q,x_i\rangle\le\langle q,\mu_c\rangle+R_c\|q\|
$$

A varredura exata custa $2Nd$ FLOPs por consulta. Um grupo de centro $\mu_c$ e raio $R_c$ pode ser descartado com certeza quando o limite fica abaixo da $k$-ésima melhor pontuação já vista.

## Contagem total

$$
P\approx Vd+Vd+L\big(2d^2+2d\,h_{kv}d_h+3\,d\,d_{ff}\big)
$$

Com a configuração pública do Llama 3 8B ($V=128.256$, $d=4.096$, $L=32$, $h_{kv}=8$, $d_h=128$, $d_{ff}=14.336$): tabela de entrada 525 M (6,5%), atenção 1.342 M (16,7%), FFN 5.637 M (70,2%), cabeça de saída 525 M (6,5%), total cerca de 8.030 M. Os valores de configuração estão citados de memória; as parcelas são calculadas com a fórmula.
