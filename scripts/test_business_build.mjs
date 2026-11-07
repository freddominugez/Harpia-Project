// Verifica os limites entre os acervos e os links do build, sem chamadas externas.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
const root=path.resolve('dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const pages=[path.join(root,'index.html'),path.join(root,'tecnologia/index.html'),...walk(path.join(root,'business')).filter(p=>p.endsWith('.html'))];
const broken=[],dup=[],missing=[],h1=[],fragments=[],fragmentFailures=[],canonicalFailures=[];const pageIds=new Map();let references=0;
for(const file of pages){
 const doc=parse(fs.readFileSync(file,'utf8')),ids=new Set();let headingCount=0;
 function visit(node){
  const a=Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
  if(a.id){if(ids.has(a.id))dup.push({file,id:a.id});ids.add(a.id);}
  if(node.nodeName==='h1')headingCount++;
  for(const field of ['href','src'])if(a[field]?.startsWith('/')&&!a[field].startsWith('//')){
   const u=new URL(a[field],'https://www.harpya.org');const p=decodeURIComponent(u.pathname);if(p.startsWith('/api/')||p.startsWith('/auth'))continue;references++;
   let target=path.join(root,p);if(p.endsWith('/'))target=path.join(target,'index.html');if(field==='href'&&p.startsWith('/business/')&&u.hash)fragments.push({file,target,id:decodeURIComponent(u.hash.slice(1)),link:a[field]});if(!fs.existsSync(target))broken.push({page:file.replace(root,''),link:a[field]});
  }
  for(const child of node.childNodes||[])visit(child);
 }
 visit(doc);pageIds.set(file,ids);if(headingCount!==1)h1.push({file,headingCount});
 const source=fs.readFileSync(file,'utf8');if(!source.includes('rel="canonical"'))missing.push({file,meta:'canonical'});

}
const publicBusiness=walk(path.join(root,'business')).filter(p=>/\.(?:html|md|json|jsonld|xml|txt)$/.test(p)).map(p=>fs.readFileSync(p,'utf8')).join('\n');
for(const name of fs.readdirSync('src/content/business/acervo')){
 const item=JSON.parse(fs.readFileSync(path.join('src/content/business/acervo',name),'utf8'));
 if(item.status==='publicado')continue;
 const id=name.replace(/\.json$/,'');
 if(fs.existsSync(path.join(root,'business/leituras',id))||publicBusiness.includes('/leituras/'+id+'/')||(item.video_id&&publicBusiness.includes(item.video_id)))throw Error('Candidato vazou para acervo público: '+id);
}
for(const f of fragments)if(pageIds.has(f.target)&&!pageIds.get(f.target).has(f.id))fragmentFailures.push({page:f.file.replace(root,''),link:f.link});
const aliases=new Map([['/business/metricas/','/business/equacoes/'],['/business/biblioteca/livros/','/business/biblioteca/'],...fs.readdirSync('src/content/business/guias').filter(n=>n.endsWith('.md')).map(n=>{const id=n.slice(0,-3);return [`/business/estudos/${id}/`,`/business/estudos/caminhos/${id}/`]})]);
for(const [alias,canonical] of aliases){const html=fs.readFileSync(path.join(root,alias,'index.html'),'utf8');for(const attr of [`rel="canonical" href="https://www.harpya.org${canonical}"`,`property="og:url" content="https://www.harpya.org${canonical}"`])if(!html.includes(attr))canonicalFailures.push({alias,canonical,attr});}
const businessIndex=JSON.parse(fs.readFileSync(path.join(root,'business/busca.json')));
if(businessIndex.some(x=>aliases.has(x.url)))throw Error('Alias duplicado na busca');
if(businessIndex.some(x=>!x.url.startsWith('/business/')))throw Error('Busca mistura ambientes');
for(const item of businessIndex)if(!fs.existsSync(path.join(root,item.url,'index.html')))throw Error('Busca aponta para página ausente');
const techIndex=JSON.parse(fs.readFileSync(path.join(root,'busca.json')));
if(techIndex.some(x=>x.url.startsWith('/business/')))throw Error('Índice técnico contém Business');
const report={pages:pages.length,businessPages:pages.length-2,internalReferences:references,businessSearchItems:businessIndex.length,broken,duplicateIds:dup,headingFailures:h1,missingMeta:missing,fragmentReferences:fragments.length,fragmentFailures,aliasesChecked:aliases.size,canonicalFailures};
console.log(JSON.stringify(report,null,2));
if(process.env.BUSINESS_QA_REPORT)fs.writeFileSync(process.env.BUSINESS_QA_REPORT,JSON.stringify(report,null,2)+'\n');
if(broken.length||dup.length||h1.length||missing.length||fragmentFailures.length||canonicalFailures.length)process.exit(1);
