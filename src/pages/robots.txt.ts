// robots.txt: busca e assistentes de IA liberados (decisão 5 do contrato), painel fechado.
// Um grupo próprio de user-agent substitui o grupo "*"; por isso cada grupo repete o Disallow.
import type { APIRoute } from "astro";

// Robôs de busca, de resposta acionada pelo usuário e de treino. Todos com acesso.
export const ROBOS_IA = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Applebot",
  "CCBot", "meta-externalagent", "Meta-WebIndexer", "Amazonbot",
  "DuckAssistBot", "MistralAI-User", "Bingbot",
];

export const GET: APIRoute = () => {
  const grupo = (ua: string) => `User-agent: ${ua}\nAllow: /\nDisallow: /admin/\n`;
  const corpo = [
    "# Harpya · https://www.harpya.org",
    "# Conteúdo CC BY 4.0. Citação com link para a página de origem é bem-vinda.",
    "# Índice para modelos de linguagem: https://www.harpya.org/llms.txt",
    "",
    grupo("*"),
    ...ROBOS_IA.map(grupo),
    "Sitemap: https://www.harpya.org/sitemap.xml",
    "",
  ].join("\n");
  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
