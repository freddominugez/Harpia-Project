// Expansão editorial do texto fornecido pelo autor em 12/10/2026.
// Os resumos do CMS permanecem intactos; esta camada pertence apenas ao dossiê Origens.
import type { Evento, Ref } from './origens';

export type Aprofundamento = {
  titulo: string;
  quem: string;
  texto: string[];
  legado: string;
  refs: Ref[];
  nota?: string;
};

const fonte = (texto: string, url: string): Ref => ({ texto, url });

export const APROFUNDAMENTOS: Record<number, Aprofundamento> = {
  1943: {
    titulo: 'A invenção do neurônio matemático', quem: 'Warren McCulloch e Walter Pitts',
    texto: [
      'A neurociência encontrou a lógica formal. McCulloch e Pitts abstraíram o comportamento de um neurônio em uma unidade que recebe sinais e produz uma saída binária quando determinadas condições são satisfeitas. Não era uma reprodução da complexidade biológica do cérebro, mas uma forma de estudar suas possibilidades computacionais.',
      'Redes dessas unidades podiam representar operações lógicas. A expressão com soma ponderada e limiar, usada nesta linha do tempo, é uma apresentação didática moderna; o artigo original também impunha regras específicas para sinais excitatórios e inibitórios. O salto conceitual foi mostrar como uma atividade nervosa idealizada podia ser descrita por um cálculo lógico. Ainda não havia um procedimento para aprender os pesos a partir de exemplos.',
    ], legado: 'Antes de aprender, a máquina precisava de uma unidade computável.',
    refs: [fonte('McCulloch e Pitts (1943). A Logical Calculus of the Ideas Immanent in Nervous Activity.', 'https://doi.org/10.1007/BF02478259')],
  },
  1948: {
    titulo: 'Shannon e a medida da informação', quem: 'Claude Shannon',
    texto: [
      'Shannon separou o problema de transmitir informação do problema de interpretar seu significado. A entropia mede a incerteza de uma distribuição: acontecimentos menos previsíveis carregam mais informação. O bit torna-se a unidade dessa medida, e a comunicação passa a ter limites que podem ser calculados.',
      'Ao construir aproximações estatísticas do inglês, Shannon mostrou como as frequências de letras e suas dependências produzem sequências progressivamente mais parecidas com a língua. A conexão com os modelos atuais está no princípio de estimar probabilidades a partir do contexto. Um LLM usa representações aprendidas e dependências muito mais complexas que um n-grama; a continuidade é probabilística, não uma identidade entre os algoritmos.',
    ], legado: 'Prever linguagem passa a ser um problema de probabilidades e incerteza.',
    refs: [fonte('Shannon (1948). A Mathematical Theory of Communication.', 'https://doi.org/10.1002/j.1538-7305.1948.tb01338.x')],
  },
  1950: {
    titulo: 'O jogo da imitação', quem: 'Alan Turing',
    texto: [
      'Em Computing Machinery and Intelligence, Turing troca uma pergunta difícil de definir, se máquinas podem pensar, por uma situação observável de interação. O jogo da imitação desloca a discussão para aquilo que um interlocutor consegue distinguir por meio de respostas escritas.',
      'Essa proposta deu à inteligência artificial uma referência experimental para o comportamento conversacional. Ela não demonstra consciência, compreensão ou experiência subjetiva: ser convincente em uma conversa é um critério particular, não uma definição universal de inteligência. A tensão entre desempenho linguístico e atribuição de capacidades mentais continua presente na avaliação dos sistemas atuais.',
    ], legado: 'A conversa torna-se um objeto de avaliação, com limites próprios.',
    refs: [fonte('Turing (1950). Computing Machinery and Intelligence.', 'https://doi.org/10.1093/mind/LIX.236.433')],
  },
  1956: {
    titulo: 'O batismo em Dartmouth', quem: 'John McCarthy, Marvin Minsky, Nathaniel Rochester e Claude Shannon',
    texto: [
      'A proposta para o encontro de Dartmouth foi escrita em 1955, para uma reunião no verão de 1956. Ela empregava o termo inteligência artificial e reunia questões sobre linguagem, abstração, redes neurais e aprendizagem em uma agenda comum.',
      'O programa expressava um otimismo ambicioso: investigar se aspectos da inteligência poderiam ser descritos com precisão suficiente para uma máquina simulá-los. Dartmouth não resolveu esses problemas naquele verão. Sua importância foi dar nome, identidade e um espaço de colaboração a um campo que antes se distribuía entre lógica, cibernética, teoria da informação e computação.',
    ], legado: 'Problemas dispersos passam a constituir um programa de pesquisa.',
    refs: [fonte('McCarthy et al. (1955). Proposta original para Dartmouth, realizado em 1956.', 'https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html')],
  },
  1957: {
    titulo: 'O significado pela companhia', quem: 'J. R. Firth e a tradição distribucional',
    texto: [
      'A observação de Firth associa o significado de uma palavra aos contextos em que ela ocorre. A hipótese distribucional tem uma história mais ampla, incluindo Zellig Harris: o contexto pode fornecer evidências sobre relações de significado sem exigir que cada palavra tenha uma definição programada à mão.',
      'Banco, perto de dinheiro e crédito, tem um uso diferente de banco, perto de praça e sentar. Modelos distribucionais transformam essas regularidades em representações numéricas. Embeddings estáticos tendem a reunir os usos em um vetor por palavra; representações contextuais, desenvolvidas depois, distinguem o vetor de uma mesma palavra conforme a frase. Coocorrência é uma fonte de informação semântica, não uma garantia de compreensão completa.',
    ], legado: 'O contexto fornece uma pista mensurável para representar significado.',
    refs: [fonte('Firth (1957). A Synopsis of Linguistic Theory, 1930–1955. Studies in Linguistic Analysis.', 'https://search.worldcat.org/search?q=A+Synopsis+of+Linguistic+Theory+Firth+1957')],
  },
  1966: {
    titulo: 'A primeira ilusão conversacional: ELIZA', quem: 'Joseph Weizenbaum',
    texto: [
      'ELIZA mostrou como regras relativamente simples podiam produzir uma conversa plausível. Seu script DOCTOR simulava um diálogo inspirado na psicoterapia rogeriana: identificava palavras-chave, decompunha a entrada e reconstruía uma resposta, frequentemente devolvendo uma pergunta ao interlocutor.',
      'Não havia aprendizagem estatística, embeddings ou uma rede neural. A impressão de atenção e empatia vinha da forma da interação e das expectativas humanas. O chamado efeito ELIZA tornou-se um alerta duradouro: fluência aparente e identificação emocional não demonstram que um sistema entenda o que diz. O programa é um marco pioneiro dos chatbots, sem precisar ser tratado como origem exclusiva de toda interação entre pessoas e computadores.',
    ], legado: 'A aparência de compreensão pode exceder o mecanismo que a produz.',
    refs: [fonte('Weizenbaum (1966). ELIZA: A Computer Program for the Study of Natural Language Communication Between Man and Machine.', 'https://doi.org/10.1145/365153.365168')],
  },
  1986: {
    titulo: 'A aprendizagem guiada pelo erro', quem: 'David Rumelhart, Geoffrey Hinton e Ronald Williams',
    texto: [
      'A retropropagação calcula como cada peso contribui para o erro de uma rede. A regra da cadeia permite transportar derivadas da saída para as camadas internas; um otimizador usa esses gradientes para atualizar os parâmetros. Assim, representações intermediárias podem ser aprendidas em conjunto, em vez de especificadas manualmente.',
      'O artigo de 1986 popularizou esse procedimento e demonstrou seu potencial para aprender representações. A ideia tem antecedentes, incluindo diferenciação reversa e trabalhos de Paul Werbos, e não nasceu inteiramente naquele ano. Também não eliminou os problemas de treinar redes profundas: gradientes instáveis, dados insuficientes e limites computacionais continuaram a exigir novas soluções.',
    ], legado: 'O erro na saída pode orientar a aprendizagem das camadas escondidas.',
    refs: [fonte('Rumelhart, Hinton e Williams (1986). Learning representations by back-propagating errors.', 'https://doi.org/10.1038/323533a0')],
  },
  1997: {
    titulo: 'Uma memória que atravessa a sequência', quem: 'Sepp Hochreiter e Jürgen Schmidhuber',
    texto: [
      'Redes recorrentes carregam um estado de um passo para o seguinte, mas as derivadas podem desaparecer ou explodir ao atravessar muitas etapas. A LSTM introduziu células de memória e mecanismos de controle que favorecem a preservação de informação e a passagem do erro ao longo do tempo.',
      'A imagem de uma esteira de memória ajuda a entender o mecanismo: caminhos aditivos transportam o estado, enquanto portões controlam a entrada e a saída. O portão de esquecimento familiar nas versões atuais foi acrescentado por Gers, Schmidhuber e Cummins em trabalho posterior, de 1999. LSTMs tornaram-se importantes em tarefas de sequência, como fala e tradução, mas não resolveram universalmente toda dependência de longo prazo.',
    ], legado: 'Aprender uma sequência exige controlar o que se mantém e o que se altera.',
    refs: [fonte('Hochreiter e Schmidhuber (1997). Long Short-Term Memory.', 'https://doi.org/10.1162/neco.1997.9.8.1735')],
  },
  2003: {
    titulo: 'A linguagem em um espaço contínuo', quem: 'Yoshua Bengio, Réjean Ducharme, Pascal Vincent e Christian Jauvin',
    texto: [
      'Os modelos de n-gramas dependiam fortemente de contagens de combinações observadas. Bengio e coautores propuseram aprender, ao mesmo tempo, uma representação distribuída para cada palavra e uma função que estima a probabilidade da próxima palavra a partir dessas representações.',
      'Palavras com usos semelhantes passam a compartilhar características num espaço contínuo. Isso permite transferir parte do que foi aprendido entre contextos relacionados, em vez de tratar toda sequência inédita como um caso isolado. A contribuição não foi eliminar a alta dimensionalidade da linguagem, mas criar uma forma de generalização que contorna parte da explosão combinatória das contagens discretas.',
    ], legado: 'A representação da palavra e a previsão da sequência aprendem juntas.',
    refs: [fonte('Bengio et al. (2003). A Neural Probabilistic Language Model.', 'https://www.jmlr.org/papers/v3/bengio03a.html')],
  },
  2013: {
    titulo: 'Geometria semântica em escala: word2vec', quem: 'Tomáš Mikolov e coautores',
    texto: [
      'CBOW e Skip-gram tornaram a aprendizagem de vetores de palavras computacionalmente mais acessível. Um prevê uma palavra a partir do contexto; o outro prevê palavras do contexto a partir de uma palavra. Com arquiteturas simples e treinamento eficiente, grandes corpora passaram a produzir representações úteis para muitas tarefas.',
      'Certas relações aparecem como deslocamentos no espaço vetorial. A analogia rei menos homem mais mulher aproximadamente igual a rainha tornou esse resultado conhecido. Trata-se de uma regularidade empírica que depende do corpus, do treinamento e do método de avaliação, não de uma lei infalível da semântica. Esses vetores também absorvem ambiguidades e vieses presentes nos textos usados para treiná-los.',
    ], legado: 'Relações de uso podem aparecer como relações entre coordenadas.',
    refs: [fonte('Mikolov et al. (2013). Efficient Estimation of Word Representations in Vector Space.', 'https://arxiv.org/abs/1301.3781')],
  },
  2014: {
    titulo: 'A gênese do foco: atenção em tradução', quem: 'Dzmitry Bahdanau, Kyunghyun Cho e Yoshua Bengio',
    texto: [
      'Um codificador que resume toda a frase em um único vetor cria um gargalo: o decodificador precisa recuperar dali tudo o que importa. A atenção permite consultar os estados da frase original a cada passo da geração. Pesos aprendidos combinam as posições mais relevantes para produzir o próximo elemento.',
      'O contexto deixa de ser um pacote fixo e passa a mudar durante a tradução. A proposta foi apresentada em 2014 e publicada no ICLR de 2015. Essa atenção ainda operava em uma arquitetura recorrente; o Transformer viria depois. A ideia central, construir uma combinação de representações condicionada à tarefa atual, tornou-se uma peça importante de diversas arquiteturas.',
    ], legado: 'A cada palavra gerada, o modelo pode consultar um contexto diferente.',
    refs: [fonte('Bahdanau, Cho e Bengio (2014). Neural Machine Translation by Jointly Learning to Align and Translate.', 'https://arxiv.org/abs/1409.0473')],
  },
  2017: {
    titulo: 'Attention Is All You Need', quem: 'Ashish Vaswani e coautores',
    texto: [
      'O Transformer removeu a recorrência do núcleo da arquitetura e organizou a interação entre posições por atenção. Consultas, chaves e valores permitem calcular quanto cada posição contribui para a representação de outra. Múltiplas cabeças aprendem combinações diferentes dessas relações.',
      'Durante o treinamento, muitas operações sobre posições podem ser realizadas em paralelo, ampliando o aproveitamento do hardware. Isso não significa que a geração autoregressiva de texto deixou de ser sequencial: cada novo token ainda depende dos anteriores. A arquitetura abriu um caminho para escala, acompanhado de custos de memória e de atenção que motivariam avanços posteriores, como FlashAttention.',
    ], legado: 'A interação entre posições torna-se o centro da arquitetura.',
    refs: [fonte('Vaswani et al. (2017). Attention Is All You Need.', 'https://arxiv.org/abs/1706.03762')],
  },
  2018: {
    titulo: 'Duas receitas: GPT e BERT', quem: 'Alec Radford e coautores; Jacob Devlin e coautores',
    texto: [
      'GPT e BERT consolidaram usos diferentes do Transformer pré-treinado. O GPT emprega atenção causal e aprende a prever a continuação de uma sequência. O BERT usa um codificador bidirecional e aprende, entre outros objetivos, a recuperar palavras mascaradas com acesso ao contexto dos dois lados.',
      'A distinção ajuda a explicar por que uma receita se destacou na geração e a outra em tarefas de representação e compreensão textual. Ambas aproveitam conhecimento adquirido em corpora gerais e permitem adaptação posterior. Nem o BERT é uma máquina perfeita de compreensão, nem o pré-treino exige literalmente ler toda a internet: cada modelo depende de dados selecionados, objetivos e limites de treinamento.',
    ], legado: 'Pré-treinar em texto geral e adaptar à tarefa torna-se uma receita central.',
    refs: [fonte('Radford et al. (2018). Improving Language Understanding by Generative Pre-Training.', 'https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf'), fonte('Devlin et al. (2018). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding.', 'https://arxiv.org/abs/1810.04805')],
  },
  2019: {
    titulo: 'Geração e busca ganham outra escala', quem: 'Alec Radford e coautores; Nils Reimers e Iryna Gurevych',
    texto: [
      'O GPT-2 ampliou o treinamento autoregressivo e mostrou geração mais convincente, com sua maior versão chegando a 1,5 bilhão de parâmetros. A liberação foi gradual, acompanhada de discussão sobre possíveis usos indevidos. O resultado ajudou a evidenciar quanto dados e escala podiam ampliar capacidades sem redesenhar toda a arquitetura.',
      'Sentence-BERT atacou outro custo: comparar um grande número de frases usando o BERT como avaliador de cada par era caro. Com treinamento siamês e tripletos, tornou-se possível produzir embeddings de frases reutilizáveis, comparáveis por similaridade. A busca não ficou literalmente instantânea; tornou-se viável pré-calcular representações e usar índices eficientes em vez de avaliar cada par com a rede completa.',
    ], legado: 'Gerar linguagem e recuperar linguagem seguem caminhos complementares.',
    refs: [fonte('Radford et al. (2019). Language Models are Unsupervised Multitask Learners.', 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf'), fonte('Reimers e Gurevych (2019). Sentence-BERT.', 'https://aclanthology.org/D19-1410/')],
  },
  2020: {
    titulo: 'Escala, contexto e memória recuperável', quem: 'Tom Brown e coautores; Jared Kaplan e coautores; Patrick Lewis e coautores',
    texto: [
      'Com 175 bilhões de parâmetros, o GPT-3 mostrou que exemplos no próprio contexto podiam orientar uma tarefa sem atualizar os pesos. Estudos de leis de escala descreveram relações empíricas entre perda, quantidade de dados, tamanho do modelo e computação. Não eram leis termodinâmicas nem garantias de que toda capacidade cresceria de forma previsível.',
      'O RAG combina uma memória paramétrica, armazenada nos pesos, com documentos recuperados externamente. A geração passa a usar evidências que podem ser atualizadas sem retreinar todo o modelo. Isso ajuda em tarefas intensivas em conhecimento, mas não elimina alucinações: recuperação, qualidade da fonte e fidelidade da resposta continuam a precisar de avaliação. RAG e GPT-3 são contribuições distintas que convergiram na engenharia posterior.',
    ], legado: 'Mais parâmetros e melhor acesso ao conhecimento resolvem problemas diferentes.',
    refs: [fonte('Brown et al. (2020). Language Models are Few-Shot Learners.', 'https://arxiv.org/abs/2005.14165'), fonte('Kaplan et al. (2020). Scaling Laws for Neural Language Models.', 'https://arxiv.org/abs/2001.08361'), fonte('Lewis et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.', 'https://arxiv.org/abs/2005.11401')],
  },
  2021: {
    titulo: 'A posição escrita em rotações: RoPE', quem: 'Jianlin Su e coautores',
    texto: [
      'A atenção precisa de informação sobre a ordem dos elementos. RoPE gira pares de coordenadas de consultas e chaves por ângulos associados à posição. Quando esses vetores interagem, a diferença entre as posições aparece na expressão do produto interno.',
      'A operação é uma rotação em subespaços de duas dimensões, equivalente a uma descrição por números complexos. Não se trata de geometria fractal. O mecanismo oferece uma forma elegante de incorporar relações posicionais, mas extrapolar para sequências muito maiores que as do treinamento não é automaticamente seguro. Contextos longos exigem também escolhas de treinamento, ajustes posicionais, memória e avaliação.',
    ], legado: 'A distância entre posições pode participar da própria conta de atenção.',
    refs: [fonte('Su et al. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding.', 'https://arxiv.org/abs/2104.09864')],
  },
  2022: {
    titulo: 'Conversar com o modelo, encurtar o vetor', quem: 'OpenAI; Aditya Kusupati e coautores',
    texto: [
      'O ChatGPT levou a interação com modelos de linguagem a um público amplo. Ajustes supervisionados e aprendizagem por reforço com feedback humano ajudaram a orientar as respostas para seguir instruções. Esse processo melhora a utilidade conversacional, mas não garante factualidade, segurança ou compreensão humana.',
      'Em uma frente independente, Matryoshka Representation Learning treina uma representação para que prefixos de diferentes comprimentos também sejam úteis. Como nas bonecas que se encaixam, uma representação menor fica contida na maior. Isso permite escolher um compromisso entre custo e qualidade na recuperação. Cortar qualquer embedding arbitrário não produz o mesmo efeito: a propriedade depende do treinamento, e a qualidade deve ser medida para cada comprimento e tarefa.',
    ], legado: 'A interface se aproxima das pessoas; a representação se adapta ao orçamento.',
    refs: [fonte('OpenAI (2022). Introducing ChatGPT.', 'https://openai.com/index/chatgpt/'), fonte('Ouyang et al. (2022). Training language models to follow instructions with human feedback.', 'https://arxiv.org/abs/2203.02155'), fonte('Kusupati et al. (2022). Matryoshka Representation Learning.', 'https://arxiv.org/abs/2205.13147')],
  },
  2023: {
    titulo: 'A expansão dos modelos de pesos disponíveis', quem: 'Hugo Touvron e coautores; Tim Dettmers e coautores',
    texto: [
      'LLaMA ampliou o acesso à pesquisa com modelos de linguagem, em tamanhos que podiam ser estudados fora dos maiores laboratórios. A distribuição inicial tinha condições de acesso; pesos disponíveis não significam, por si só, licença irrestrita, publicação dos dados ou transparência completa do treinamento.',
      'LoRA, apresentada antes, adapta matrizes por atualizações de baixo posto. QLoRA, em 2023, combinou adaptação com uma base quantizada para reduzir a memória de ajuste fino. Essas técnicas abriram possibilidades em GPUs de menor orçamento. Isso não torna qualquer modelo executável em qualquer placa: tamanho, quantização, contexto e memória das ativações continuam a determinar o custo. A comunidade passou a experimentar e comparar receitas em uma escala muito mais ampla.',
    ], legado: 'Acesso aos pesos e adaptação eficiente ampliam quem pode experimentar.',
    refs: [fonte('Touvron et al. (2023). LLaMA: Open and Efficient Foundation Language Models.', 'https://arxiv.org/abs/2302.13971'), fonte('Hu et al. (2021). LoRA: Low-Rank Adaptation of Large Language Models.', 'https://arxiv.org/abs/2106.09685'), fonte('Dettmers et al. (2023). QLoRA: Efficient Finetuning of Quantized LLMs.', 'https://arxiv.org/abs/2305.14314')],
  },
  2024: {
    titulo: 'RaBitQ: compressão com erro controlado', quem: 'Jianyang Gao e Cheng Long',
    texto: [
      'Guardar milhões de vetores em ponto flutuante custa memória e movimentação de dados. RaBitQ quantiza a direção de vetores normalizados em códigos de um bit por dimensão e conserva informações auxiliares necessárias à estimação. O orçamento total inclui esses metadados e o índice; não se resume aos bits do código.',
      'Sua contribuição é combinar uma construção aleatória com análise do erro do estimador, permitindo avaliar o compromisso entre precisão e custo. As distâncias estimadas não permanecem idênticas às originais. A ordenação pode mudar quando candidatos têm escores próximos, razão pela qual recall, latência e custo de refinamento precisam ser medidos em cada base. Quantização de embeddings, como RaBitQ, e quantização de pesos do modelo, como BitNet, atuam em partes diferentes do sistema.',
    ], legado: 'Comprimir torna-se uma escolha analisável, com limites e métricas.',
    refs: [fonte('Gao e Long (2024). RaBitQ: Quantizing High-Dimensional Vectors with a Theoretical Error Bound for Approximate Nearest Neighbor Search.', 'https://arxiv.org/abs/2405.12497')],
  },
  2025: {
    titulo: 'O vetor único entra em debate', quem: 'Orion Weller, Michael Boratko, Iftekhar Naim e Jinhyuk Lee',
    texto: [
      'Representar pergunta e documento por um único vetor facilita indexação e comparação. O trabalho de Weller e coautores estuda limitações desse paradigma e apresenta o benchmark LIMIT, com consultas simples que dificultam a recuperação de determinados subconjuntos relevantes. A discussão conecta representação, dimensão, aprendizado e o tipo de relevância que se quer recuperar.',
      'Não é uma prova de que todo documento longo seja impossível de representar, nem de que a interação tardia tenha nascido em 2025. ColBERT já usava múltiplos vetores em 2020. Em 2026, Wang e coautores demonstraram construções de capacidade geométrica para recuperação top-k e discutiram margens e aprendibilidade. A conclusão editorial deve, portanto, separar existência matemática de representações, facilidade de aprendê-las e qualidade em consultas reais.',
    ], legado: 'A representação precisa ser julgada junto com a tarefa e as hipóteses.',
    nota: 'Debate atualizado em 12/10/2026: os resultados de 2025 e 2026 dependem de hipóteses sobre escores, dimensão e margem. Não estabelecem uma impossibilidade universal para embeddings.',
    refs: [fonte('Weller et al. (2025; revisão de 2026). On the Theoretical Limitations of Embedding-Based Retrieval.', 'https://arxiv.org/abs/2508.21038'), fonte('Wang et al. (2026). R²ᵏ is Theoretically Large Enough for Embedding-based Top-k Retrieval.', 'https://arxiv.org/abs/2601.20844')],
  },
  2026: {
    titulo: 'Harpya e a transparência necessária', quem: 'Carlos Frederico Domínguez · Projeto Harpya',
    texto: [
      'O percurso chega à pergunta que orienta o Harpya: onde ainda existe espaço para eficiência que possa ser demonstrada? O projeto organiza caminhos de pesquisa sobre tokens, embeddings, atenção, pesos e recuperação vetorial, com equações, custos e testes que permitem contestar uma proposta.',
      'Essa é uma posição de pesquisa, não a afirmação de que modelos já alcançaram uma forma comprovada de metacognição, nem a promessa de superar a força bruta por uma única solução. A transparência está em expor hipóteses, distinguir arte prévia de contribuição própria e registrar tanto ganhos quanto resultados negativos. A história ajuda a formular testes melhores: matemática, software e hardware precisam ser avaliados no mesmo orçamento e no mesmo protocolo.',
    ], legado: 'Conhecimento transforma horizontes quando as hipóteses podem ser testadas.',
    refs: [fonte('Harpya. Manifesto, critérios e autoria do projeto.', '/sobre/'), fonte('Harpya. Caminhos de pesquisa e testes refutáveis.', '/estudos/')],
  },
};

export const aprofundamentoDe = (evento: Evento) => evento.tipo === 'eclipse' ? undefined : APROFUNDAMENTOS[evento.ano];

// Mantém os fragmentos já publicados e compartilhados.
export const slugEvento = (evento: Pick<Evento, 'ano' | 'titulo'>) =>
  `ev-${evento.ano}-${evento.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export const INTRODUCAO = 'A história da inteligência artificial é uma jornada de abstrações: de uma unidade lógica a representações que aprendem com bilhões de exemplos. Por trás dos marcos celebrados estão problemas matemáticos, tentativas que falharam e descobertas que tornaram o passo seguinte possível.';
