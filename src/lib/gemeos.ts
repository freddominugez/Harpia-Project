// Monta o markdown de cada página: cabeçalho de citação + corpo do registro (src/lib/rotas.ts).
import { SITE } from "../config";
import { abs, type Rota } from "./rotas";

export function citacao(r: Rota) {
  const ano = r.atualizado.slice(0, 4);
  return `${SITE.autor} (${ano}). ${r.titulo}. ${SITE.nome}. ${abs(r.path)}`;
}

export function gemeo(r: Rota) {
  const titulo = r.path === "/" ? SITE.nome : r.titulo;
  return [
    `# ${titulo}`,
    `> ${r.descricao}`,
    [
      `- Página: ${abs(r.path)}`,
      `- Autor: ${SITE.autor}`,
      `- Atualizado em: ${r.atualizado}`,
      `- Licença: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)`,
      `- Como citar: ${citacao(r)}`,
    ].join("\n"),
    r.markdown().trim(),
    "",
  ].join("\n\n");
}
