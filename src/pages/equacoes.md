---
layout: ../layouts/Texto.astro
titulo: "Do texto à previsão: as equações de um LLM"
kicker: "Equações"
lead: "Uma leitura das equações que transformam texto em vetores, distribuições de probabilidade e resultados de busca. Cada etapa explica o cálculo, seus termos e as condições em que vale. Arquitetura de referência: Transformer decodificador com RMSNorm, RoPE, atenção com grupos de chaves e valores e FFN SwiGLU."
descricao: "As 16 etapas e componentes de um LLM e de um modelo de embedding, com as equações que regem cada uma e o custo de cada etapa."
atualizado: "2026-10-13"
relacionados:
  - { href: "/estudos/", titulo: "Os 12 caminhos", sub: "Onde cada etapa vira pesquisa", icone: "file" }
  - { href: "/biblioteca/glossario/", titulo: "Glossário", sub: "Termos em uma ou duas linhas", icone: "book" }
  - { href: "/aprendizado/", titulo: "Aprendizado de Máquina", sub: "As regras que vieram antes", icone: "brain" }
---

**Notação.** $V$ tamanho do vocabulário, $n$ tokens no contexto, $d$ dimensão do modelo, $L$ número de blocos, $h$ e $h_{kv}$ cabeças de consulta e de chave e valor, $d_h=d/h$, $d_{ff}$ largura da FFN, $N$ documentos no índice. FLOPs contam multiplicação e soma como 2. O mapa reúne componentes e etapas de treinamento, geração e recuperação; não conta blocos Transformer. $B$ é o tamanho do lote e $\beta_{kv}$ os bytes por elemento do cache; $V$ também nomeia a matriz de valores na seção de atenção, por convenção local.

## 1. Tokenização

$$
(a,b)^{*}=\arg\max_{(a,b)}\ \mathrm{freq}(a\,b),\qquad \mathcal V\leftarrow\mathcal V\cup\{ab\}
$$

Antes de entrar na rede, o texto é convertido em uma sequência de identificadores. Cada identificador aponta para um token do vocabulário, que pode ser uma palavra, parte dela, pontuação ou uma sequência de bytes.

A equação do BPE descreve **a construção do vocabulário**. O operador $\arg\max$ escolhe o par adjacente mais frequente no corpus. A segunda expressão acrescenta sua união ao conjunto de símbolos disponíveis. O procedimento se repete, formando unidades progressivamente maiores. Na utilização do tokenizador, as regras aprendidas são aplicadas ao novo texto para produzir $(t_1,\ldots,t_n)$, com cada identificador entre 1 e $V$.

