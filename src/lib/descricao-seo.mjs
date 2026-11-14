// Descrição para <meta name="description">, Open Graph e JSON-LD: uma linha só, entre 50 e 200 caracteres.
// Textos longos são cortados no fim de uma frase (ou de uma palavra); textos curtos ganham o título na frente.
export const DESCRICAO_MIN = 50;
export const DESCRICAO_MAX = 200;

export function descricaoSeo(texto, titulo = "") {
  let d = String(texto ?? "").replace(/\s+/g, " ").trim();
  const t = String(titulo ?? "").replace(/\s+/g, " ").trim();
  if (d.length < DESCRICAO_MIN && t && !d.toLowerCase().startsWith(t.toLowerCase())) {
    d = d ? `${t.replace(/[.:!?]+$/, "")}: ${d}` : t;
  }
  if (d.length <= DESCRICAO_MAX) return d;
  const janela = d.slice(0, DESCRICAO_MAX);
  const frase = Math.max(janela.lastIndexOf(". "), janela.lastIndexOf("? "), janela.lastIndexOf("! "));
  if (frase + 1 >= DESCRICAO_MIN) return janela.slice(0, frase + 1);
  const corte = d.slice(0, DESCRICAO_MAX - 1);
  const palavra = corte.lastIndexOf(" ");
  return `${(palavra >= DESCRICAO_MIN ? corte.slice(0, palavra) : corte).replace(/[\s,;:]+$/, "")}…`;
}
