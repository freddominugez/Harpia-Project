import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBusinessPublication} from '../public/admin/business/editorial-validation.js';
import {readDrafts,publicationChanges} from '../public/admin/publicar/app.js';
const sources=fs.readdirSync('src/content/business/fontes').map(n=>({id:n.slice(0,-5),...JSON.parse(fs.readFileSync(`src/content/business/fontes/${n}`,'utf8'))}));
const original=JSON.parse(fs.readFileSync('src/content/business/acervo/marketing-moderno.json','utf8'));
const blob=(d,oid='a')=>({name:'material.json',type:'blob',object:{text:JSON.stringify(d),oid}});
test('Business seleciona aprovados e preserva revisão ao publicar',()=>{
 const rows=readDrafts(['candidato','em-revisao','aprovado'].map(status=>blob({...original,status},status)),'business/acervo',sources);
 assert.equal(rows.length,1);const changes=publicationChanges(rows,rows);
 assert.equal(JSON.parse(changes[0].content).revisor,original.revisor);
 assert.equal(JSON.parse(changes[0].content).status,'publicado');
});
test('Business bloqueia fonte suspensa e vídeo sem revisão integral',()=>{
 const rows=readDrafts([blob({...original,status:'aprovado'})],'business/acervo',sources.map(s=>({...s,status:'suspenso'})));
 assert.throws(()=>publicationChanges(rows,rows),/não aprovada/);
 const video=readDrafts([blob({...original,status:'aprovado',tipo:'video',revisao_integral:false})],'business/acervo',sources);
 assert.throws(()=>publicationChanges(video,video),/Vídeo publicado exige/);
});
test('Business bloqueia artigo incompleto da série e mudança concorrente',()=>{
 const d=JSON.parse(fs.readFileSync('src/content/business/serie/valor-e-mercado.json','utf8'));
 const rows=readDrafts([blob({...d,status:'aprovado',secoes:d.secoes.slice(0,1)})],'business/serie',sources);
 assert.throws(()=>publicationChanges(rows,rows),/secoes|texto completo/);
 const good=readDrafts([blob({...original,status:'aprovado'})],'business/acervo',sources);
 assert.throws(()=>publicationChanges(good,[{...good[0],oid:'changed'}]),/alterado/);
});

test('Guia impede referência fora da lista institucional aprovada',()=>{
 const guia={titulo:'Pergunta de pesquisa',resumo:'Uma pergunta concreta para investigar em marketing.',numero:1,trilha:'consumidor',status:'publicado',atualizado:'2026-11-06',fontes:['https://curso-sem-fonte.example/receita-de-crescimento']};
 assert.throws(()=>validateBusinessPublication('business/guias',guia,sources),/fora das fontes institucionais aprovadas/);
 guia.fontes=['https://www.ama.org/journal-of-marketing/'];
 assert.equal(validateBusinessPublication('business/guias',guia,sources),true);
});
