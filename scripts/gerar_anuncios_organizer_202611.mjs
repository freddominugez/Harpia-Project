import fs from 'node:fs';
import path from 'node:path';
import {Resvg} from '@resvg/resvg-js';
const dir=path.resolve('design/anuncios-organizer-202611');
const out=path.resolve('public/img/anuncios');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
let inline=true;
const asset=file=>inline?`data:image/${file.endsWith('.jpg')?'jpeg':'png'};base64,${fs.readFileSync(path.join(dir,'assets',file)).toString('base64')}`:`../assets/${file}`;
const text=(x,y,content,size=12,weight=400,color='#183342',family='Arial',extra='')=>`<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(content)}</text>`;
const image=(file,x,y,w,h,extra='')=>`<image href="${asset(file)}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
const icon=(x,y,size)=>`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="60 65 1160 1150">${image('organizer-icone-transparente.png',0,0,1280,1280)}</svg>`;
const logo=(x,y,size)=>image('vulcan-logo.png',x,y,size,size,'preserveAspectRatio="xMidYMid meet"');
const shot=(file,x,y,w,h,roi)=>`<g filter="url(#shadow)"><rect x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="7" fill="#fff" stroke="#c5d9e4"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${roi}" preserveAspectRatio="xMidYMid slice">${image(file,0,0,file==='calendario.jpg'?1920:1450,file==='calendario.jpg'?1080:800)}</svg></g>`;
const button=(x,y,w,h,label,size=15)=>`<rect x="${x}" y="${y+2}" width="${w}" height="${h}" rx="8" fill="#071f2a" opacity=".15"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#cta)"/>${text(x+w/2,y+h/2+size*.34,label,size,700,'#fff','Arial','text-anchor="middle"')}`;
const frame=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#fffef9"/><stop offset="1" stop-color="#eaf5f8"/></linearGradient><linearGradient id="cta"><stop stop-color="#12384b"/><stop offset="1" stop-color="#087f8c"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#103748" flood-opacity=".18"/></filter></defs><rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="11" fill="url(#bg)" stroke="#c9dee5"/>${body}</svg>`;
const pieces=[
 {slot:'topo',base:'vulcan-organizer-banner-superior-970x90-v2',w:970,h:90,copy:['Vulcan Organizer','AGENDA · TAREFAS · NOTAS · IA','Seu dia inteiro num organizer de verdade.','Google Agenda e Google Tasks sincronizados. Grátis, sem cartão.','Comece grátis →'],svg:()=>frame(970,90,
 logo(14,9,27)+text(48,30,'Vulcan Organizer',18,700)+icon(12,36,50)+text(77,54,'AGENDA · TAREFAS ·',8.7,700,'#56707b')+text(77,68,'NOTAS · IA',8.7,700,'#56707b')+
 '<path d="M220 14v62" stroke="#c5d9df"/>'+text(240,29,'Seu dia inteiro num',21,700,'#142e3a','Georgia')+text(240,53,'organizer de verdade.',21,700,'#142e3a','Georgia')+text(240,69,'Google Agenda e Google Tasks sincronizados.',10.5,400,'#486371')+text(240,82,'Grátis, sem cartão.',10.5,400,'#486371')+
 shot('calendario.jpg',537,11,217,68,'299 113 1439 745')+button(780,26,172,38,'Comece grátis →',16))},
 {slot:'lateral-direita',base:'vulcan-organizer-lateral-direita-300x250-v2',w:300,h:250,copy:['Vulcan Organizer','Tudo do seu dia num só lugar.','Calendário com Google Agenda','Tarefas com Google Tasks','Notas e cadernos','Cofre de senhas e resumo com IA','Experimente grátis →','Plano gratuito. Sem cartão de crédito.'],svg:()=>frame(300,250,
 logo(15,12,26)+text(49,31,'Vulcan Organizer',17,700)+icon(248,8,38)+text(16,65,'Tudo do seu dia',21,700,'#142e3a','Georgia')+text(16,90,'num só lugar.',21,700,'#142e3a','Georgia')+
 shot('calendario.jpg',210,54,73,53,'299 113 1439 745')+
 ['Calendário com Google Agenda','Tarefas com Google Tasks','Notas e cadernos','Cofre de senhas e resumo com IA'].map((t,i)=>`<rect x="16" y="${118+i*18}" width="4" height="12" rx="2" fill="${['#0ca8bd','#e89836','#4a9d70','#9a53bd'][i]}"/>`+text(28,128+i*18,t,12.2)).join('')+button(16,202,268,30,'Experimente grátis →',14)+text(150,244,'Plano gratuito. Sem cartão de crédito.',9.9,400,'#486371','Arial','text-anchor="middle"'))},
 {slot:'lateral-esquerda',base:'vulcan-organizer-lateral-esquerda-300x250-v2',w:300,h:250,copy:['Vulcan Organizer','sex, 31 out','Sua agenda com alma de papel.','09:00 café com a equipe','enviar proposta','revisar o orçamento','Comece grátis →'],svg:()=>frame(300,250,
 '<path d="M12 100h276M12 136h183M12 160h183M12 184h183" stroke="#dce3da"/>'+logo(15,12,25)+text(47,30,'Vulcan Organizer',15,700)+text(283,28,'sex, 31 out',10.5,400,'#6f7d7e','Georgia','text-anchor="end" font-style="italic"')+
 text(16,66,'Sua agenda com',22,700,'#142e3a','Georgia')+text(16,91,'alma de papel.',22,700,'#142e3a','Georgia')+icon(219,44,65)+
 shot('notas.jpg',205,115,78,70,'10 37 1420 735')+text(17,127,'09:00',12.6,700,'#c16c21','Georgia','font-style="italic"')+text(62,127,'café com a equipe',12.6,400,'#264b62','Georgia','font-style="italic"')+
 '<rect x="17" y="144" width="11" height="11" rx="1.5" fill="#fff" stroke="#264b62"/><path d="m18 148 4 4 7-9" stroke="#26956c" stroke-width="2" fill="none"/>'+text(36,153,'enviar proposta',13.4,400,'#264b62','Georgia','font-style="italic"')+'<rect x="17" y="168" width="11" height="11" rx="1.5" fill="#fff" stroke="#264b62"/>'+text(36,177,'revisar o orçamento',13.4,400,'#264b62','Georgia','font-style="italic"')+
 button(16,202,268,32,'Comece grátis →',15))}
];
const fonts=['Arial.ttf','Arial Bold.ttf','Georgia.ttf','Georgia Bold.ttf','Georgia Italic.ttf'].map(n=>`/System/Library/Fonts/Supplemental/${n}`).filter(fs.existsSync);
for(const p of pieces){
 inline=true;const svg=p.svg();
 for(const scale of [1,2]){const png=new Resvg(svg,{font:{fontFiles:fonts,loadSystemFonts:true},fitTo:{mode:'width',value:p.w*scale}}).render().asPng();fs.writeFileSync(path.join(out,p.base+(scale===2?'-2x':'')+'.png'),png);}
 inline=false;fs.writeFileSync(path.join(dir,'editaveis',p.base+'.svg'),p.svg());
}
const manifest={data:'2026-11-07',descricao:'Três novas peças com os textos originais, capturas reais do produto e os dois logos fornecidos.',gerador:'scripts/gerar_anuncios_organizer_202611.mjs',fontes:['assets/vulcan-logo.png','assets/organizer-icone-transparente.png','assets/calendario.jpg','assets/notas.jpg'],icone:{modo:'imagegen integrado',prompt_arquivo:'design/anuncios-organizer-202611/prompt-icone.txt',origem:'/Users/studio/Documents/github/vulcan-organizer/public/vulcanorganizer.jpg',prompt:'Recorte transparente do ícone original; remover quadriculado de fundo, preservar organizer aberto, moldura metálica, cinco argolas, páginas, notas e abas coloridas, sem redesenho ou texto.'},pecas:pieces.map(p=>({posicao:p.slot,dimensoes:[p.w,p.h],texto:p.copy,arquivo:`public/img/anuncios/${p.base}-2x.png`,arquivo_1x:`public/img/anuncios/${p.base}.png`,editavel:`design/anuncios-organizer-202611/editaveis/${p.base}.svg`,url:JSON.parse(fs.readFileSync(`src/content/anuncios/${p.slot}.json`)).url}))};
fs.writeFileSync(path.join(dir,'manifesto.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(pieces.map(p=>`${p.base}: ${p.w}×${p.h} e ${p.w*2}×${p.h*2}`).join('\n'));
