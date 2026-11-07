import complementos from './business-metodos.json';
export type BlocoBusiness = { titulo: string; texto: string; itens?: string[]; formula?: string; equacao?:string; exemplo?:string; referencias?:{titulo:string;url:string;alcance:string;limites:string}[] };
export const EDITORIAL_BUSINESS: Record<string, BlocoBusiness[]> = {
  origens: [
    { titulo: 'Da produção à compreensão do mercado', texto: 'O estudo do marketing envolve relações entre produção, distribuição, necessidades e trocas. Este percurso organiza perguntas para leitura histórica; não pretende estabelecer uma cronologia única nem atribuir a criação de uma ideia a uma pessoa isolada.', itens: ['Como tornar uma oferta disponível?', 'Que necessidades e alternativas orientam a decisão do cliente?', 'Como criar e sustentar valor ao longo do tempo?'] },
    { titulo: 'Escolas e perspectivas de administração', texto: 'Eficiência operacional, relações humanas, estratégia e aprendizagem organizacional iluminam problemas diferentes. Ao estudar uma escola, identifique a situação a que ela responde, o que observa e o que deixa de fora.' },
    { titulo: 'Da comunicação à evidência', texto: 'Pesquisa de consumidor, análise de dados e experimentos permitem investigar decisões de marketing. Ferramentas mudam; a necessidade de distinguir associação, explicação e efeito causal permanece.', itens: ['Leia uma obra no contexto de sua época.', 'Compare a tese com críticas e evidências posteriores.', 'Não apresente uma narrativa histórica como lei universal.'] },
  ],
  aprendizado: [
    { titulo: 'Comece por uma decisão', texto: 'Escolha um problema delimitado: melhorar a compreensão de uma oferta, entender uma desistência ou avaliar uma mudança de preço. Uma pergunta observável ajuda a escolher o método e a leitura.' },
    { titulo: 'Leia em cinco passos', texto: 'Antes de adotar uma conclusão, registre o caminho que a sustenta.', itens: ['Pergunta: o que o texto tenta explicar?', 'População: em quem, quando e onde o fenômeno foi observado?', 'Método: como os dados ou casos foram escolhidos?', 'Resultado: o que foi efetivamente encontrado?', 'Limites: o que a evidência não permite afirmar?'] },
    { titulo: 'Transforme leitura em aprendizagem', texto: 'Escreva uma hipótese local, indique uma observação capaz de contrariá-la e defina o próximo passo. Registre resultados inconclusivos e hipóteses rejeitadas; não escolha apenas exemplos que confirmam sua preferência.' },
  ],
  metricas: [
    { titulo: 'Margem de contribuição', texto: 'Indica o que resta da receita depois dos custos variáveis definidos no cálculo. A definição de custo e o período precisam ser consistentes. Não equivale ao lucro total da empresa.', formula: 'Margem de contribuição = receita líquida − custos e despesas variáveis' },
    { titulo: 'Custo de aquisição de clientes (CAC)', texto: 'Divida os gastos de aquisição definidos no período pelos novos clientes elegíveis. Considere o atraso entre investimento e aquisição e evite misturar clientes orgânicos com uma campanha específica sem explicar o critério.', formula: 'CAC = gastos de aquisição / número de novos clientes' },
    { titulo: 'Valor do cliente ao longo do tempo (CLV)', texto: 'Uma formulação geral considera a contribuição esperada em cada período, a probabilidade de o relacionamento permanecer e o desconto financeiro. Estime por coortes; não substitua margem por faturamento nem pressuponha retenção constante sem justificar.', formula: 'CLV = soma das contribuições futuras esperadas, descontadas ao presente' },
    { titulo: 'Retorno sobre gasto com anúncios (ROAS)', texto: 'Relaciona receita atribuída e gasto de mídia. Depende da regra de atribuição e não incorpora automaticamente margem, custos operacionais ou vendas que ocorreriam sem os anúncios.', formula: 'ROAS = receita atribuída / gasto com anúncios' },
    { titulo: 'Incrementalidade', texto: 'Pergunta qual diferença foi causada por uma intervenção em relação a um cenário comparável sem ela. Em um experimento randomizado bem executado, a diferença média entre grupos pode estimar esse efeito. Ajustes são necessários quando há escalas diferentes, interferência ou adesão incompleta.', formula: 'Efeito médio estimado = média do grupo tratado − média do grupo controle' },
    { titulo: 'Elasticidade de preço', texto: 'Relaciona variação percentual de quantidade e preço em condições especificadas. Uma correlação histórica pode refletir promoções, sazonalidade e concorrência, em vez de uma resposta causal isolada ao preço.', formula: 'Elasticidade = variação percentual da quantidade / variação percentual do preço' },
  ],
  'biblioteca/glossario': [
    { titulo: 'Segmentação', texto: 'Organização do mercado em grupos que ajudam a tomar decisões de oferta, atendimento, preço ou comunicação.' },
    { titulo: 'Posicionamento', texto: 'Escolha de como uma oferta pretende ser reconhecida em relação às alternativas relevantes para um público.' },
    { titulo: 'Proposta de valor', texto: 'Descrição do problema, do benefício oferecido e das condições que sustentam a promessa ao cliente.' },
    { titulo: 'Coorte', texto: 'Grupo definido por um evento ou período comum, como clientes adquiridos no mesmo mês, acompanhado ao longo do tempo.' },
    { titulo: 'Atribuição', texto: 'Distribuição de crédito por um resultado entre interações observadas, segundo uma regra ou modelo.' },
    { titulo: 'Incrementalidade', texto: 'Diferença entre o que acontece com uma intervenção e o que aconteceria em um cenário comparável sem ela.' },
    { titulo: 'Marketing mix modeling (MMM)', texto: 'Família de modelos que relaciona resultados agregados a investimentos e outras variáveis, com pressupostos e incertezas que precisam ser avaliados.' },
    { titulo: 'Pesquisa aplicada e análise executiva', texto: 'Pesquisa explicita um método de investigação. Análise executiva organiza interpretações e implicações para a gestão. Ambas podem ser úteis, mas oferecem tipos diferentes de evidência.' },
  ],
  analises: [
    { titulo: 'Uma leitura crítica tem endereço e limites', texto: 'As leituras desta seção permitem discutir a pergunta de um artigo, seu método e sua aplicação. Cada ficha identifica a publicação original e explicita os limites; a opinião editorial não é apresentada como resultado experimental.' },
    { titulo: 'Caso, correlação e causa', texto: 'Um caso ajuda a examinar mecanismos e contexto. Uma associação descreve padrões em dados. Uma afirmação causal exige um desenho que trate explicações concorrentes. Pergunte que evidência adicional mudaria sua interpretação.' },
  ],
  sobre: [
    { titulo: 'O que é o Harpya Business', texto: 'Um ambiente do projeto Harpya dedicado ao estudo de marketing, estratégia e administração. Compartilha a plataforma com Tecnologia e Matemática, com conteúdo, busca e curadoria próprios.' },
    { titulo: 'Régua editorial', texto: 'A instituição de origem é o início da triagem. Autoria, método, evidência, relevância e transparência decidem a seleção. Artigos acadêmicos, análises de consultoria, casos e jornalismo recebem identificação distinta. Acesso restrito é informado; o texto integral de terceiros não é republicado.' },
    { titulo: 'O que não entra', texto: 'Coaches, gurus, agências de marketing digital, promessas de resultado garantido, funis de venda de cursos e conteúdos sem fundamentação verificável. Uma entrevista com alguém de uma instituição conhecida não recebe aprovação automática.' },
    { titulo: 'Vídeos e podcasts', texto: 'O canal deve ter origem institucional comprovada e a autoria precisa estar identificada. A seleção institucional confere fonte, qualificação e contexto descrito pela instituição; não equivale a revisão audiovisual integral nem valida cada alegação. As fichas declaram o alcance da conferência. Somente materiais efetivamente revisados por inteiro podem receber essa indicação.' },
    { titulo: 'Como o conteúdo chega ao site', texto: 'A coleta automática alimenta uma fila de candidatos. A publicação exige revisão e justificativa. Falhas de fontes são registradas sem apagar o último conjunto válido. Guias de estudo são textos didáticos do Harpya e não alegam constituir pesquisa empírica.' },
    { titulo: 'Preferência e privacidade', texto: 'A escolha de ambiente fica no armazenamento local deste navegador, sem exigir conta. Use “Trocar ambiente” e “Redefinir preferência” para alterá-la. Links diretos respeitam o destino. O contador apresentado no rodapé é geral do portal. Os termos e as informações de privacidade institucionais permanecem disponíveis no rodapé.' },
  ],
};
const equacoesIniciais = [
  String.raw`MC=R_{\mathrm{liquida}}-C_{\mathrm{variaveis}}`,
  String.raw`CAC=\frac{G_{\mathrm{aquisicao}}}{N_{\mathrm{novos\ clientes}}}`,
  String.raw`CLV=\sum_{t=1}^{T}\frac{\mathbb{E}[M_t]}{(1+r)^t}`,
  String.raw`ROAS=\frac{R_{\mathrm{atribuida}}}{G_{\mathrm{midia}}}`,
  String.raw`\widehat{\tau}=\overline{Y}_{\mathrm{tratado}}-\overline{Y}_{\mathrm{controle}}`,
  String.raw`\varepsilon=\frac{\Delta Q/Q}{\Delta P/P}`,
];
EDITORIAL_BUSINESS.metricas = [...EDITORIAL_BUSINESS.metricas.map((b,i)=>({...b,equacao:equacoesIniciais[i]})),...complementos.metricas];
EDITORIAL_BUSINESS['biblioteca/glossario'].push(...complementos.glossario);
const mdTexto=(texto:string)=>texto.replaceAll('$','\\$');
export const markdownEditorial = (slug: string) => (EDITORIAL_BUSINESS[slug] ?? []).map(b => `## ${b.titulo}\n\n${mdTexto(b.texto)}${b.equacao ? `\n\n$$\n${b.equacao}\n$$` : ''}${b.formula ? `\n\n${mdTexto(b.formula)}` : ''}${b.exemplo ? `\n\n${mdTexto(b.exemplo)}` : ''}${b.itens ? `\n\n${b.itens.map(i => `- ${mdTexto(i)}`).join('\n')}` : ''}${b.referencias ? `\n\n${b.referencias.map(r=>`- [${r.titulo}](${r.url}). ${mdTexto(r.alcance)} ${mdTexto(r.limites)}`).join('\n')}` : ''}`).join('\n\n');
