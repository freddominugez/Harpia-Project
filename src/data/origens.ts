// Conteúdo da página /origens/: eras, "sóis" (marcos celebrados, de src/content/linha-do-tempo)
// e "eclipses" (fundações que ficaram na sombra), com personagens e referências primárias.
// Fonte editorial: dossiê "O Eclipse da Inteligência Artificial", revisado em 12/10/2026
// contra os artigos originais. Fotos: Wikimedia Commons, com autor e licença de cada uma.
import { LINHA_DO_TEMPO } from "../lib/conteudo";

export type Era = { id: string; nome: string; de: number; ate: number; cor: string; suave: string };
export type Evento = { ano: number; titulo: string; texto: string; tipo: "sol" | "marco" | "eclipse"; eq?: string; era: string };
export type Ref = { texto: string; url: string };
export type Eclipse = { ano: string; titulo: string; quem: string; texto: string[]; eq?: string; eqLegenda?: string };
export type Capitulo = { n: number; id: string; periodo: string; titulo: string; era: string; abertura: string; sois: string[]; eclipses: Eclipse[]; refs: Ref[] };
export type Pessoa = { nome: string; papel: string; ano: string; foto?: string; credito?: string; licenca?: string; fonte?: string; capitulo: string };

export const ERAS: Era[] = [
  { id: "fundamentos", nome: "Fundamentos", de: 1943, ate: 1979, cor: "#486182", suave: "#ebf0f9" },
  { id: "redes", nome: "Redes e sequências", de: 1980, ate: 2016, cor: "#2d7a52", suave: "#e9f5ed" },
  { id: "transformers", nome: "Transformers", de: 2017, ate: 2023, cor: "#9a6f17", suave: "#f6edda" },
  { id: "eficiencia", nome: "Eficiência", de: 2024, ate: 2026, cor: "#695589", suave: "#f1effa" },
];
export const eraDoAno = (ano: number) => ERAS.find((e) => ano >= e.de && ano <= e.ate) ?? ERAS[ERAS.length - 1];

// Eclipses que entram na linha do tempo, além dos marcos de timeline.json.
const ECLIPSES_LINHA: Omit<Evento, "era">[] = [
  { ano: 1958, titulo: "Perceptron de Rosenblatt", texto: "Um marco dos classificadores que ajustam pesos pelos erros, com ativação em degrau.", tipo: "marco" },
  { ano: 1960, titulo: "ADALINE e a regra delta", texto: "Widrow e Hoff treinam pela saída linear e descem o gradiente do erro quadrático.", tipo: "eclipse", eq: "\\Delta w=\\eta\\,(y-w^{\\top}x)\\,x" },
  { ano: 1969, titulo: "Perceptrons, de Minsky e Papert", texto: "A prova de que uma camada só separa classes linearmente separáveis, e por isso não resolve o XOR.", tipo: "eclipse" },
  { ano: 1990, titulo: "Análise semântica latente", texto: "SVD na matriz termo-documento: o significado vira geometria em poucas dimensões.", tipo: "eclipse", eq: "A\\approx U_k\\Sigma_kV_k^{\\top}" },
  { ano: 1991, titulo: "Tese de Hochreiter: o gradiente que some", texto: "O diagnóstico do gradiente que desaparece em redes recorrentes, seis anos antes da LSTM.", tipo: "eclipse" },
  { ano: 2006, titulo: "Redes de crença profundas", texto: "Pré-treino camada a camada com RBMs reacende as redes profundas.", tipo: "eclipse" },
  { ano: 2014, titulo: "Seq2Seq e o vetor único", texto: "Sutskever, Vinyals e Le: a frase inteira comprimida num vetor de tamanho fixo.", tipo: "eclipse" },
  { ano: 2015, titulo: "Subpalavras com BPE", texto: "Sennrich, Haddow e Birch adaptam BPE à tradução neural: preprint em 2015 e publicação em 2016.", tipo: "eclipse" },
  { ano: 2016, titulo: "FastText", texto: "Palavras como soma de n-gramas de caracteres: vetores até para palavras nunca vistas.", tipo: "eclipse" },
  { ano: 2018, titulo: "ELMo e ULMFiT", texto: "Vetores que dependem da frase e a receita de pré-treinar e depois ajustar.", tipo: "eclipse" },
  { ano: 2020, titulo: "ColBERT", texto: "Um vetor por token e interação tardia, em vez de um vetor por documento.", tipo: "eclipse" },
  { ano: 2022, titulo: "Chinchilla e FlashAttention", texto: "Cerca de 20 tokens por parâmetro, e atenção exata que respeita a memória da GPU.", tipo: "eclipse" },
  { ano: 2024, titulo: "BitNet b1.58", texto: "Pesos ternários {-1, 0, 1}: multiplicação de matriz vira soma e subtração.", tipo: "eclipse" },
];

