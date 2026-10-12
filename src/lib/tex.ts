// Renderiza LaTeX em HTML no momento do build. Nenhum script de matemática roda no navegador.
import katex from "katex";

export function tex(src: string, display = false): string {
  return katex.renderToString(src, { displayMode: display, throwOnError: false, output: "html" });
}
