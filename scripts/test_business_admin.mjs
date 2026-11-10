import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCandidate, importCandidate, decodeFile, encodeFile } from '../public/admin/business/model.js';
const source={status:'aprovado',hosts:['hbr.org'],idioma:'en'};
const item={id:'123',ambiente:'business',status:'candidato',tipo:'artigo',titulo:'Customer strategy and evidence',url:'https://hbr.org/example',fonte:'hbr',data:'2026-11-01'};
test('encaminhamento cria candidato sem alegar revisão ou autoria',()=>{
  const data=prepareCandidate(item,source,'estrategia');assert.equal(data.status,'candidato');assert.equal(data.revisao_integral,false);assert.equal(data.revisor,'');assert.equal(decodeFile({content:encodeFile(data)}).titulo,data.titulo);
});
test('encaminhamento bloqueia fonte suspensa, domínio externo e canal proposto',()=>{
  for(const [i,s] of [[item,{...source,status:'suspenso'}],[{...item,url:'https://evil.example/article'},source],[{...item,url:'https://user:pass@hbr.org/example'},source],[{...item,tipo:'video',url:'https://www.youtube.com/watch?v=abcdefghijk',video_id:'abcdefghijk',channel_id:'UCWo4IA01TXzBeGJJKWHOG9g'},{...source,escopos:['videos'],canais:[{id:'UCWo4IA01TXzBeGJJKWHOG9g',status:'proposto'}]}]])assert.throws(()=>prepareCandidate(i,s,'estrategia'));
});
test('atualização concorrente não força a branch nem afirma sucesso',async()=>{
  const calls=[];
  const api=async(path,options)=>{calls.push({path,options});
    if(path.endsWith('/git/ref/heads/main'))return {object:{sha:'head'}};
    if(path.endsWith('/git/commits/head'))return {tree:{sha:'tree'}};
    if(path.includes('/git/trees/tree?'))return {tree:[],truncated:false};
    if(options?.method==='PATCH'){assert.equal(JSON.parse(options.body).force,false);throw Error('Conflict');}
    return {sha:'new-object'};
  };
  await assert.rejects(importCandidate(api,item,source,'estrategia'),/Conflict/);
  const blob=JSON.parse(calls.find(c=>c.path.endsWith('/git/blobs')).options.body);
  assert.equal(decodeFile({content:blob.content}).status,'candidato');
});
