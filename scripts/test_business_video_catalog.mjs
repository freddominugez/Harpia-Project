import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'parse5';
import {validateBusinessPublication} from '../public/admin/business/editorial-validation.js';
const load=dir=>fs.readdirSync(dir).filter(n=>n.endsWith('.json')).map(n=>({id:n.slice(0,-5),...JSON.parse(fs.readFileSync(`${dir}/${n}`,'utf8'))}));
const sources=load('src/content/business/fontes');
const videos=load('src/content/business/acervo').filter(v=>v.tipo==='video'&&v.status==='publicado');
const attrs=n=>Object.fromEntries((n.attrs??[]).map(a=>[a.name,a.value]));
const findAll=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes??[]).flatMap(x=>findAll(x,p))];
test('catálogo Business oferece ao menos 50 vídeos únicos das fontes também aprovadas para artigos',()=>{
 assert.ok(videos.length>=50,`Apenas ${videos.length} vídeos publicados`);
 assert.equal(new Set(videos.map(v=>v.video_id)).size,videos.length);
 assert.equal(new Set(videos.map(v=>v.url)).size,videos.length);
 for(const v of videos){
  const source=sources.find(s=>s.id===v.fonte);
  assert.equal(source?.status,'aprovado',v.id);
  assert.ok(source.escopos.includes('artigos')&&source.escopos.includes('videos'),v.id);
  assert.ok(source.canais.some(c=>c.status==='aprovado'&&c.id===v.channel_id),v.id);
  assert.equal(validateBusinessPublication('business/acervo',v,sources),true,v.id);
  assert.equal(v.revisao_escopo,'fonte_e_contexto');assert.equal(v.revisao_integral,false);
 }
 assert.ok(videos.some(v=>v.idioma==='pt'));assert.ok(videos.some(v=>v.idioma==='en'));
 for(const nivel of ['Iniciante','Intermediário','Avançado'])assert.ok(videos.some(v=>v.nivel===nivel),nivel);
});
test('cards, fichas, miniaturas e busca incluem todos os vídeos sem carregar o player antecipadamente',()=>{
 const catalog=parse(fs.readFileSync('dist/business/videos/index.html','utf8'));
 const cards=findAll(catalog,n=>n.tagName==='a'&&(attrs(n).class??'').split(' ').includes('vcard'));
 assert.equal(cards.length,videos.length);
 const links=new Set(cards.map(n=>attrs(n).href));
 const search=JSON.parse(fs.readFileSync('dist/business/busca.json','utf8'));
 for(const v of videos){
  const route=`/business/leituras/${v.id}/`;
  assert.ok(links.has(route),v.id);assert.ok(search.some(x=>x.url===route),v.id);
  const page=fs.readFileSync(`dist${route}index.html`,'utf8');
  const doc=parse(page);
  assert.ok(findAll(doc,n=>attrs(n)['data-video-id']===v.video_id).length,v.id);
  assert.equal(findAll(doc,n=>n.tagName==='iframe').length,0,v.id);
  assert.ok(page.includes(v.url)&&page.includes('conteúdo audiovisual integral não foi revisado'),v.id);
 }
 const home=parse(fs.readFileSync('dist/business/index.html','utf8'));
 const homeVideos=findAll(home,n=>n.tagName==='a'&&(attrs(n).class??'').split(' ').includes('vlist-item'));
 assert.equal(homeVideos.length,3);
 assert.equal(new Set(homeVideos.map(n=>attrs(n).href)).size,3);
});
test('seleção institucional não aceita instituição aprovada somente para vídeo',()=>{
 const source=sources.find(s=>s.id==='hbs');assert.ok(source&&!source.escopos.includes('artigos'));
 const original=videos[0];assert.ok(original);
 const video={...original,fonte:source.id,channel_id:source.canais[0].id,evidencias_revisao:[original.url,source.canais[0].url]};
 assert.throws(()=>validateBusinessPublication('business/acervo',video,sources),/canal institucional aprovado/);
});
