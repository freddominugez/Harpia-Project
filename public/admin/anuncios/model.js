export const SLOTS = ['topo', 'lateral-esquerda', 'lateral-direita'];
const REPO = '/repos/freddominugez/Harpia-Project';
export function validateAd(data) {
  for (const [field, limit] of Object.entries({ titulo: 80, anunciante: 100, texto: 240, imagem_alt: 160 })) {
    if (typeof data[field] !== 'string' || data[field].length > limit) throw new Error(`Confira o campo ${field} (até ${limit} caracteres).`);
  }
  if (!['publicado', 'rascunho'].includes(data.status)) throw new Error('Status inválido.');
  if (typeof data.url !== 'string' || (data.url && !/^https:\/\//.test(data.url))) throw new Error('O link do anúncio deve começar com https://.');
  if (data.url) { try { new URL(data.url); } catch { throw new Error('Link do anúncio inválido.'); } }
  if (typeof data.imagem !== 'string' || (data.imagem && !/^https:\/\//.test(data.imagem) && !/^\/img\/anuncios\/[A-Za-z0-9._-]+$/.test(data.imagem))) throw new Error('Use uma imagem HTTPS ou envie um arquivo.');
  if (data.status === 'publicado' && (!data.titulo.trim() || !data.anunciante.trim() || (data.imagem && !data.imagem_alt.trim()))) throw new Error('Preencha título, anunciante e descrição da imagem antes de publicar.');
  return data;
}

export async function saveAd(api, slot, data, expectedSha, image, { branch = 'main' } = {}) {
  if (!SLOTS.includes(slot)) throw new Error('Posição de anúncio inválida.');
  const path = `src/content/anuncios/${slot}.json`;
  const saved = { ...data };
  let uploaded;
  if (image) {
    if (!['png', 'jpg', 'webp'].includes(image.extension) || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.base64) || image.base64.length > 2800000) throw new Error('Imagem inválida ou maior que 2 MB.');
    const filename = `${slot}-${crypto.randomUUID()}.${image.extension}`;
    saved.imagem = `/img/anuncios/${filename}`;
    uploaded = { path: `public${saved.imagem}`, mode: '100644', type: 'blob' };
  }
  validateAd(saved);
  for (let attempt = 0; attempt < 3; attempt++) {
    const head = await api(`${REPO}/git/ref/heads/${branch}`);
    const revision = head.object.sha;
    const current = await api(`${REPO}/contents/${path}?ref=${revision}`);
    if (current.sha !== expectedSha) throw new Error('Este anúncio foi alterado em outra janela. Recarregue a posição e revise antes de salvar.');
    if (uploaded && !uploaded.sha) {
      const blob = await api(`${REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: image.base64, encoding: 'base64' }) });
      uploaded.sha = blob.sha;
    }
    const parent = await api(`${REPO}/git/commits/${revision}`);
    const files = [{ path, mode: '100644', type: 'blob', content: `${JSON.stringify(saved, null, 2)}\n` }, ...(uploaded ? [uploaded] : [])];
    const tree = await api(`${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree: files }) });
    const commit = await api(`${REPO}/git/commits`, { method: 'POST', body: JSON.stringify({ message: `Painel: ${saved.status === 'publicado' ? 'publica' : 'salva rascunho de'} anúncio ${slot}`, tree: tree.sha, parents: [revision] }) });
    try {
      await api(`${REPO}/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
      const latest = await api(`${REPO}/contents/${path}?ref=${commit.sha}`);
      return { data: saved, sha: latest.sha };
    } catch (error) {
      if (![409, 422].includes(error.status) || attempt === 2) throw error;
      const latest = await api(`${REPO}/git/ref/heads/${branch}`);
      if (latest.object.sha === revision) throw error;
    }
  }
}
