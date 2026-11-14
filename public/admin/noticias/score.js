// Nota de qualidade das NotícIAs (0 a 100) e escolha das melhores.
// Módulo puro, usado pela página /admin/noticias/ e pelo robô scripts/publicar_noticias.mjs:
// os dois mostram e aplicam exatamente a mesma conta.

export const NOTA_MINIMA = 60; // abaixo disso o robô não publica sozinho
export const POR_DIA = 2;
export const VALIDADE_DIAS = 21; // fato mais antigo que isso deixa de ser notícia

const DIA = 86400000;
const dias = (de, ate) => Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA);

export function dominio(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

// Fonte primária: quem produziu o fato (governo, universidade, organismo, artigo, repositório).
const PRIMARIAS = [
  /(^|\.)gov(\.[a-z]{2})?$/, /(^|\.)edu(\.[a-z]{2})?$/, /(^|\.)ac\.[a-z]{2}$/, /(^|\.)jus\.br$/, /(^|\.)leg\.br$/, /(^|\.)mil\.br$/,
  /(^|\.)europa\.eu$/, /(^|\.)unesco\.org$/, /(^|\.)oecd\.org$/, /(^|\.)un\.org$/, /(^|\.)who\.int$/,
  /(^|\.)arxiv\.org$/, /(^|\.)doi\.org$/, /(^|\.)openreview\.net$/, /(^|\.)aclanthology\.org$/, /(^|\.)nature\.com$/,
  /(^|\.)science\.org$/, /(^|\.)acm\.org$/, /(^|\.)ieee\.org$/, /(^|\.)github\.com$/, /(^|\.)huggingface\.co$/,
  /(^|\.)fiocruz\.br$/, /(^|\.)usp\.br$/, /(^|\.)unicamp\.br$/,
];
export const fontePrimaria = (url) => { const d = dominio(url); return Boolean(d) && PRIMARIAS.some((r) => r.test(d)); };

const ATRIBUICAO = /\b(segundo|de acordo com|conforme|afirm\w+|declar\w+|inform\w+|diz|dizem|disse|relat\w+|publicou|publicaram|divulg\w+|anunci\w+|mediu|mediram|estim\w+)\b/gi;
const CAUTELA = /\b(não foi verificad\w+|sem verificação|ainda não|não há|não mede|amostra|limit\w+|ressalva\w*|incerte\w+|independente\w*|por terceiros|não confirm\w+|falta\w*|porém|no entanto|mas)\b/gi;
const PROMOCIONAL = /\b(revolucion\w+|incrível|incríveis|impressionante\w*|disruptiv\w+|inovador\w*|surpreendente\w*|fantástic\w+|extraordinári\w+|imperdível|game[- ]changer|de ponta|sem precedentes)\b/gi;
const NUMEROS = /\d+(?:[.,]\d+)*\s?%?/g;

const faixa = (valor, degraus) => { for (const [limite, pontos] of degraus) if (valor >= limite) return pontos; return 0; };
const contar = (texto, regex) => (texto.match(regex) ?? []).length;

/**
 * Pontua uma notícia. `publicadas` são as notícias já no ar (para variedade e repetição).
 * Devolve { total, criterios: [{ id, nome, pontos, max, nota }], bloqueios: [texto] }.
 * Com bloqueio, o robô não publica, qualquer que seja a nota.
 */
export function pontuar(noticia, { hoje, publicadas = [] } = {}) {
  const corpo = Array.isArray(noticia.corpo) ? noticia.corpo : [];
  const fontes = Array.isArray(noticia.fontes) ? noticia.fontes : [];
  const texto = corpo.join('\n');
  const tudo = [noticia.titulo, noticia.resumo, texto, noticia.harpia].filter(Boolean).join('\n');
  const criterios = [];
  const bloqueios = [];
  const criterio = (id, nome, pontos, max, nota) => criterios.push({ id, nome, pontos: Math.max(0, Math.min(max, pontos)), max, nota });

  // 1. Fontes (30): quantos veículos independentes e se há fonte primária.
  const dominios = new Set(fontes.map((f) => dominio(f.url)).filter(Boolean));
  const primarias = fontes.filter((f) => fontePrimaria(f.url)).length;
  const pFontes = faixa(dominios.size, [[3, 20], [2, 15], [1, 8]]) + (primarias ? 10 : 0);
  criterio('fontes', 'Fontes', pFontes, 30,
    `${dominios.size} veículo${dominios.size === 1 ? '' : 's'} independente${dominios.size === 1 ? '' : 's'}${primarias ? `, ${primarias} fonte${primarias === 1 ? '' : 's'} primária${primarias === 1 ? '' : 's'}` : ', sem fonte primária'}`);
  if (!fontes.length) bloqueios.push('Sem fonte.');
  if (fontes.some((f) => !/^https:\/\//i.test(f.url ?? ''))) bloqueios.push('Fonte sem endereço https.');

  // 2. Atualidade (20): distância entre a data do fato e hoje.
  const idade = noticia.data && hoje ? dias(noticia.data, hoje) : NaN;
  const pIdade = Number.isFinite(idade) && idade >= 0 ? faixa(-idade, [[-2, 20], [-4, 16], [-7, 12], [-10, 8], [-14, 5], [-VALIDADE_DIAS, 2]]) : 0;
  criterio('atualidade', 'Atualidade', pIdade, 20, Number.isFinite(idade) ? (idade === 0 ? 'fato de hoje' : idade < 0 ? 'data no futuro' : `fato de ${idade} dia${idade === 1 ? '' : 's'} atrás`) : 'sem data');
  if (!Number.isFinite(idade)) bloqueios.push('Sem data válida.');
  else if (idade < 0) bloqueios.push('Data no futuro.');
  else if (idade > VALIDADE_DIAS) bloqueios.push(`Fato de ${idade} dias atrás (limite: ${VALIDADE_DIAS}).`);

  // 3. Substância (20): tamanho do texto e dados que dá para conferir.
  const numeros = contar(texto, NUMEROS);
  const pSubstancia = faixa(corpo.length, [[4, 7], [3, 5], [2, 2]]) + faixa(texto.length, [[1100, 7], [800, 5], [500, 3]]) + faixa(numeros, [[6, 6], [3, 4], [1, 2]]);
  criterio('substancia', 'Substância', pSubstancia, 20, `${corpo.length} parágrafos, ${texto.length} caracteres, ${numeros} números ou datas`);

  // 4. Rigor (15): atribui as afirmações, registra limites e evita tom de propaganda.
  const atribuicoes = contar(texto, ATRIBUICAO);
  const cautelas = contar(tudo, CAUTELA);
  const promocionais = contar(tudo, PROMOCIONAL);
  const pRigor = faixa(atribuicoes, [[3, 6], [2, 4], [1, 2]]) + faixa(cautelas, [[2, 5], [1, 3]]) + (promocionais ? 0 : 4);
  criterio('rigor', 'Rigor', pRigor, 15,
    `${atribuicoes} atribuiç${atribuicoes === 1 ? 'ão' : 'ões'}, ${cautelas} ressalva${cautelas === 1 ? '' : 's'}${promocionais ? `, ${promocionais} termo${promocionais === 1 ? '' : 's'} promociona${promocionais === 1 ? 'l' : 'is'}` : ''}`);

  // 5. Forma (10): regras de texto do projeto.
  const travessao = /[—–]/.test(tudo);
  const titulo = (noticia.titulo ?? '').length;
  const resumo = (noticia.resumo ?? '').length;
  const harpia = (noticia.harpia ?? '').length;
  const pForma = (travessao ? 0 : 3) + (titulo >= 40 && titulo <= 120 ? 2 : 0) + (resumo >= 100 ? 2 : 0) + (harpia >= 120 ? 3 : harpia >= 80 ? 1 : 0);
  criterio('forma', 'Forma', pForma, 10, [travessao ? 'tem travessão' : 'sem travessão', `título com ${titulo} caracteres`, `"por que importa" com ${harpia}`].join(', '));

  // 6. Variedade (5): tema pouco visto entre as últimas publicadas.
  const recentes = [...publicadas].sort((a, b) => String(b.data).localeCompare(String(a.data))).slice(0, 6);
  const mesmoTema = recentes.filter((p) => p.categoria === noticia.categoria).length;
  criterio('variedade', 'Variedade', faixa(-mesmoTema, [[0, 5], [-1, 4], [-2, 2], [-3, 1]]), 5, `${mesmoTema} das últimas ${recentes.length} publicadas são do mesmo tema`);

  // Repetição: mesma fonte de uma notícia que já está no ar.
  const noAr = new Set(publicadas.flatMap((p) => (p.fontes ?? []).map((f) => f.url)));
  if (fontes.some((f) => noAr.has(f.url))) bloqueios.push('Usa a mesma fonte de uma notícia já publicada.');

  return { total: criterios.reduce((soma, c) => soma + c.pontos, 0), criterios, bloqueios };
}

/**
 * Ordena os rascunhos pela nota e escolhe os `quantidade` melhores para publicar.
 * `itens` são { slug, ...noticia }. Só entra quem não tem bloqueio e alcança `minimo`.
 * Entre os escolhidos do dia, evita repetir tema enquanto houver outro apto a até 5 pontos.
 */
export function escolher(itens, { hoje, quantidade = POR_DIA, minimo = NOTA_MINIMA, excluir = [] } = {}) {
  const fora = new Set(excluir);
  const publicadas = itens.filter((i) => i.status === 'publicado');
  const fila = itens.filter((i) => i.status === 'rascunho')
    .map((item) => ({ item, ...pontuar(item, { hoje, publicadas }) }))
    .map((r) => ({ ...r, apto: !r.bloqueios.length && r.total >= minimo && !fora.has(r.item.slug) }))
    .sort((a, b) => b.total - a.total || String(b.item.data).localeCompare(String(a.item.data)) || a.item.slug.localeCompare(b.item.slug));
  const aptos = fila.filter((r) => r.apto);
  const escolhidos = [];
  while (escolhidos.length < quantidade && escolhidos.length < aptos.length) {
    const restantes = aptos.filter((r) => !escolhidos.includes(r));
    const temas = new Set(escolhidos.map((r) => r.item.categoria));
    const melhor = restantes[0];
    const variado = restantes.find((r) => !temas.has(r.item.categoria) && melhor.total - r.total <= 5);
    escolhidos.push(variado ?? melhor);
  }
  return { fila, escolhidos };
}