type Linha = { ano?: number; titulo?: string; texto?: string; eq?: string; marco?: boolean; era?: string };
const SOIS: Omit<Evento, "era">[] = (LINHA_DO_TEMPO as Linha[])
  .filter((i) => typeof i.ano === "number")
  .map((i) => ({ ano: i.ano!, titulo: i.titulo!, texto: i.texto!, eq: i.eq, tipo: i.marco ? "sol" : "marco" }));

export const EVENTOS: Evento[] = [...SOIS, ...ECLIPSES_LINHA]
  .map((e) => ({ ...e, era: eraDoAno(e.ano).id }))
  .sort((a, b) => a.ano - b.ano || (a.tipo === "eclipse" ? 1 : -1));

export const CAPITULOS: Capitulo[] = [
  {
    n: 1, id: "fundamentacao-oculta", periodo: "1943 a 1970", titulo: "A fundamentação oculta", era: "fundamentos",
    abertura: "A narrativa comum salta do neurônio de McCulloch e Pitts (1943) direto para a retropropagação (1986). No meio ficam os embates sobre os limites da linearidade, que quase pararam o campo.",
    sois: ["1943 · Neurônio de McCulloch e Pitts", "1958 · Perceptron de Rosenblatt"],
    eclipses: [
      {
        ano: "1960", titulo: "ADALINE e a regra delta: o berço do gradiente", quem: "Bernard Widrow e Marcian Hoff",
        texto: [
          "Enquanto o perceptron usava uma ativação em degrau, que não tem derivada útil, Widrow e Hoff, em Stanford, treinaram o ADALINE pela saída linear, antes do limiar. A regra delta (ou LMS) minimiza o erro quadrático médio descendo o gradiente.",
          "A retropropagação aplica a regra da cadeia a várias camadas; o trabalho de 1986 popularizou essa abordagem, que tem antecedentes.",
        ],
        eq: "\\Delta w_i=\\eta\\,\\big(y-w^{\\top}x\\big)\\,x_i",
        eqLegenda: "Regra de Widrow e Hoff: o erro da saída linear corrige cada peso.",
      },
      {
        ano: "1969", titulo: "O problema do XOR", quem: "Marvin Minsky e Seymour Papert",
        texto: [
          "O Perceptron de Frank Rosenblatt (1958) prometia uma máquina que aprende. Em Perceptrons (1969), Minsky e Papert provaram que um perceptron de uma camada só separa classes linearmente separáveis. O XOR não é: nenhum hiperplano separa as suas saídas.",
          "O livro pesou contra as redes neurais por mais de uma década. Junto com o relatório Lighthill (1973) e os cortes de financiamento da DARPA, marca o que se chamou de primeiro inverno da IA.",
        ],
        eq: "\\nexists\\,(w,b):\\ \\mathbb{1}\\big[w^{\\top}x+b>0\\big]=x_1\\oplus x_2\\ \\ \\forall x\\in\\{0,1\\}^2",
        eqLegenda: "Não existe reta que separe as saídas do XOR.",
      },
    ],
    refs: [
      { texto: "Widrow, B. e Hoff, M. E. (1960). Adaptive switching circuits. IRE WESCON.", url: "https://www-isl.stanford.edu/~widrow/papers/c1960adaptiveswitching.pdf" },
      { texto: "Minsky, M. e Papert, S. (1969). Perceptrons: An Introduction to Computational Geometry. MIT Press.", url: "https://doi.org/10.7551/mitpress/11301.001.0001" },
    ],
  },
  {
    n: 2, id: "despertar-latente", periodo: "1980 a 1997", titulo: "O despertar latente e o gargalo das sequências", era: "redes",
    abertura: "A hipótese distribucional de Firth (1957) dizia que uma palavra se conhece pela companhia. Essa hipótese diz respeito a representações textuais; não é uma explicação direta de todo embedding de imagens ou grafos. A álgebra de coocorrências e o diagnóstico das redes recorrentes acrescentariam outros mecanismos.",
    sois: ["1986 · Retropropagação", "1997 · LSTM"],
    eclipses: [
      {
        ano: "1990", titulo: "Análise semântica latente: a álgebra do significado", quem: "Scott Deerwester e coautores",
        texto: [
          "A LSA (patente pedida em 1988, artigo de 1990) aplica a decomposição em valores singulares a uma matriz termo-documento. Guardar só os k maiores valores singulares tira o ruído do vocabulário e revela tópicos latentes.",
          "É a origem puramente matemática dos embeddings densos: documentos e palavras viram pontos num espaço de poucas dimensões.",
        ],
        eq: "A\\approx U_k\\,\\Sigma_k\\,V_k^{\\top}",
        eqLegenda: "Fatoração truncada da matriz termo-documento.",
      },
      {
        ano: "1991", titulo: "A tese do gradiente que desaparece", quem: "Sepp Hochreiter, orientado por Jürgen Schmidhuber",
        texto: [
          "Em sua tese de diplomação na TU Munique, Hochreiter analisou condições em que redes recorrentes têm dificuldade de aprender dependências longas: o erro propagado no tempo é multiplicado por uma cadeia de jacobianas, e encolhe (ou explode) exponencialmente.",
          "A LSTM de 1997 nasce desse diagnóstico, com o carrossel de erro constante. O portão de esquecimento só seria acrescentado em 1999, por Gers, Schmidhuber e Cummins.",
        ],
        eq: "\\Big\\|\\prod_{t=k+1}^{T}\\frac{\\partial h_t}{\\partial h_{t-1}}\\Big\\|\\ \\xrightarrow[T-k\\to\\infty]{}\\ 0",
        eqLegenda: "Se todas as normas estão limitadas pela mesma constante ρ < 1, a norma do produto é no máximo ρ elevado ao número de fatores; fatores apenas menores que 1 não bastam.",
      },
    ],
    refs: [
      { texto: "Deerwester, S. et al. (1990). Indexing by latent semantic analysis. JASIS 41(6).", url: "https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9" },
      { texto: "Hochreiter, S. (1991). Untersuchungen zu dynamischen neuronalen Netzen. Tese, TU Munique.", url: "https://people.idsia.ch/~juergen/SeppHochreiter1991ThesisAdvisorSchmidhuber.pdf" },
    ],
  },
  {
    n: 3, id: "resgate-estatistico", periodo: "2003 a 2016", titulo: "O resgate estatístico e a anatomia dos vetores", era: "redes",
    abertura: "O modelo neural de linguagem de Bengio (2003) e o word2vec (2013) abriram a era moderna. Entre eles, redes profundas ainda eram difíceis de treinar, e palavras inéditas não tinham vetor.",
    sois: ["2003 · Modelo neural de linguagem", "2013 · word2vec"],
    eclipses: [
      {
        ano: "2006", titulo: "Redes de crença profundas", quem: "Geoffrey Hinton, Simon Osindero e Yee-Whye Teh",
        texto: [
          "Pré-treinar uma camada de cada vez, sem rótulos, com máquinas de Boltzmann restritas, deu às redes de muitas camadas um bom ponto de partida. O resultado reacendeu o interesse em redes profundas.",
        ],
      },
      {
        ano: "2015 e 2016", titulo: "Subpalavras: BPE e FastText", quem: "Rico Sennrich e coautores; Piotr Bojanowski, Tomáš Mikolov e coautores",
        texto: [
          "O word2vec dava um vetor por palavra inteira e falhava em palavras fora do vocabulário. Sennrich, Haddow e Birch adaptaram o BPE, um algoritmo de compressão de 1994, para a tradução neural: o vocabulário passa a ser de subpalavras. Variantes dessa ideia (BPE em bytes, WordPiece, SentencePiece) formam a tokenização dos LLMs atuais.",
          "O FastText representa cada palavra pela soma dos vetores dos seus n-gramas de caracteres, com marcadores de borda. Para gato e n = 3: ⟨ga, gat, ato, to⟩, mais a palavra inteira ⟨gato⟩.",
        ],
        eq: "v_{\\text{gato}}=\\textstyle\\sum_{g\\in\\mathcal G(\\text{gato})} z_g",
        eqLegenda: "FastText: o vetor da palavra é a soma dos vetores dos seus n-gramas.",
      },
    ],
    refs: [
      { texto: "Hinton, G. E., Osindero, S. e Teh, Y. W. (2006). A fast learning algorithm for deep belief nets. Neural Computation 18(7).", url: "https://doi.org/10.1162/neco.2006.18.7.1527" },
      { texto: "Sennrich, R., Haddow, B. e Birch, A. (2016). Neural Machine Translation of Rare Words with Subword Units. ACL.", url: "https://arxiv.org/abs/1508.07909" },
      { texto: "Bojanowski, P. et al. (2017). Enriching Word Vectors with Subword Information. TACL.", url: "https://arxiv.org/abs/1607.04606" },
    ],
  },
  {
    n: 4, id: "dinamica-do-contexto", periodo: "2014 a 2018", titulo: "A dinâmica do contexto", era: "redes",
    abertura: "O Attention Is All You Need (2017) e o par GPT e BERT (2018) são os marcos lembrados. Mas a atenção respondia a um problema concreto, e a receita do pré-treino já tinha sido provada meses antes.",
    sois: ["2014 · Atenção em tradução", "2017 · Attention Is All You Need", "2018 · GPT e BERT"],
    eclipses: [
      {
        ano: "2014", titulo: "Seq2Seq e a parede do vetor único", quem: "Ilya Sutskever, Oriol Vinyals e Quoc Le",
        texto: [
          "No seq2seq, o codificador comprime a frase inteira num único vetor de tamanho fixo, e o decodificador gera a tradução a partir dele. Em frases longas, a qualidade caía.",
          "A atenção de Bahdanau, Cho e Bengio (2014) deixa o decodificador consultar todos os estados do codificador a cada passo. Foi a resposta direta a esse gargalo.",
        ],
        eq: "c_t=\\textstyle\\sum_j \\alpha_{tj}\\,h_j,\\qquad \\alpha_{tj}=\\operatorname{softmax}_j\\big(a(s_{t-1},h_j)\\big)",
        eqLegenda: "Atenção: um contexto diferente para cada palavra gerada.",
      },
      {
        ano: "2018", titulo: "ELMo e ULMFiT: a virada de chave", quem: "Matthew Peters e coautores (AllenNLP); Jeremy Howard e Sebastian Ruder",
        texto: [
          "O ELMo mostrou que o vetor de uma palavra deve depender da frase: ele vem das camadas de um modelo de linguagem bidirecional.",
          "O ULMFiT (janeiro de 2018) provou na prática a receita de pré-treinar um modelo de linguagem em texto geral e depois ajustá-lo a cada tarefa. O GPT, meses depois, aplica a mesma receita ao Transformer.",
        ],
      },
    ],
    refs: [
      { texto: "Sutskever, I., Vinyals, O. e Le, Q. V. (2014). Sequence to Sequence Learning with Neural Networks. NeurIPS.", url: "https://arxiv.org/abs/1409.3215" },
      { texto: "Bahdanau, D., Cho, K. e Bengio, Y. (2014). Neural Machine Translation by Jointly Learning to Align and Translate.", url: "https://arxiv.org/abs/1409.0473" },
      { texto: "Peters, M. et al. (2018). Deep contextualized word representations. NAACL.", url: "https://arxiv.org/abs/1802.05365" },
      { texto: "Howard, J. e Ruder, S. (2018). Universal Language Model Fine-tuning for Text Classification. ACL.", url: "https://arxiv.org/abs/1801.06146" },
    ],
  },
  {
    n: 5, id: "escala-hardware-geometria", periodo: "2020 a 2026", titulo: "Escala, hardware e geometria", era: "eficiencia",
    abertura: "A linha do Harpya chega aos limites de eficiência: RaBitQ e o limite do vetor único. A escala e a recuperação vetorial dependem de correções de teoria, de hardware e de formato que costumam passar despercebidas.",
    sois: ["2020 · GPT-3, leis de escala e RAG", "2024 · RaBitQ", "2025 · Limites do vetor único"],
    eclipses: [
      {
        ano: "2020", titulo: "ColBERT: além do vetor único", quem: "Omar Khattab e Matei Zaharia",
        texto: [
          "Em vez de comprimir o documento num vetor, o ColBERT guarda um vetor por token e pontua com interação tardia: cada token da pergunta procura o token mais parecido do documento. O resultado de 2025, atualizado em 2026, estuda limitações sob margem positiva; não originou o ColBERT de 2020. Resultados posteriores distinguem expressividade exata sem margem de robustez e aprendizado.",
        ],
        eq: "S_{q,d}=\\textstyle\\sum_{i=1}^{|q|}\\ \\max_{1\\le j\\le |d|}\\ E_{q_i}\\cdot E_{d_j}",
        eqLegenda: "MaxSim: soma, sobre os tokens da pergunta, da melhor semelhança no documento.",
      },
      {
        ano: "2022", titulo: "Chinchilla e FlashAttention", quem: "Jordan Hoffmann e coautores (DeepMind); Tri Dao e coautores",
        texto: [
          "Chinchilla: com computação fixa, parâmetros e tokens de treino devem crescer na mesma proporção, cerca de 20 tokens por parâmetro. Modelos grandes da época estavam subtreinados para o seu tamanho. Os modelos abertos que vieram depois, como o Llama, foram treinados até além desse ponto para ficarem baratos na inferência.",
          "FlashAttention: o gargalo da atenção era o tráfego com a memória HBM da GPU, não as contas. Calcular em blocos na SRAM e recomputar em vez de guardar a matriz n × n deixa a atenção exata mais rápida e com memória linear em n. Foi um dos passos que tornaram os contextos longos praticáveis.",
        ],
        eq: "N_{\\text{tokens}}\\approx 20\\,N_{\\text{parâmetros}}",
        eqLegenda: "Regra prática do treino ótimo em computação (Chinchilla).",
      },
      {
        ano: "2024", titulo: "A fronteira da quantização: RaBitQ e BitNet", quem: "Jianyang Gao e Cheng Long; Shuming Ma e coautores (Microsoft)",
        texto: [
          "O RaBitQ guarda um bit por dimensão e dá um estimador não viesado do produto interno, com erro que cai como O(1/√D).",
          "O BitNet b1.58 restringe os pesos das camadas BitLinear a três valores, com ativações INT8; embeddings permanecem em precisão completa. Os ganhos de memória e execução dependem dos componentes e núcleos usados.",
        ],
        eq: "w\\in\\{-1,\\,0,\\,1\\}\\qquad \\varepsilon=O\\!\\big(1/\\sqrt{D}\\big)",
        eqLegenda: "Pesos ternários (BitNet) e erro do RaBitQ.",
      },
    ],
    refs: [
      { texto: "Khattab, O. e Zaharia, M. (2020). ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT. SIGIR.", url: "https://arxiv.org/abs/2004.12832" },
      { texto: "Hoffmann, J. et al. (2022). Training Compute-Optimal Large Language Models.", url: "https://arxiv.org/abs/2203.15556" },
      { texto: "Dao, T. et al. (2022). FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness. NeurIPS.", url: "https://arxiv.org/abs/2205.14135" },
      { texto: "Gao, J. e Long, C. (2024). RaBitQ: Quantizing High-Dimensional Vectors with a Theoretical Error Bound. SIGMOD.", url: "https://arxiv.org/abs/2405.12497" },
      { texto: "Ma, S. et al. (2024). The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits.", url: "https://arxiv.org/abs/2402.17764" },
    ],
  },
];

