// Uso: node scripts/comparar_paridade_tecnologia.mjs /caminho/baseline/dist [dist-atual] [relatorio.json]
// Compara o main renderizado. Não compara pixels nem o conteúdo dos arquivos CSS.
import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';
if(!process.argv[2])throw Error('Informe o diretório dist de uma baseline compilada com as mesmas dependências.');
const baseline=path.resolve(process.argv[2]),current=path.resolve(process.argv[3]??'dist');
const find=(n,tag)=>n.tagName===tag?n:(n.childNodes??[]).map(c=>find(c,tag)).find(Boolean);
const clean=n=>n.nodeName==='#text'?(n.value.trim()?['text',n.value.replace(/\s+/g,' ').trim()]:null):!n.tagName||n.tagName==='script'?null:[n.tagName,(n.attrs??[]).filter(a=>!a.name.startsWith('data-astro')).map(a=>[a.name,a.value.replace(/nc\d+([gr])/g,'ncID$1').replace(/\/_astro\/[^\s]+\.css/g,'/_astro/stylesheet.css')]),(n.childNodes??[]).map(clean).filter(Boolean)];
const reorderSources=n=>{
 if(!Array.isArray(n)||n[0]==='text')return n;
 const[tag,attrs,children]=n,kids=children.map(reorderSources);
 if(tag==='ol'&&attrs.some(a=>a[0]==='class'&&a[1]==='fontes-lista'))kids.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return[tag,attrs,kids];
};
const routes=['analises/computacao-quantica-util-parte-1','estudos','origens','aprendizado','comecando','comecando/proxima-palavra','estudos/a-ideia-mais-interessante','tecnologia','videos','biblioteca','analises','forum','news','noticias','equacoes','biblioteca/glossario','biblioteca/fontes','sobre','estudos/caminhos/certificado-inteiro'];
const resultados=routes.map(route=>{
 const before=clean(find(parse(fs.readFileSync(path.join(baseline,route,'index.html'),'utf8')),'main'));
 const after=clean(find(parse(fs.readFileSync(path.join(current,route,'index.html'),'utf8')),'main'));
 const igual=JSON.stringify(before)===JSON.stringify(after);
 return{route:`/${route}/`,dom_textos_atributos_preservados:igual,...(!igual&&route==='biblioteca/fontes'?{mesmos_itens_e_estrutura_ignorando_ordem_da_lista:JSON.stringify(reorderSources(before))===JSON.stringify(reorderSources(after))}:{} )};
});
console.log(JSON.stringify(resultados,null,2));
if(process.argv[4])fs.writeFileSync(process.argv[4],JSON.stringify(resultados,null,2)+'\n');
if(resultados.some(r=>!r.dom_textos_atributos_preservados&&!r.mesmos_itens_e_estrutura_ignorando_ordem_da_lista))process.exitCode=1;
