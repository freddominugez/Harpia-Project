export const REPO = '/repos/freddominugez/Harpia-Project';
export function decodeFile(file) {
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, '')), c => c.charCodeAt(0))));
}
export function encodeFile(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2) + '\n');
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export function prepareCandidate(item, source, trail) {
  if (item.status !== 'candidato' || item.ambiente !== 'business' || !/^[a-z0-9-]{1,80}$/.test(item.fonte)) throw Error('Candidato inválido.');
  if (!source || source.status !== 'aprovado') throw Error('A fonte ainda não está aprovada.');
  if (!['fundamentos','consumidor','estrategia','marcas','clientes','crescimento','mensuracao','gestao'].includes(trail)) throw Error('Escolha uma trilha válida.');
  const url = new URL(item.url);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) throw Error('Endereço inválido.');
  const isVideo = item.tipo === 'video';
  if (isVideo) {
    if (!source.escopos?.includes('videos') || !/^[A-Za-z0-9_-]{11}$/.test(item.video_id || '') || url.hostname !== 'www.youtube.com' || url.pathname !== '/watch' || url.searchParams.get('v') !== item.video_id || !source.canais?.some(c => c.id === item.channel_id && c.status === 'aprovado')) throw Error('Canal de vídeo não aprovado.');
  } else if (item.tipo !== 'artigo' || !(source.escopos || ['artigos']).includes('artigos') || !source.hosts.includes(url.hostname)) throw Error('Domínio fora da lista editorial.');
  return {
    titulo: String(item.titulo).slice(0,300), resumo: 'Candidato a estudo; resumo e evidências aguardam revisão editorial.',
    fonte: item.fonte, url: url.href, tipo: isVideo ? 'video' : 'artigo', trilha: trail,
    autores: 'Autoria a confirmar', data: /^\d{4}-\d{2}-\d{2}$/.test(item.data || '') ? item.data : '', data_precisa: true,
    idioma: source.idioma, acesso: 'A conferir no original', evidencia: 'A classificar na revisão',
    limites: 'Conteúdo ainda não revisado; conferir o original antes de publicar.', status: 'candidato',
    justificativa: '', revisor: '', revisado_em: '', revisao_integral: false,
    ...(isVideo ? {video_id:item.video_id,channel_id:item.channel_id,nivel:'Iniciante',palestrante:'',credenciais:'',evidencias_revisao:[]} : {}),
  };
}
export async function importCandidate(api, item, source, trail) {
  const data = prepareCandidate(item, source, trail);
  // O hash da URL evita duplicação entre coletas e não usa o título como caminho.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.url));
  const id = `fila-${[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,20)}`;
  const path = `src/content/business/acervo/${id}.json`;
  const head = await api(`${REPO}/git/ref/heads/main`);
  const commit = await api(`${REPO}/git/commits/${head.object.sha}`);
  const tree = await api(`${REPO}/git/trees/${commit.tree.sha}?recursive=1`);
  if (tree.truncated) throw Error('Não foi possível verificar duplicações.');
  if (tree.tree.some(file => file.path === path)) throw Error('Este candidato já foi encaminhado ao CMS.');
  const blob = await api(`${REPO}/git/blobs`, {method:'POST',body:JSON.stringify({content:encodeFile(data),encoding:'base64'})});
  const nextTree = await api(`${REPO}/git/trees`, {method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:[{path,mode:'100644',type:'blob',sha:blob.sha}]})});
  const nextCommit = await api(`${REPO}/git/commits`, {method:'POST',body:JSON.stringify({message:`curadoria: encaminhar candidato Business ${id}`,tree:nextTree.sha,parents:[head.object.sha]})});
  // Sem force: uma alteração concorrente exige recarregar, sem sobrescrever conteúdo.
  await api(`${REPO}/git/refs/heads/main`, {method:'PATCH',body:JSON.stringify({sha:nextCommit.sha,force:false})});
  return id;
}
