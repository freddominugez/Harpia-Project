import raw from '../../public/data/business-radar.json';
import type {CollectionEntry} from 'astro:content';
import type {RadarItem,SourceStatus} from './radar';
type Item={id:string;source_id:string;title:string;summary:string;url:string;published_at:string;verified_at:string;idioma:string};
const data=raw as {last_successful_at:string|null;checked_at:string;sources:Pick<SourceStatus,'id'|'status'|'item_count'|'checked_at'>[];items:Item[]};
export function businessRadar(fontes:CollectionEntry<'businessFontes'>[]) {
 const approved=new Map(fontes.filter(f=>f.data.status==='aprovado'&&f.data.escopos.includes('artigos')&&f.data.feed).map(f=>[f.id,f.data]));
 const items=data.items.filter(item=>{
  const source=approved.get(item.source_id);if(!source||typeof item.title!=='string'||item.title.length<8||item.title.length>190)return false;
  try{const u=new URL(item.url),date=Date.parse(item.published_at);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&source.hosts.includes(u.hostname)&&Number.isFinite(date)&&date<=Date.now()&&date>=Date.now()-45*86400000;}catch{return false;}
 }).map(item=>({...item,company:approved.get(item.source_id)!.nome,summary:'',topics:[],impact_score:0})) satisfies RadarItem[];
 const sources:SourceStatus[]=[...approved].map(([id,s])=>({id,nome:s.nome,site:s.url,canal:s.feed,status:data.sources.find(h=>h.id===id)?.status??'error',item_count:items.filter(i=>i.source_id===id).length,checked_at:data.sources.find(h=>h.id===id)?.checked_at??data.checked_at}));
 return {items,sources,lastSuccess:data.last_successful_at};
}
