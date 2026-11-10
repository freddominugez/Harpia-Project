"""Descoberta bibliográfica semanal, privada: catálogo não substitui confirmação na editora."""
import hashlib,json,re
from datetime import datetime,timezone
import requests
from coletar_business import ROOT,SOURCES,EXCLUDED
OUTPUT=ROOT/'curadoria/business/livros-candidatos.json'
PUBLISHERS={'editora-pearson':['pearson'],'editora-informit':['ft press','financial times prentice hall'],'editora-oup':['oxford university press'],'editora-gen':['atlas','grupo gen'],'editora-prh':['crown currency','crown business','penguin random house'],'editora-simon-schuster':['free press','simon & schuster']}
QUERIES=['marketing strategy','consumer behavior','brand management','marketing management']

def candidates(docs,sources,published):
    out=[];seen=set()
    for book in docs:
        title=str(book.get('title',''));key=book.get('key','')
        if not title or title.casefold() in published or not re.fullmatch(r'/works/OL\d+W',key) or key in seen or EXCLUDED.search(title):continue
        names=book.get('publisher',[]);source=next((sid for sid,aliases in PUBLISHERS.items() if sid in sources and any(alias in name.casefold() for name in names for alias in aliases)),None)
        if not source:continue
        seen.add(key);url='https://openlibrary.org'+key
        out.append(dict(id=hashlib.sha256(url.encode()).hexdigest()[:20],ambiente='business',tipo='livro',status='candidato',titulo=title,autores=', '.join(book.get('author_name',[])[:4]),fonte=source,url=url,ano=book.get('first_publish_year'),editoras_catalogo=names[:10],confirmacao_editora_pendente=True,revisao_editorial=False))
    return out

def collect():
    sources={p.stem for p in SOURCES.glob('*.json') if (s:=json.loads(p.read_text())).get('status')=='aprovado' and 'livros' in s.get('escopos',[])}
    published={s.get('titulo','').casefold() for p in (ROOT/'src/content/business/acervo').glob('*.json') if (s:=json.loads(p.read_text())).get('tipo')=='livro'}
    items=[];health=[];now=datetime.now(timezone.utc).isoformat()
    previous=json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {'itens':[]}
    for query in QUERIES:
        try:
            r=requests.get('https://openlibrary.org/search.json',params={'q':query,'limit':12,'fields':'key,title,author_name,first_publish_year,publisher'},headers={'User-Agent':'Harpya-Business-Curadoria/1.0'},timeout=(7,20));r.raise_for_status()
            items.extend({**i,'consulta':query} for i in candidates(r.json().get('docs',[]),sources,published));health.append(dict(id=query,status='ok',verificado_em=now))
        except (requests.RequestException,ValueError):
            health.append(dict(id=query,status='erro',verificado_em=now))
            items.extend(i for i in previous.get('itens',[]) if i.get('consulta')==query and i.get('fonte') in sources and i.get('status')=='candidato')
    if not any(h['status']=='ok' for h in health):items=[i for i in previous.get('itens',[]) if i.get('fonte') in sources and i.get('status')=='candidato']
    unique={i['id']:i for i in items};data=dict(ambiente='business',atualizado_em=now,politica='descoberta_bibliografica_sem_publicacao_automatica',fontes=health,itens=list(unique.values()))
    OUTPUT.parent.mkdir(parents=True,exist_ok=True);temp=OUTPUT.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');temp.replace(OUTPUT)
    print(f"Business: {len(unique)} referências bibliográficas para conferir nas editoras; nenhuma publicada.")
if __name__=='__main__':collect()
