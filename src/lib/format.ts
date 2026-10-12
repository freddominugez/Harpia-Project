// Datas no padrão do site.
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-10-12" → "12 out 2026" */
export function dataCurta(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${a}`;
}

/** "2026-10-12" → "12/10/2026" */
export function dataNumerica(iso: string): string {
  return iso.split("-").reverse().join("/");
}

export const ROTULO_ESTATUTO = { medido: "Medido", arte: "Arte prévia", lacuna: "Lacuna", teste: "Teste" } as const;
