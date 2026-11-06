import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('pesquisa não infla o volume por duplicação ou aprovação de canal',()=>{
  const audit=JSON.parse(execFileSync(process.execPath,['scripts/auditar_business_corretivo.mjs','--json'],{encoding:'utf8'}));
  assert.equal(audit.pesquisa.artigos_candidatos,28);
  assert.equal(audit.pesquisa.artigos_urls_novas,24);
  assert.equal(audit.pesquisa.artigos_ja_no_acervo,4);
  assert.equal(audit.pesquisa.videos_candidatos,24);
  assert.equal(audit.pesquisa.videos_integralmente_revisados,0);
  assert.equal(audit.pesquisa.duracao_video_segundos,36345);
  assert.equal(audit.liberado_para_publicar,false);
  assert.ok(audit.bloqueios.some(x=>x.startsWith('Vídeos:')));
});
