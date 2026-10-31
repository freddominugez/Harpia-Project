import { createGitHubClient } from '/admin/session.js';
import { saveAd, validateAd, SLOTS } from './model.js';
import { create as createUpload } from './vendor/filepond-4.32.12/filepond.esm.min.js';
const client = createGitHubClient();
const $ = id => document.getElementById(id);
const form = $('ad-form');
let sha = '', savedStatus = 'rascunho', busy = false, image;
let objectURL, dirty = false;
const slotNames = { topo: 'Banner superior · 970 × 90', 'lateral-esquerda': 'Lateral esquerda · 300 × 250', 'lateral-direita': 'Lateral direita · 300 × 250' };
const pond = createUpload($('upload'), {
  credits: false, allowMultiple: false, instantUpload: false, allowProcess: false, allowPaste: false,
  labelIdle: 'Arraste uma imagem ou <span class="filepond--label-action">escolha um arquivo</span>',
  labelButtonRemoveItem: 'Remover imagem', labelFileLoading: 'Carregando', labelFileLoadError: 'Não foi possível ler a imagem',
  beforeAddFile: item => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(item.file.type) || item.file.size > 2 * 1024 * 1024) {
      tell('Escolha uma imagem PNG, JPG ou WebP de até 2 MB.', true); return false;
    }
    return true;
  },
  onaddfile: (error, item) => { if (!error) prepareImage(item.file); },
  onremovefile: () => { image = undefined; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined; preview(); }
});
const value = name => form.elements.namedItem(name).value.trim();
const tell = (text, error = false) => { $('message').textContent = text; $('message').dataset.error = String(error); };
function lock(locked) { busy = locked; $('fields').disabled = locked || !sha; $('slot').disabled = locked; $('reload').disabled = locked || !client.hasToken(); pond.disabled = locked || !sha; for (const button of $('ad-overview').querySelectorAll('button')) button.disabled = locked; }
function preview() {
  document.querySelector('.preview').dataset.slot = $('slot').value;
  $('preview-title').textContent = value('titulo') || 'Título do anúncio';
  $('preview-text').textContent = value('texto'); $('preview-advertiser').textContent = value('anunciante');
  const src = objectURL || value('imagem');
  $('preview-image').hidden = !src;
  if (src && (/^https:\/\//.test(src) || /^\/img\/anuncios\//.test(src) || src === objectURL)) $('preview-image').src = src;
  else $('preview-image').removeAttribute('src');
  $('preview-image').alt = value('imagem_alt');
}
async function load() {
  if (busy) return;
  if (!client.hasToken()) { $('login').hidden = false; return tell('Entre para editar e publicar os anúncios.'); }
  lock(true); tell('Carregando anúncio…');
  try {
    const records = await Promise.all(SLOTS.map(async slot => {
      const file = await client.api(`/repos/freddominugez/Harpia-Project/contents/src/content/anuncios/${slot}.json?ref=main`);
      const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, '')), c => c.charCodeAt(0));
      return { slot, file, data: JSON.parse(new TextDecoder().decode(bytes)) };
    }));
    $('ad-overview').replaceChildren(...records.map(({slot, data}) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ad-summary';
      button.dataset.slot = slot; button.setAttribute('aria-pressed', String(slot === $('slot').value));
      if (data.imagem && (/^https:\/\//.test(data.imagem) || /^\/img\/anuncios\/[A-Za-z0-9._-]+$/.test(data.imagem))) {
        const img = document.createElement('img'); img.src = data.imagem; img.alt = data.imagem_alt || data.titulo; button.append(img);
      }
      for (const [tag, text] of [['strong', slotNames[slot]], ['span', data.anunciante || 'Sem anunciante'], ['small', data.status === 'publicado' ? 'Publicado · clique para editar' : 'Rascunho · clique para editar']]) {
        const el = document.createElement(tag); el.textContent = text; button.append(el);
      }
      button.addEventListener('click', () => { if (canDiscard()) { $('slot').value = slot; previousSlot = slot; load(); } }); return button;
    }));
    const { file, data } = records.find(record => record.slot === $('slot').value);
    sha = file.sha; savedStatus = data.status;
    for (const name of ['titulo', 'anunciante', 'texto', 'imagem', 'imagem_alt', 'url']) form.elements.namedItem(name).value = data[name] || '';
    image = undefined; pond.removeFiles(); if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined; dirty = false; preview();
    tell(savedStatus === 'publicado' ? 'Anúncio publicado. Você pode atualizar ou retirar do site.' : 'Posição sem anúncio publicado. Preencha os campos e publique.');
  } catch (error) { sha = ''; tell(error.message, true); if (error.status === 401) $('login').hidden = false; }
  finally { lock(false); }
}
async function save(status) {
  if (busy || !sha) return;
  const data = Object.fromEntries(['titulo', 'anunciante', 'texto', 'imagem', 'imagem_alt', 'url'].map(name => [name, value(name)]));
  data.status = status;
  try { validateAd({ ...data, imagem: image ? '/img/anuncios/upload.png' : data.imagem }); }
  catch (error) { return tell(error.message, true); }
  lock(true); tell('Enviando anúncio…');
  try {
    const result = await saveAd(client.api, $('slot').value, data, sha, image);
    sha = result.sha; savedStatus = status; form.elements.namedItem('imagem').value = result.data.imagem;
    image = undefined; pond.removeFiles(); if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined; dirty = false; preview();
    for (const card of $('ad-overview').querySelectorAll('button')) if (card.dataset.slot === $('slot').value) { card.querySelector('small').textContent = status === 'publicado' ? 'Publicado · atualização enviada' : 'Rascunho · atualização enviada'; card.querySelector('span').textContent = data.anunciante || 'Sem anunciante'; let img = card.querySelector('img'); if (result.data.imagem) { if (!img) { img = document.createElement('img'); card.prepend(img); } img.src = result.data.imagem; img.alt = data.imagem_alt; } else img?.remove(); }
    tell(status === 'publicado' ? 'Anúncio enviado para publicação. Aguarde a atualização da hospedagem.' : 'Rascunho salvo. Esta posição ficará sem anúncio após a atualização do site.');
  } catch (error) { tell(`${error.message} A alteração não foi confirmada. Recarregue a posição para conferir.`, true); }
  finally { lock(false); }
}
$('login').addEventListener('click', async () => {
  $('login').disabled = true;
  try { await client.login(); $('login').hidden = true; await load(); }
  catch (error) { tell(error.message, true); }
  finally { $('login').disabled = false; }
});
let previousSlot = $('slot').value;
function canDiscard() { return !dirty || confirm('Descartar as alterações ainda não publicadas?'); }
$('slot').addEventListener('focus', () => { previousSlot = $('slot').value; });
$('slot').addEventListener('change', () => { if (canDiscard()) { previousSlot = $('slot').value; load(); } else $('slot').value = previousSlot; });
$('reload').addEventListener('click', () => { if (canDiscard()) load(); });
form.addEventListener('input', () => { dirty = true; preview(); });
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
form.addEventListener('submit', event => { event.preventDefault(); save('publicado'); });
$('draft').addEventListener('click', () => {
  if (savedStatus !== 'publicado' || confirm('Salvar como rascunho retira o anúncio atual desta posição. Continuar?')) save('rascunho');
});
$('remove').addEventListener('click', () => { if (confirm('Retirar o anúncio desta posição do site?')) save('rascunho'); });
async function prepareImage(file) {
  image = undefined;
  if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined;
  if (!file) return preview();
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[file.type];
  if (!extension || file.size > 2 * 1024 * 1024) { pond.removeFiles(); preview(); return tell('Escolha uma imagem PNG, JPG ou WebP de até 2 MB.', true); }
  lock(true);
  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width > 6000 || bitmap.height > 6000) { bitmap.close(); throw new Error('A imagem deve ter no máximo 6000 pixels por lado.'); }
    bitmap.close();
    const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
    image = { extension, base64 }; dirty = true; objectURL = URL.createObjectURL(file); preview(); tell('Imagem pronta. Clique em Publicar anúncio para enviar.');
  } catch { pond.removeFiles(); tell('Não foi possível ler a imagem. Use um arquivo PNG, JPG ou WebP válido.', true); }
  finally { lock(false); }
}
lock(false); load();
