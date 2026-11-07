// Inventário editorial: candidatos e slots não são conteúdos publicados.
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const files = p => fs.readdirSync(path.join(root,p)).filter(n => n.endsWith('.json'));
const acervo = files('src/content/business/acervo').map(n => read(`src/content/business/acervo/${n}`));
const publicado = acervo.filter(a => a.status === 'publicado');
const tipo = (...tipos) => publicado.filter(a => tipos.includes(a.tipo)).length;
const artigos = read('curadoria/business/pesquisa-artigos-corretivo.json');
const pesquisaVideos = read('curadoria/business/pesquisa-videos-literatura-corretivo.json');
const norm = u => new URL(u).href.replace(/\/$/,'');
const existentes = new Set(publicado.filter(a=>['artigo','relatorio'].includes(a.tipo)).map(a => norm(a.url)));
const novos = artigos.itens.filter(a => !existentes.has(norm(a.url)));
const unique = (xs,k) => new Set(xs.map(k)).size;
if (unique(artigos.itens, a=>norm(a.url)) !== artigos.itens.length) throw Error('Artigo candidato duplicado na pesquisa');
if (unique(pesquisaVideos.videos, a=>a.id) !== pesquisaVideos.videos.length) throw Error('Vídeo candidato duplicado na pesquisa');
const canais = new Set(files('src/content/business/fontes').flatMap(n => read(`src/content/business/fontes/${n}`).canais ?? []).filter(c=>c.status==='aprovado').map(c=>c.id));
for (const v of pesquisaVideos.videos) {
 if (!canais.has(v.canal.channel_id_confirmado)) throw Error(`Canal não aprovado: ${v.id}`);
 if (v.revisao.revisao_integral || v.revisao.publicavel_como_material_revisado) throw Error(`Pesquisa não pode alegar revisão integral: ${v.id}`);
}
const markdownPublicados=dir=>fs.readdirSync(dir).filter(n=>n.endsWith('.md')&&/status:\s*["']?publicado/m.test(fs.readFileSync(path.join(dir,n),'utf8'))).length;
const jsonPublicados=dir=>files(dir).map(n=>read(`${dir}/${n}`)).filter(x=>x.status==='publicado');
const families = [
 {familia:'Vídeos',
 referencia:155, publicados:tipo('video')},
 {familia:'Artigos e relatórios', referencia:63, publicados:tipo('artigo','relatorio')},
 {familia:'Livros', referencia:58, publicados:tipo('livro')},
 {familia:'Notícias', referencia:23, publicados:tipo('noticia')},
 {familia:'Análises', referencia:1, publicados:tipo('analise')+markdownPublicados('src/content/business/analises')},
 {familia:'Guias de estudo',referencia:12,publicados:markdownPublicados('src/content/business/guias')},
 {familia:'Artigos Começando',referencia:4,publicados:jsonPublicados('src/content/business/serie').length},
 {familia:'Dossiês Aprendizado',referencia:10,publicados:jsonPublicados('src/content/business/aprendizado').length},
].map(x=>({...x,faltam_para_volume_original:Math.max(0,x.referencia-x.publicados)}));
const manifest = read('docs/corretivo/execucao-corretiva.json');
const bloqueios = [
 ...(tipo('video') < 3 ? ['Vídeos: os três destaques da home ainda não podem ser preenchidos.'] : []),
 ...['Iniciante','Intermediário','Avançado'].filter(n=>!publicado.some(a=>a.tipo==='video' && a.nivel===n)).map(n=>`Vídeos: nenhum registro publicado do nível ${n}.`),
 ...(tipo('noticia') < 8 ? ['Notícias: faltam matérias publicadas para preencher os oito destaques do template original.'] : []),
 ...(families.find(f=>f.familia==='Análises').publicados < 1 ? ['Análises: falta o texto que alimenta o card e o destaque ampliado.'] : []),
 ...manifest.pendencias.map(p=>p),
];
const report = {
 gerado_em:new Date().toISOString(), estado:'execucao_parcial', liberado_para_publicar:bloqueios.length===0,
 volume_original_e_referencia_nao_cota_automatica:true,
 referencia:'939e5f75d0bb7b0fc8028471a20c31b353204ba0', familias: families,
 diferencas_volume: families.filter(x=>x.faltam_para_volume_original).map(x=>`${x.familia}: diferença de ${x.faltam_para_volume_original} registros em relação ao volume original; não equivale a requisito do template.`),
 pesquisa:{artigos_candidatos:artigos.itens.length,artigos_urls_novas:novos.length,artigos_ja_no_acervo:artigos.itens.length-novos.length,
  videos_candidatos:pesquisaVideos.videos.length,canais_verificados:new Set(pesquisaVideos.videos.map(v=>v.canal.channel_id_confirmado)).size,
  duracao_video_segundos:pesquisaVideos.videos.reduce((s,v)=>s+v.duracao_segundos,0), videos_integralmente_revisados:0,
  livros_existentes_conferidos:pesquisaVideos.literatura.length},
 bloqueios,
};
if (process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
else {
 console.table(families);
 console.log(`Pesquisa: ${artigos.itens.length} artigos candidatos (${novos.length} URLs novas), ${pesquisaVideos.videos.length} vídeos candidatos e ${pesquisaVideos.literatura.length} livros existentes conferidos.`);
 console.log(report.liberado_para_publicar ? 'Completo para o critério de volume registrado.' : 'Correção incompleta. Publicação final não liberada por esta auditoria.');
 for(const msg of bloqueios) console.log(`- ${msg}`);
}
if(process.argv.includes('--require-complete') && bloqueios.length) process.exitCode=1;
