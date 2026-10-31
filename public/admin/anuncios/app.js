import { createGitHubClient } from '/admin/session.js';
import { saveAd, validateAd } from './model.js';
const client = createGitHubClient();
const $ = id => document.getElementById(id);
const form = $('ad-form');
let sha = '', savedStatus = 'rascunho', busy = false, image;
let objectURL;
const value = name => form.elements.namedItem(name).value.trim();
const tell = (text, error = false) => { $('message').textContent = text; $('message').dataset.error = String(error); };
function lock(locked) { busy = locked; $('fields').disabled = locked || !sha; $('slot').disabled = locked; $('reload').disabled = locked || !client.hasToken(); }
function preview() {
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
    const file = await client.api(`/repos/freddominugez/Harpia-Project/contents/src/content/anuncios/${$('slot').value}.json?ref=main`);
    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, '')), c => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    sha = file.sha; savedStatus = data.status;
    for (const name of ['titulo', 'anunciante', 'texto', 'imagem', 'imagem_alt', 'url']) form.elements.namedItem(name).value = data[name] || '';
    image = undefined; $('upload').value = ''; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined; preview();
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
    image = undefined; $('upload').value = ''; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined; preview();
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
$('slot').addEventListener('change', load); $('reload').addEventListener('click', load);
form.addEventListener('input', preview);
form.addEventListener('submit', event => { event.preventDefault(); save('publicado'); });
$('draft').addEventListener('click', () => {
  if (savedStatus !== 'publicado' || confirm('Salvar como rascunho retira o anúncio atual desta posição. Continuar?')) save('rascunho');
});
$('remove').addEventListener('click', () => { if (confirm('Retirar o anúncio desta posição do site?')) save('rascunho'); });
$('upload').addEventListener('change', async () => {
  image = undefined;
  const file = $('upload').files[0];
  if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined;
  if (!file) return preview();
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[file.type];
  if (!extension || file.size > 2 * 1024 * 1024) { $('upload').value = ''; preview(); return tell('Escolha uma imagem PNG, JPG ou WebP de até 2 MB.', true); }
  lock(true);
  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width > 6000 || bitmap.height > 6000) { bitmap.close(); throw new Error('A imagem deve ter no máximo 6000 pixels por lado.'); }
    bitmap.close();
    const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
    image = { extension, base64 }; objectURL = URL.createObjectURL(file); preview(); tell('Imagem pronta. Clique em Publicar anúncio para enviar.');
  } catch { $('upload').value = ''; tell('Não foi possível ler a imagem. Use um arquivo PNG, JPG ou WebP válido.', true); }
  finally { lock(false); }
});
lock(false); load();
