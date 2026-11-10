import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const code = ts.transpileModule(fs.readFileSync('src/lib/business-schema.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replace(/['"]astro:content['"]/,JSON.stringify(pathToFileURL(require.resolve('astro/zod')).href));
const { businessAcervoSchema: schema, businessFonteSchema: fonteSchema } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const article=JSON.parse(fs.readFileSync('src/content/business/acervo/marketing-moderno.json','utf8'));
const video={...JSON.parse(fs.readFileSync('src/content/business/acervo/hbr-orientacao-cliente.json','utf8')),status:'candidato',revisao_integral:false};
delete video.revisao_escopo; // O padrão exige revisão integral; seleção institucional precisa ser explícita.
test('leitura revista é válida, mas sem revisão não pode ser publicada',()=>{assert.equal(schema.safeParse(article).success,true);assert.equal(schema.safeParse({...article,revisor:'',revisado_em:''}).success,false);});
test('candidato de vídeo não pode ser promovido sem canal e revisão integral',()=>{assert.equal(schema.safeParse(video).success,true);assert.equal(schema.safeParse({...video,status:'publicado',revisor:'Curador',revisado_em:'2026-11-06',justificativa:'Material relevante, com fonte institucional identificada.'}).success,false);});
test('webinar também exige revisão integral',()=>assert.equal(schema.safeParse({...article,tipo:'webinar'}).success,false));
test('bloqueia protocolos executáveis e credenciais em URL',()=>{for(const url of ['javascript:alert(1)','http://www.mckinsey.com/article','https://user:pass@www.mckinsey.com/article'])assert.equal(schema.safeParse({...article,url}).success,false);});
test('livro exige editora; notícia e análise exigem corpo e fontes',()=>{
  assert.equal(schema.safeParse({...article,tipo:'livro'}).success,false);
  assert.equal(schema.safeParse({...article,tipo:'livro',editora:'Editora acadêmica'}).success,true);
  for(const tipo of ['noticia','analise']){
    assert.equal(schema.safeParse({...article,tipo}).success,false);
    assert.equal(schema.safeParse({...article,tipo,corpo:['Primeiro parágrafo de contexto e evidências.','Segundo parágrafo com limites de aplicação.'],referencias:[article.url]}).success,true);
  }
});
test('vídeo integral requer também qualificação e evidências',()=>{
  const complete={...article,tipo:'video',video_id:'abcdefghijk',channel_id:'UCWo4IA01TXzBeGJJKWHOG9g',revisao_integral:true};
  assert.equal(schema.safeParse(complete).success,false);
  assert.equal(schema.safeParse({...complete,palestrante:'Pesquisador',credenciais:'Vínculo institucional verificado.',evidencias_revisao:[article.url]}).success,true);
});

test('canal exige correspondência exata entre URL e Channel ID',()=>{const fonte=JSON.parse(fs.readFileSync('src/content/business/fontes/hbr.json','utf8'));assert.equal(fonteSchema.safeParse(fonte).success,true);assert.equal(fonteSchema.safeParse({...fonte,canais:[{...fonte.canais[0],url:'https://www.youtube.com/channel/UC0000000000000000000000'}]}).success,false);});

// O novo escopo publica uma seleção institucional, sem converter metadados em revisão integral.
test('seleção institucional exige contexto e evidências exatas, sem revisão integral fictícia',()=>{
 const institutional={...article,tipo:'video',url:'https://www.youtube.com/watch?v=abcdefghijk',video_id:'abcdefghijk',channel_id:'UCWo4IA01TXzBeGJJKWHOG9g',revisao_integral:false,revisao_escopo:'fonte_e_contexto',duracao_segundos:300,palestrante:'Equipe editorial',credenciais:'Equipe editorial da instituição identificada no vídeo.',contexto_editorial:'A página institucional identifica autoria, tema e contexto da apresentação. A conferência se limita à descrição e aos metadados da fonte.',evidencias_revisao:['https://www.youtube.com/watch?v=abcdefghijk','https://www.youtube.com/channel/UCWo4IA01TXzBeGJJKWHOG9g']};
 assert.equal(schema.safeParse(institutional).success,true);
 for(const patch of [{contexto_editorial:''},{duracao_segundos:0},{evidencias_revisao:[institutional.url]},{revisao_integral:true},{revisao_escopo:'integral'}])assert.equal(schema.safeParse({...institutional,...patch}).success,false);
});
