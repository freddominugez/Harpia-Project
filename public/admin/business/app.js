import { createGitHubClient } from '/admin/session.js';
import { REPO, decodeFile, importCandidate } from './model.js';
const client = createGitHubClient(), $ = id => document.getElementById(id);
let items = [], sources = new Map(), busy = false;
const tell = (text,error=false) => { $('message').textContent=text; $('message').dataset.error=String(error); };
const element = (tag,text) => { const node=document.createElement(tag);node.textContent=text;return node; };
function link(text,url) {
  const node=element('a',text);
  try { const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw Error();node.href=parsed.href;node.target='_blank';node.rel='noopener noreferrer'; } catch { node.removeAttribute('href'); }
  return node;
}
const read = async path => decodeFile(await client.api(`${REPO}/contents/${path}?ref=main`));
function lock(value) { busy=value;$('reload').disabled=value;$('login').disabled=value;for(const button of $('queue').querySelectorAll('button'))button.disabled=value; }
function render() {
  const query=$('query').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(), kind=$('kind').value;
  const filtered=items.filter(item=>(!kind||kind===item.tipo)&&`${item.titulo} ${sources.get(item.fonte)?.nome||item.fonte}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
  $('count').textContent=`${filtered.length} candidatos aguardando revisão.`;
  $('queue').replaceChildren(...filtered.map(item=>{
    const card=element('article',''), source=sources.get(item.fonte), title=element('h2',item.titulo), meta=element('small',`${item.tipo} · ${source?.nome||item.fonte} · ${item.data||'Data não confirmada'}`);
    const select=document.createElement('select'), label=element('label','Trilha para revisão');
    for(const [id,name] of Object.entries({fundamentos:'Fundamentos',consumidor:'Consumidor',estrategia:'Estratégia',marcas:'Marcas',clientes:'Clientes',crescimento:'Crescimento',mensuracao:'Mensuração',gestao:'Gestão'})){const option=element('option',name);option.value=id;select.append(option);}label.append(select);
    const button=element('button','Encaminhar como candidato ao CMS');button.type='button';button.disabled=busy;
    button.addEventListener('click',async()=>{if(busy)return;lock(true);tell('Encaminhando candidato…');try{await importCandidate(client.api,item,source,select.value);button.textContent='Encaminhado ao CMS';button.dataset.imported='true';tell('Rascunho criado. Complete a revisão na coleção Business do CMS.');}catch(error){tell(`${error.message} Confira o CMS antes de tentar novamente.`,true);}finally{lock(false);for(const saved of $('queue').querySelectorAll('[data-imported]'))saved.disabled=true;}});
    card.append(meta,title,link('Conferir original ↗',item.url),label,button);return card;
  }));
}
async function load() {
  if(busy)return;if(!client.hasToken()){$('login').hidden=false;return tell('Entre para consultar a fila no repositório.');}lock(true);tell('Consultando filas e fontes…');
  try{
    const [articles,videos,catalog,files]=await Promise.all([read('curadoria/business/candidatos.json'),read('curadoria/business/videos-candidatos.json'),read('curadoria/business/catalogo-proposto.json'),client.api(`${REPO}/contents/src/content/business/fontes?ref=main`)]);
    const loaded=await Promise.all(files.filter(f=>f.name.endsWith('.json')).map(async f=>[f.name.slice(0,-5),await read(f.path)]));sources=new Map(loaded);
    items=[...articles.itens,...videos.itens].filter(item=>item.status==='candidato');
    $('health').hidden=false;$('health').textContent=[...articles.fontes,...videos.fontes].map(f=>`${f.id}: ${f.status} (${f.itens} candidatos)`).join(' · ')||'Não há feeds ativos. A seleção manual continua pelo CMS.';
    $('catalog-state').textContent=`Estado: ${catalog.estado}. Preparado em ${catalog.preparado_em}.${catalog.aprovado_em ? ` Aprovado em ${catalog.aprovado_em}.` : ''}`;
    $('catalog').replaceChildren(...[...catalog.fontes,...catalog.canais,...catalog.livros].map(item=>{const card=element('article','');card.append(element('small',item.codigo),element('h3',item.nome||item.titulo),link('Consultar referência ↗',item.url));if(item.autores)card.append(element('p',item.autores));if(item.restricao)card.append(element('small',item.restricao));return card;}));
    render();tell('Fila carregada. Nenhum conteúdo foi publicado.');$('login').hidden=true;
  }catch(error){tell(error.status===404?'A fila Business ainda não está disponível nesta versão do repositório. Envie a construção antes de usar este painel.':error.message,true);if(error.status===401)$('login').hidden=false;}
  finally{lock(false);}
}
$('query').addEventListener('input',render);$('kind').addEventListener('change',render);$('reload').addEventListener('click',load);
$('login').addEventListener('click',async()=>{try{await client.login();await load();}catch(error){tell(error.message,true);}});
load();
