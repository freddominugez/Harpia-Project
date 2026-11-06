"""Coleta Business em lista institucional; escreve só candidatos, nunca conteúdo público."""
from __future__ import annotations
import hashlib
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import feedparser
import requests

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / 'src/content/business/fontes'
OUTPUT = ROOT / 'curadoria/business/candidatos.json'
TERMS = re.compile(r'market|consumer|customer|brand|pricing|sales|retail|strateg|management|organiza|marketing|gest[aã]o|consumidor|cliente|marca|venda|pre[cç]o', re.I)
EXCLUDED = re.compile(r'\bcoach(?:ing)?\b|guaranteed results|fique rico|renda garantida|f[oó]rmula secreta|marketing agency|ag[eê]ncia de marketing', re.I)


def canonical_url(source, url):
    try:
        parsed = urlsplit(url)
        if parsed.scheme != 'https' or parsed.hostname not in source['hosts'] or parsed.username or parsed.password or parsed.port not in (None, 443):
            return None
        query = [(k,v) for k,v in parse_qsl(parsed.query) if not k.lower().startswith('utm_') and k.lower() not in ('fbclid','gclid')]
        return urlunsplit(('https', parsed.hostname, parsed.path or '/', urlencode(query), ''))
    except (ValueError, TypeError):
        return None


def candidate(source, entry, now):
    title = re.sub(r'<[^>]*>', '', str(entry.get('title',''))).strip()
    url = canonical_url(source, entry.get('link',''))
    date = entry.get('published_parsed') or entry.get('updated_parsed')
    if not url or len(title) < 8 or not TERMS.search(title) or EXCLUDED.search(title) or not date:
        return None
    try:
        published = datetime(*date[:6], tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return None
    if published > now + timedelta(days=1) or published < now - timedelta(days=180):
        return None
    return dict(id=hashlib.sha256(url.encode()).hexdigest()[:20], ambiente='business', titulo=title, url=url,
                fonte=source['id'], data=published.date().isoformat(), verificado_em=now.date().isoformat(),
                tipo='artigo', status='candidato', revisao_editorial=False)


def fetch_source(source, now):
    url = source['feed']
    # Redirecionamentos só para os hosts aprovados da mesma instituição.
    for _ in range(4):
        if not canonical_url(source, url):
            raise ValueError('Feed ou redirecionamento fora da lista institucional')
        response = requests.get(url, headers={'User-Agent':'Harpya-Business-Curadoria/1.0 (+https://www.harpya.org/business/sobre/)'}, timeout=(7,20), allow_redirects=False, stream=True)
        try:
            if response.is_redirect:
                from urllib.parse import urljoin
                url = urljoin(url, response.headers.get('Location',''))
                continue
            response.raise_for_status()
            chunks=[];size=0
            for chunk in response.iter_content(65536):
                size += len(chunk)
                if size > 3_000_000:
                    raise ValueError('Feed acima do limite de tamanho')
                chunks.append(chunk)
            parsed = feedparser.parse(b''.join(chunks))
            if not parsed.get('version'):
                raise ValueError('A resposta não é RSS ou Atom')
            return [item for entry in parsed.entries if (item := candidate(source,entry,now))]
        finally:
            response.close()
    raise ValueError('Muitos redirecionamentos')


def assemble(sources, results, previous, now):
    old = previous.get('itens',[])
    items={};health=[]
    for source, result in zip(sources,results):
        found, error = result
        health.append(dict(id=source['id'],status='erro' if error else 'ok',itens=len(found),mensagem=error or '',verificado_em=now.isoformat()))
        if error:
            found=[item for item in old if item.get('fonte') == source['id']]
        for item in found[:30]:
            url=canonical_url(source,item.get('url',''))
            try:
                recent=datetime.fromisoformat(item.get('data','')).replace(tzinfo=timezone.utc) >= now-timedelta(days=180)
            except ValueError:
                recent=False
            if url and recent and item.get('status')=='candidato':
                items[url]={**item,'url':url,'ambiente':'business','status':'candidato','revisao_editorial':False}
    return dict(ambiente='business',atualizado_em=now.isoformat(),politica='candidatos_sem_publicacao_automatica',fontes=health,itens=sorted(items.values(),key=lambda item:item['data'],reverse=True))


def collect():
    sources=[]
    for path in sorted(SOURCES.glob('*.json')):
        source=json.loads(path.read_text());source['id']=path.stem
        if source.get('status')=='aprovado' and 'artigos' in source.get('escopos',['artigos']) and source.get('feed'):
            sources.append(source)
    previous=json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    now=datetime.now(timezone.utc);results=[]
    for source in sources:
        try:
            results.append((fetch_source(source,now),None))
        except (requests.RequestException, ValueError) as error:
            # Não escrever URLs de requisição nem cabeçalhos em logs.
            results.append(([],type(error).__name__))
    data=assemble(sources,results,previous,now)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    temp=OUTPUT.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');temp.replace(OUTPUT)
    for status in data['fontes']:
        print(f"{status['id']}: {status['status']} ({status['itens']} candidatos)")
    print(f"Business: {len(data['itens'])} candidatos; nenhuma publicação automática.")


if __name__ == '__main__':
    collect()