const C = (arquivo: string) => `https://commons.wikimedia.org/wiki/File:${arquivo}`;
export const PESSOAS: Pessoa[] = [
  { nome: "Frank Rosenblatt", papel: "Criou o Perceptron, um marco da aprendizagem de classificadores a partir dos erros.", ano: "1958", foto: "rosenblatt", credito: "Autor desconhecido", licenca: "CC BY-SA 4.0", fonte: C("Frank_Rosenblatt.jpg"), capitulo: "fundamentacao-oculta" },
  { nome: "Bernard Widrow", papel: "Com Marcian Hoff, criou o ADALINE e a regra delta, o berço do gradiente.", ano: "1960", foto: "widrow", credito: "Stanford Today, 1963", licenca: "Domínio público", fonte: C("Bernard_Widrow_with_ADALINE.jpg"), capitulo: "fundamentacao-oculta" },
  { nome: "Marvin Minsky", papel: "Coautor de Perceptrons, a prova dos limites da camada única.", ano: "1969", foto: "minsky", credito: "Sethwoodworth", licenca: "CC BY 3.0", fonte: C("Marvin_Minsky_at_OLPCb.jpg"), capitulo: "fundamentacao-oculta" },
  { nome: "Seymour Papert", papel: "Coautor de Perceptrons e do problema do XOR.", ano: "1969", foto: "papert", credito: "Matematicamente.it", licenca: "CC BY-SA 3.0", fonte: C("Seymour_Papert.jpg"), capitulo: "fundamentacao-oculta" },
  { nome: "Sepp Hochreiter", papel: "Diagnosticou o gradiente que desaparece (1991) e coassinou a LSTM (1997).", ano: "1991", foto: "hochreiter", credito: "Eulenreich", licenca: "CC BY-SA 4.0", fonte: C("Sepp_Hochreiter.JPG"), capitulo: "despertar-latente" },
  { nome: "Jürgen Schmidhuber", papel: "Orientou a tese de 1991 e coassinou a LSTM.", ano: "1997", foto: "schmidhuber", credito: "ITU/R. Farrell", licenca: "CC BY 2.0", fonte: C("Jürgen_Schmidhuber,_2017_(cropped).jpg"), capitulo: "despertar-latente" },
  { nome: "Geoffrey Hinton", papel: "Retropropagação (1986) e redes de crença profundas (2006). Nobel de Física em 2024.", ano: "2006", foto: "hinton", credito: "Arthur Petron", licenca: "CC BY-SA 4.0", fonte: C("Geoffrey_E._Hinton,_2024_Nobel_Prize_Laureate_in_Physics_(cropped1).jpg"), capitulo: "resgate-estatistico" },
  { nome: "Yoshua Bengio", papel: "Modelo neural de linguagem (2003) e coautor da atenção em tradução (2014).", ano: "2003", foto: "bengio", credito: "Maryse Boyce", licenca: "CC BY 4.0", fonte: C("Yoshua_Bengio_2019_cropped.jpg"), capitulo: "resgate-estatistico" },
  { nome: "Tomáš Mikolov", papel: "word2vec (2013) e coautor do FastText (2016).", ano: "2013", foto: "mikolov", credito: "Jindřich Nosek (NoJin)", licenca: "CC BY-SA 4.0", fonte: C("Tomáš_Mikolov_(2020).jpg"), capitulo: "resgate-estatistico" },
  { nome: "Ilya Sutskever", papel: "Seq2Seq (2014): a frase inteira num vetor, e o gargalo que a atenção resolveu.", ano: "2014", foto: "sutskever", credito: "Steve Jurvetson", licenca: "CC BY 2.0", fonte: C("Naveen_Rao_and_Ilya_Sutskever_Stanford_2014.jpg"), capitulo: "dinamica-do-contexto" },
  { nome: "Jeremy Howard", papel: "ULMFiT (2018), com Sebastian Ruder: pré-treinar e depois ajustar.", ano: "2018", foto: "howard", credito: "Hr0207", licenca: "CC0", fonte: C("Jeremy_Howard.jpg"), capitulo: "dinamica-do-contexto" },
  { nome: "Tri Dao", papel: "FlashAttention (2022): atenção exata que respeita a memória da GPU.", ano: "2022", capitulo: "escala-hardware-geometria" },
];
