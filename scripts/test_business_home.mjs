import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'parse5';
const attrs=n=>Object.fromEntries((n.attrs??[]).map(a=>[a.name,a.value]));
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes??[]).flatMap(x=>all(x,p))];
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes??[]).map(text).join('');
const hasClass=(n,c)=>(attrs(n).class??'').split(' ').includes(c);
const doc=parse(fs.readFileSync('dist/business/index.html','utf8'));
test('landing Business apresenta resumos legíveis nos três guias e nas seis referências',()=>{
 const guides=all(doc,n=>hasClass(n,'ref-article'));
 assert.equal(guides.length,3);
 for(const card of guides){const paragraphs=all(card,n=>n.tagName==='p');assert.ok(paragraphs.some(n=>text(n).trim().length>=250));}
 const papers=all(doc,n=>hasClass(n,'paper-card'));
 assert.equal(papers.length,6);
 for(const card of papers){const summary=all(card,n=>hasClass(n,'paper-summary'));assert.equal(summary.length,1);assert.ok(text(summary[0]).trim().length>=120);}
 const hero=all(doc,n=>hasClass(n,'ref-hero-copy'))[0];const lead=all(hero,n=>n.tagName==='p')[0];assert.ok(text(lead).trim().split(/\s+/).length>=45);
});
test('cadastros editoriais continuam fora do radar automático e não vazam como matérias publicadas',()=>{
 const radar=JSON.parse(fs.readFileSync('public/data/business-radar.json'));
 assert.equal(radar.publication_policy,'trusted_institutional_rss_metadata_only');
 for(const item of radar.items){assert.equal(item.summary,'');assert.equal(item.status,undefined);}
 const cards=all(doc,n=>hasClass(n,'official-news'));
 assert.ok(cards.length>0);assert.ok(text(doc).includes('Última coleta com dados verificados'));
});
