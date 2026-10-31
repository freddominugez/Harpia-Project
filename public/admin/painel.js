const nav = document.querySelector('.admin-tools');
const tools = { anuncios: ['Gerenciador de anúncios', '/admin/anuncios/'], publicar: ['Publicar conteúdos', '/admin/publicar/'], divulgacao: ['Divulgação', '/admin/divulgacao/'], radar: ['Radar IA', '/admin/radar/'] };
const frames = new Map();
function openTool(tool, updateURL = true) {
  if (tool !== 'conteudos' && !Object.hasOwn(tools, tool)) tool = 'conteudos';
  for (const [name, frame] of frames) frame.hidden = name !== tool;
  if (tool !== 'conteudos' && !frames.has(tool)) {
    const frame = document.createElement('iframe');
    frame.className = 'admin-tool-frame'; frame.title = tools[tool][0]; frame.src = tools[tool][1];
    document.body.append(frame); frames.set(tool, frame);
  }
  for (const button of nav.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
  if (updateURL) {
    const url = new URL(location.href);
    if (tool === 'conteudos') url.searchParams.delete('ferramenta'); else url.searchParams.set('ferramenta', tool);
    history.pushState({}, '', url);
  }
}
nav.addEventListener('click', event => {
  const button = event.target.closest('button[data-tool]');
  if (!button) return;
  event.preventDefault(); event.stopImmediatePropagation(); openTool(button.dataset.tool);
}, true);
window.addEventListener('popstate', () => openTool(new URL(location.href).searchParams.get('ferramenta') || 'conteudos', false));
openTool(new URL(location.href).searchParams.get('ferramenta') || 'conteudos', false);