Um vocabulário maior pode representar determinados textos com menos tokens, mas aumenta as tabelas que o modelo armazena e pontua. A relação depende da língua, do corpus e do tokenizador; não há redução garantida para todos os textos. [Referência: Sennrich, Haddow e Birch, BPE para tradução neural](https://aclanthology.org/P16-1162/).

## 2. Tabela de embeddings

$$
E\in\mathbb R^{V\times d},\qquad x^{(0)}_i=E_{t_i,:}=\mathbf e_{t_i}^{\top}E
$$

A matriz $E$ contém uma linha para cada token e $d$ valores por linha. A expressão $E_{t_i,:}$ significa: **selecione a linha do token na posição $i$**. Esse vetor entra nos primeiros blocos da rede.

A escrita $\mathbf e_{t_i}^{\top}E$ descreve a mesma seleção por álgebra matricial: $\mathbf e_{t_i}$ tem 1 na posição do token e 0 nas demais. Na implementação, usa-se normalmente uma consulta à tabela, sem realizar essa multiplicação inteira.

Os vetores são parâmetros aprendidos. Uma coordenada isolada não precisa corresponder a um conceito identificável; a informação está distribuída pelo conjunto de valores. A tabela tem $Vd$ parâmetros. Comprimi-la reduz armazenamento, mas o efeito na velocidade depende do tráfego de memória, do cache e do custo de recuperar os valores.

## 3. Posição com RoPE

Para a posição $m$ e cada par de coordenadas $j$:

$$
\begin{pmatrix}q'_{2j}\\ q'_{2j+1}\end{pmatrix}=\begin{pmatrix}\cos m\theta_j&-\sin m\theta_j\\ \sin m\theta_j&\cos m\theta_j\end{pmatrix}\begin{pmatrix}q_{2j}\\ q_{2j+1}\end{pmatrix},\qquad \theta_j=b^{-2j/d_h}
$$

Os vetores precisam informar não apenas **qual conteúdo está presente**, mas também **onde ele aparece**. RoPE incorpora a posição por rotações aplicadas às consultas e chaves da atenção.

A matriz de senos e cossenos gira cada par de coordenadas pelo ângulo $m\theta_j$. A posição $m$ determina quanto girar; $\theta_j$ determina a frequência naquele par. A base $b$ controla o conjunto de frequências e não representa bits de quantização. A fórmula pressupõe pares de coordenadas, com $j$ começando em zero.

A identidade $\langle R_mq,R_{m'}k\rangle=\langle q,R_{m'-m}k\rangle$ mostra que a parte posicional pode ser expressa pelo **deslocamento relativo com sinal** $m'-m$. O score continua dependendo de $q$ e $k$, não apenas da distância entre posições. Relações com RotatE ou fasores são analogias algébricas, não identidade de modelos. [Referência: RoFormer](https://arxiv.org/abs/2104.09864).

## 4. RMSNorm

$$
\mathrm{RMSNorm}(x)=\frac{x}{\sqrt{\tfrac1d\sum_{j}x_j^2+\varepsilon}}\odot g
$$

RMSNorm ajusta a escala de um vetor antes das próximas transformações. Calcula a média dos quadrados das coordenadas, extrai sua raiz e divide o vetor por essa medida.

Elevar ao quadrado impede que valores positivos e negativos se cancelem. A raiz devolve uma medida da magnitude típica. O pequeno $\varepsilon$ evita divisão por zero ou por valores numericamente muito pequenos. Por fim, $\odot g$ multiplica coordenada a coordenada por uma escala aprendida.

Diferentemente de LayerNorm, RMSNorm **não subtrai a média das coordenadas**. Seu foco é controlar a escala com menos operações. O resultado não é, em geral, um vetor unitário. [Referência: Zhang e Sennrich, RMSNorm](https://arxiv.org/abs/1910.07467).

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

As primeiras equações transformam os estados normalizados $\tilde X$ em consultas $Q$, chaves $K$ e valores $V$. Consultas e chaves determinam os pesos da atenção; os valores fornecem o conteúdo combinado.

$QK^\top$ pontua pares de posições. Dividir por $\sqrt{d_h}$ controla a escala desses produtos; o softmax, aplicado por linha, converte os scores em pesos positivos que somam 1. A máscara $M$ impede acesso ao futuro: posições posteriores recebem $-\infty$ e peso zero. $AV$ combina os valores permitidos.

Cada cabeça tem projeções próprias. O símbolo $\|$ indica concatenação; $W_O$ devolve o resultado à dimensão do modelo. [Referência: Attention Is All You Need](https://arxiv.org/abs/1706.03762).

As projeções somam $2d^2+2d\,h_{kv}d_h$ parâmetros. Em GQA, grupos de consultas compartilham chaves e valores, reduzindo parâmetros e cache quando $h_{kv}<h$. [Referência: GQA](https://arxiv.org/abs/2305.13245).

No decode com cache, pontuar e combinar um novo token com $n$ posições custa aproximadamente $4nd$ FLOPs, fora as projeções. No prefill, todas as etapas processam $n$ tokens e a atenção densa custa $O(n^2d)$; explorar a máscara causal altera a contagem exata.

## 6. Cache de chaves e valores

$$
o_t=\mathrm{softmax}\!\Big(\frac{q_tK_{1:t}^{\top}}{\sqrt{d_h}}\Big)V_{1:t},\qquad \text{memória}=2\,B\,L\,n\,h_{kv}\,d_h\,\beta_{kv}
$$

Cada novo token consulta os anteriores. O **KV cache** guarda suas chaves e valores para evitar recalcular essas projeções a cada passo.

$q_t$ é a consulta atual. Ela é comparada com $K_{1:t}$, e os pesos obtidos combinam $V_{1:t}$. A expressão descreve uma cabeça antes da combinação final. O cache evita recomputação, mas não elimina a leitura do contexto.

Na fórmula de memória, 2 corresponde a chaves e valores, $B$ ao lote, $L$ aos blocos, $n$ ao contexto e $\beta_{kv}$ aos bytes por elemento. O cache cresce com contexto e lote; pode superar os pesos, conforme arquitetura e precisões. [Referência: GQA](https://arxiv.org/abs/2305.13245).

Na configuração de 8B abaixo, com $B=1$ e cache BF16, são 128 KiB por token: 1 GiB em 8.192 tokens, contra cerca de 14,96 GiB de pesos BF16. A igualdade fica perto de 122.528 tokens nessas condições; quantizar pesos ou aumentar o lote muda esse ponto.

## 7. FFN SwiGLU

$$
\mathrm{FFN}(x)=W_2\big(\mathrm{SiLU}(W_1x)\odot W_3x\big),\qquad \mathrm{SiLU}(u)=\frac{u}{1+e^{-u}}
$$

Depois da atenção, a FFN transforma cada posição individualmente. Recebe informação já contextualizada, mas não faz uma nova comparação direta entre posições.

$W_1x$ e $W_3x$ projetam o estado para uma dimensão intermediária. A primeira projeção passa por SiLU; as duas são multiplicadas coordenada a coordenada. Essa interação modula quanto de uma projeção seguirá adiante. $W_2$ devolve o resultado à dimensão $d$.

SiLU é uma transformação suave, não um interruptor binário. As três matrizes somam aproximadamente $3dd_{ff}$ parâmetros e suas operações lineares custam $6dd_{ff}$ FLOPs por token, sem incluir todas as operações elementares. Em MoE, um roteador seleciona especialistas por token. [Referência: GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202).

## 8. Conexões residuais

$$
X'=X^{(\ell-1)}+\mathrm{Attn}\big(\mathrm{RMSNorm}(X^{(\ell-1)})\big),\qquad X^{(\ell)}=X'+\mathrm{FFN}\big(\mathrm{RMSNorm}(X')\big)
$$

Uma conexão residual soma a entrada de uma transformação à sua saída. Cada subcamada pode **acrescentar uma atualização** em vez de reconstruir todo o estado.

Na primeira equação, a atenção recebe uma versão normalizada do estado e sua contribuição é somada ao original. Na segunda, a FFN acrescenta outra atualização. Esse arranjo é chamado de *pre-norm*, porque a normalização precede a transformação.

O estado final pode ser escrito como $x^{(L)}_i=x^{(0)}_i+\sum_\ell(a^{(\ell)}_i+f^{(\ell)}_i)$. Isso não torna os blocos independentes: cada contribuição depende dos estados anteriores. Conexões residuais ajudam a otimização de redes profundas, mas não garantem que blocos possam ser removidos sem perda. [Referência: Deep Residual Learning](https://arxiv.org/abs/1512.03385).

## 9. Cabeça de saída

$$
z=W_U\,h\in\mathbb R^{V},\qquad p(t_{n+1}=v\mid t_{1:n})=\frac{e^{z_v/T}}{\sum_{u}e^{z_u/T}}
$$

A cabeça converte o estado final em uma pontuação para cada token. Em $z=W_Uh$, cada linha de $W_U$ é comparada com $h$, produzindo um **logit**. Nesta seção, $h$ é o vetor de estado; na atenção, a mesma letra designa o número de cabeças.

Logits não são probabilidades. O softmax divide suas exponenciais pela soma total. A temperatura $T>0$ controla a concentração: valores menores acentuam diferenças; valores maiores tornam a distribuição mais uniforme. Na execução, subtrair o maior logit antes da exponenciação preserva o resultado e melhora a estabilidade numérica.

Para escolha gulosa, a cabeça linear equivale a MIPS antes de ajustes que alterem a ordenação. Amostrar exige a distribuição, não apenas seu máximo. Avaliar as $V$ linhas de forma densa custa aproximadamente $2Vd$ FLOPs. [Referência: Transformer, embeddings e softmax](https://arxiv.org/abs/1706.03762).

## 10. Decodificação

Guloso: $t_{n+1}=\arg\max_v z_v$. Amostragem: $t_{n+1}\sim p(\cdot\mid t_{1:n})$.

A decodificação determina **como transformar a distribuição em uma escolha**. Na estratégia gulosa, $\arg\max$ seleciona o token com maior score. Na amostragem, o token é sorteado: os mais prováveis têm maior chance, mas não são obrigatoriamente escolhidos.

No top-$p$, os tokens são ordenados por probabilidade. Mantém-se o menor prefixo cuja soma atinge ou ultrapassa o limiar $p_{\mathrm{nuc}}$; suas probabilidades são renormalizadas antes do sorteio. Usamos esse símbolo para distinguir o limiar da distribuição $p(\cdot)$.

O conjunto pode ser pequeno quando uma continuação domina e maior quando várias são plausíveis. A estratégia controla a geração, mas não garante correção factual. [Referência: The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751).

## 11. Perda e gradiente

$$
\mathcal L=-\frac1n\sum_{i}\log p(t_{i+1}\mid t_{1:i}),\qquad \frac{\partial\mathcal L_i}{\partial z}=\frac{p-\mathbf e_{t_{i+1}}}{T}
$$

A perda mede quanto o modelo favoreceu os tokens observados. Para cada posição, calcula o logaritmo negativo da probabilidade atribuída ao token seguinte. Se essa probabilidade se aproxima de 1, a perda diminui; se se aproxima de zero, a penalização cresce.

Para a perda individual $\mathcal L_i=-\log p_y$ e $p=\mathrm{softmax}(z/T)$, o gradiente é $(p-\mathbf e_y)/T$. O vetor $\mathbf e_y$ marca o token correto. Esse sinal orienta o ajuste dos parâmetros por retropropagação. No treinamento usual, $T=1$; a perda média acrescenta $1/n$ às contribuições. Aqui $n$ conta as posições previstas e válidas do exemplo, respeitando a máscara de treinamento.

As estimativas de $6P$ FLOPs no treino e $2P$ na inferência por token são aproximações para operações dominadas pelos parâmetros de modelos densos. Não representam todo o custo de contexto, atenção e execução. [Referência: Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361).

## 12. Otimizador AdamW

$$
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,\qquad v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^{2}
$$

$$
\theta_t=\theta_{t-1}-\eta_t\Big(\frac{\hat m_t}{\sqrt{\hat v_t}+\varepsilon}+\lambda\theta_{t-1}\Big)
$$

AdamW combina o gradiente atual com seu histórico para definir o ajuste de cada parâmetro. $g_t$ é o gradiente no passo $t$; não é o ganho $g$ usado na RMSNorm.

$m_t$ é uma média móvel dos gradientes. $v_t$ é uma média móvel de seus quadrados, calculados coordenada a coordenada. $\beta_1$ e $\beta_2$ controlam quanto do histórico permanece. Como as médias começam em zero, usam-se as correções $\hat m_t=m_t/(1-\beta_1^t)$ e $\hat v_t=v_t/(1-\beta_2^t)$.

A atualização divide a primeira média pela raiz da segunda, com $\varepsilon$ para estabilidade; $\eta_t$ é a taxa de aprendizagem. O termo $\lambda\theta_{t-1}$ aplica *weight decay*, uma contração separada da normalização adaptativa. Essa separação distingue AdamW de acrescentar uma penalização L2 ao gradiente do Adam. [Referência: Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101).

## 13. Modelo de embedding: pooling

$$
e=\frac1n\sum_{i}x^{(L)}_i,\qquad \hat e=\frac{e}{\|e\|_2},\qquad \mathrm{sim}(a,b)=\langle\hat e_a,\hat e_b\rangle
$$

Um encoder produz um vetor contextualizado por token. Para representar a frase ou documento por um único vetor, é preciso agregá-los. A primeira equação mostra **mean pooling**, a média dos estados finais. Na implementação, o preenchimento deve ser excluído pela máscara e $n$ deve contar os tokens incluídos.

Dividir por $\|e\|_2$ normaliza o vetor, desde que sua norma seja não nula. Para vetores normalizados, o produto interno coincide com a similaridade de cosseno. A qualidade dessa medida depende do encoder e do treinamento: a média sozinha não garante representação semântica adequada. [Referência: Sentence-BERT](https://arxiv.org/abs/1908.10084).

No ensaio local com 5 mil documentos, o encoder levou 7,1 ms e a varredura 0,075 ms, participação de 98,95%. Essa proporção não é geral; [o protocolo de reprodução permanece pendente](/estudos/#evidencia-experimental).

## 14. Perda contrastiva e Matryoshka

$$
\mathcal L_{\text{InfoNCE}}=-\log\frac{e^{\mathrm{sim}(q,d^{+})/\tau}}{e^{\mathrm{sim}(q,d^{+})/\tau}+\sum_j e^{\mathrm{sim}(q,d^{-}_j)/\tau}},\qquad \mathcal L_{\text{MRL}}=\sum_{m}c_m\,\mathcal L(e_{1:m})
$$

A perda contrastiva ensina o modelo a dar maior similaridade ao par positivo que aos negativos. No numerador está a compatibilidade de $q$ com $d^+$. O denominador inclui esse par e os negativos $d_j^-$. A perda diminui quando o positivo recebe uma parcela maior do total. A temperatura $\tau>0$ controla a sensibilidade às diferenças.

A definição de positivos e negativos depende dos dados. Um documento tratado como negativo pode ser relevante de fato, afetando o sinal de treinamento. [Referência: Contrastive Predictive Coding e InfoNCE](https://arxiv.org/abs/1807.03748).

A segunda equação soma perdas sobre prefixos de comprimentos $m$, ponderadas por $c_m$. Matryoshka busca tornar esses prefixos úteis por si mesmos, permitindo escolher uma dimensão menor depois do treino. Cada prefixo precisa do processamento e normalização definidos pelo objetivo. Cortar um embedding comum não oferece automaticamente a mesma qualidade. [Referência: Matryoshka Representation Learning](https://arxiv.org/abs/2205.13147).

## 15. Quantização

$$
\hat x=\mathrm{clip}\Big(\mathrm{round}\big(\tfrac{x}{s}\big),-2^{b-1},2^{b-1}-1\Big),\qquad \langle q,x\rangle=s\langle q,\hat x\rangle+\langle q,r\rangle,\quad |\langle q,r\rangle|\le\|q\|\,\|r\|
$$

Quantizar é representar valores por um conjunto limitado de códigos. Nesta quantização escalar uniforme, divide-se $x$ pela escala $s>0$, arredonda-se e restringe-se à faixa de inteiros de $b$ bits. A fórmula é aplicada coordenada a coordenada; outras quantizações podem usar escalas por grupo ou codebooks.

O valor reconstruído é $s\hat x$. Com $r=x-s\hat x$, a identidade separa a pontuação obtida com o código da correção perdida. Cauchy–Schwarz limita essa correção por $\|q\|\|r\|$. O limite pode ser conservador, mas é seguro quando a norma do resíduo está corretamente limitada.

Para entradas binárias em $\{-1,+1\}$, coordenadas iguais contribuem $+1$ e diferentes, $-1$. Por isso, $\langle\hat a,\hat b\rangle=d-2\,\mathrm{Hamming}(\hat a,\hat b)$.

Não há piso $4^{-b}$ para qualquer conjunto unitário. Limites de taxa–distorção exigem hipóteses sobre distribuição, dimensão e normalização; dois vetores antipodais admitem representação exata com um bit.

## 16. Recuperação vetorial

$$
\mathrm{top}\text{-}k(q)=\operatorname*{arg\,top\text{-}k}_{i}\ \langle\hat e_q,\hat e_i\rangle,\qquad \max_{i\in c}\langle q,x_i\rangle\le\langle q,\mu_c\rangle+R_c\|q\|
$$

A primeira equação seleciona os $k$ documentos com maior similaridade à consulta. Ela define o resultado desejado; o algoritmo pode ser uma varredura ou um índice. A varredura densa custa aproximadamente $2Nd$ FLOPs.

A segunda expressão limita a pontuação de um grupo. Se $\|x_i-\mu_c\|\le R_c$ para todos os seus integrantes, então $\langle q,x_i\rangle=\langle q,\mu_c\rangle+\langle q,x_i-\mu_c\rangle\le\langle q,\mu_c\rangle+R_c\|q\|$. O centro fornece a referência; o raio limita quanto um integrante pode superá-la.

Se esse limite está estritamente abaixo da $k$-ésima melhor pontuação exata já encontrada, o grupo não pode melhorar o resultado e pode ser descartado. A garantia exige raio válido, comparações conservadoras e tratamento dos desempates. O raio é o maior afastamento do centro, não a dispersão média.

## Contagem total

$$
P\approx Vd+Vd+L\big(2d^2+2d\,h_{kv}d_h+3\,d\,d_{ff}\big)
$$

A fórmula soma os principais conjuntos de pesos. Os dois termos $Vd$ representam a tabela de entrada e a cabeça de saída. Os parênteses contêm as projeções de atenção e as três matrizes da FFN; multiplicar por $L$ repete a contagem para todos os blocos.

Duas parcelas $Vd$ pressupõem **tabelas não compartilhadas**. Se entrada e saída usam a mesma matriz, conte-a apenas uma vez. A aproximação deixa de fora parâmetros menores, como os das normalizações.

Na configuração de referência do Llama 3 8B ($V=128.256$, $d=4.096$, $L=32$, $h_{kv}=8$, $d_h=128$, $d_{ff}=14.336$), as parcelas são: entrada 525 M, atenção 1.342 M, FFN 5.637 M e saída 525 M, total aproximado de 8.030 M. [Referência: implementação oficial do Llama 3](https://github.com/meta-llama/llama3/blob/main/llama/model.py).

Essa conta estima pesos. Memória depende da representação e dos componentes auxiliares; latência depende também de contexto, lote, tráfego e hardware. Porcentagem de parâmetros não equivale automaticamente a porcentagem de tempo de execução.
