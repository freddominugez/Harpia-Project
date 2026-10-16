// Texto corrido com matemática, para conteúdos editados no painel.
// Blocos separados por linha em branco. Um bloco "$$ ... $$" vira equação em destaque;
// um bloco em que toda linha começa com "- " vira lista; o resto vira parágrafo.
// Dentro do texto: $...$ para matemática, **negrito** e *itálico*.
import { tex } from "./tex";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function marcas(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/** Uma linha: alterna texto e $matemática$. */
export function linha(s: string): string {
  return s
    .split(/(\$[^$]+\$)/g)
    .map((p) => (p.startsWith("$") && p.endsWith("$") && p.length > 2 ? tex(p.slice(1, -1), false) : marcas(p)))
    .join("");
}

/** Texto com parágrafos, listas e equações em bloco. */
export function rico(s: string | undefined): string {
  if (!s) return "";
  return s
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("$$") && b.endsWith("$$")) return `<div class="eqbox">${tex(b.slice(2, -2).trim(), true)}</div>`;
      const ls = b.split("\n").map((l) => l.trim());
      if (ls.every((l) => l.startsWith("- "))) return `<ul>${ls.map((l) => `<li>${linha(l.slice(2))}</li>`).join("")}</ul>`;
      return `<p>${linha(ls.join(" "))}</p>`;
    })
    .join("");
}

