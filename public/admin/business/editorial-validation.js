import {businessGuiaSchema,businessAcervoSchema,businessSerieSchema,businessOrigensSchema,businessAprendizadoSchema,businessInvestigacaoSchema,businessAnaliseSchema} from './schemas.js';
const schemas={'business/guias':businessGuiaSchema,'business/acervo':businessAcervoSchema,'business/serie':businessSerieSchema,'business/origens':businessOrigensSchema,'business/aprendizado':businessAprendizadoSchema,'business/investigacoes':businessInvestigacaoSchema,'business/analises':businessAnaliseSchema};
export function validateBusinessPublication(collection,data,sources){
 const schema=schemas[collection];if(!schema)throw Error('Coleção Business sem validação de publicação.');
 const parsed=schema.safeParse({...data,status:'publicado'});
 if(!parsed.success)throw Error(parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));
 const allowed=(sources||[]).filter(s=>s.status==='aprovado');
 const hosts=new Set(allowed.flatMap(s=>s.hosts));
 const check=url=>{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||!hosts.has(u.hostname))throw Error('Referência fora das fontes institucionais aprovadas: '+u.hostname);};
 if(collection==='business/acervo'){
  const s=allowed.find(s=>s.id===data.fonte);if(!s)throw Error('Fonte institucional não aprovada.');const u=new URL(data.url);
  if(data.tipo==='video'){
   if(!s.escopos?.includes('videos')||u.hostname!=='www.youtube.com'||u.pathname!=='/watch'||u.searchParams.get('v')!==data.video_id||!s.canais?.some(c=>c.id===data.channel_id&&c.status==='aprovado'))throw Error('Vídeo sem canal institucional aprovado.');
  }else if(!s.hosts.includes(u.hostname)||!s.escopos?.includes(data.tipo==='livro'?'livros':'artigos'))throw Error('Formato ou domínio fora do escopo da fonte.');
  for(const url of data.referencias||[])check(url);
  return true;
 }
 const walk=value=>{if(Array.isArray(value)){for(const x of value)walk(x);}else if(value&&typeof value==='object'){for(const[k,v]of Object.entries(value)){if(k==='url'&&typeof v==='string')check(v);else if(k==='fontes'&&Array.isArray(v)&&v.every(x=>typeof x==='string'))v.forEach(check);else walk(v);}}};
 walk(data);return true;
}
