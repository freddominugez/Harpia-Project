"""Radar público: somente título, fonte, data e link de RSS institucionais aprovados.
Não cria artigos nem reaproveita resumos de terceiros. Falhas preservam o último lote válido.
"""
import json
import requests
from datetime import datetime, timedelta, timezone
from pathlib import Path
from coletar_business import SOURCES, ROOT, fetch_source, canonical_url, TERMS, EXCLUDED
from coletar_business_videos import COURSE_PROMO

OUTPUT=ROOT/'public/data/business-radar.json'

def assemble_radar(sources,results,previous,now):
    items={};health=[];success=False
    for source,(found,error) in zip(sources,results):
        success|=error is None
        health.append(dict(id=source['id'],status='error' if error else ('ok' if found else 'no_recent_items'),item_count=len(found),checked_at=now.isoformat()))
        candidates=found if error is None else [dict(titulo=x.get('title'),url=x.get('url'),data=x.get('published_at','')[:10],id=x.get('id')) for x in previous.get('items',[]) if x.get('source_id')==source['id']]
        count=0
        for item in sorted(candidates,key=lambda x:x.get('data',''),reverse=True):
            url=canonical_url(source,item.get('url',''));title=item.get('titulo') or ''
            try: date=datetime.fromisoformat(item.get('data','')).replace(tzinfo=timezone.utc)
            except (ValueError,TypeError):continue
            if not url or not 8<=len(title)<=190 or not TERMS.search(title) or EXCLUDED.search(title) or COURSE_PROMO.search(title) or not now-timedelta(days=45)<=date<=now+timedelta(days=1) or count>=8:continue
            if url in items:continue
            items[url]=dict(id=item['id'],source_id=source['id'],title=title,summary='',url=url,published_at=date.isoformat(),verified_at=now.isoformat() if not error else next((x.get('verified_at') for x in previous.get('items',[]) if x.get('url')==url),''),idioma=source['idioma'])
            count+=1
    return dict(ambiente='business',publication_policy='trusted_institutional_rss_metadata_only',checked_at=now.isoformat(),last_successful_at=now.isoformat() if success else previous.get('last_successful_at'),sources=health,items=sorted(items.values(),key=lambda x:x['published_at'],reverse=True)[:40])

def collect():
    sources=[]
    for p in sorted(SOURCES.glob('*.json')):
        s=json.loads(p.read_text());s['id']=p.stem
        if s.get('status')=='aprovado' and 'artigos' in s.get('escopos',[]) and s.get('feed'):sources.append(s)
    now=datetime.now(timezone.utc);previous=json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {};results=[]
    for s in sources:
        try: results.append((fetch_source(s,now),None))
        except (requests.RequestException,ValueError) as error: results.append(([],type(error).__name__))
    data=assemble_radar(sources,results,previous,now);OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    temp=OUTPUT.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');temp.replace(OUTPUT)
    for s in data['sources']:print(f"{s['id']}: {s['status']} ({s['item_count']} registros)")
    print(f"Business: {len(data['items'])} títulos no radar; nenhum artigo publicado automaticamente.")
if __name__=='__main__':collect()
