"""Descoberta de vídeos dos canais aprovados; saída apenas na fila editorial."""
from __future__ import annotations
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
import requests
from coletar_business import TERMS, EXCLUDED, SOURCES, ROOT

OUTPUT = ROOT / 'curadoria/business/videos-candidatos.json'
NS = {'a':'http://www.w3.org/2005/Atom', 'yt':'http://www.youtube.com/xml/schemas/2015'}
CHANNEL = re.compile(r'^UC[A-Za-z0-9_-]{22}$')
VIDEO = re.compile(r'^[A-Za-z0-9_-]{11}$')
COURSE_PROMO = re.compile(r'\b(?:admissions?|apply now|open day|executive education|executive mba|emfin|mba students|programme overview|program overview|course overview)\b|inscreva-se|p[oó]s-gradua[cç][aã]o', re.I)


def parse_channel(content, source, channel, now):
    root = ET.fromstring(content)
    # O cabeçalho Atom do YouTube pode omitir o prefixo UC; as entradas e
    # o endereço do autor conservam o ID completo. Validar as duas evidências.
    root_id = root.findtext('yt:channelId', default='', namespaces=NS)
    author_uri = root.findtext('a:author/a:uri', default='', namespaces=NS)
    expected_uri = 'https://www.youtube.com/channel/'+channel['id']
    if root.tag != '{'+NS['a']+'}feed' or root_id not in (channel['id'], channel['id'][2:]) or author_uri != expected_uri:
        raise ValueError('Feed não corresponde ao canal aprovado')
    items = []
    for entry in root.findall('a:entry', NS):
        title = (entry.findtext('a:title', default='', namespaces=NS)).strip()
        video_id = entry.findtext('yt:videoId', default='', namespaces=NS)
        channel_id = entry.findtext('yt:channelId', default='', namespaces=NS)
        try:
            date = datetime.fromisoformat(entry.findtext('a:published', default='', namespaces=NS).replace('Z','+00:00'))
            if date.tzinfo is None:
                continue
        except ValueError:
            continue
        if channel_id != channel['id'] or entry.findtext('a:author/a:uri', default='', namespaces=NS) != expected_uri or not VIDEO.fullmatch(video_id) or len(title) < 8 or not TERMS.search(title) or EXCLUDED.search(title) or COURSE_PROMO.search(title) or date > now + timedelta(days=1) or date < now - timedelta(days=180):
            continue
        url = 'https://www.youtube.com/watch?v='+video_id
        items.append(dict(id=hashlib.sha256(url.encode()).hexdigest()[:20],ambiente='business',tipo='video',
                          titulo=title,url=url,fonte=source['id'],video_id=video_id,channel_id=channel_id,
                          data=date.date().isoformat(),verificado_em=now.date().isoformat(),
                          status='candidato',revisao_editorial=False,revisao_integral=False))
    return items


def fetch_channel(source, channel, now):
    if source.get('status') != 'aprovado' or 'videos' not in source.get('escopos',[]) or channel.get('status') != 'aprovado' or not CHANNEL.fullmatch(channel.get('id','')):
        raise ValueError('Canal não aprovado')
    response = requests.get('https://www.youtube.com/feeds/videos.xml',params={'channel_id':channel['id']},
                            headers={'User-Agent':'Harpya-Business-Curadoria/1.0'},timeout=(7,20),allow_redirects=False,stream=True)
    try:
        if response.is_redirect:
            raise ValueError('Redirecionamento de feed não permitido')
        response.raise_for_status()
        chunks=[];size=0
        for chunk in response.iter_content(65536):
            size+=len(chunk)
            if size > 3_000_000:
                raise ValueError('Feed acima do limite')
            chunks.append(chunk)
        return parse_channel(b''.join(chunks),source,channel,now)
    finally:
        response.close()


def assemble(channels, results, previous, now):
    items={};health=[]
    for (source,channel),(found,error) in zip(channels,results):
        if error:
            found=[item for item in previous.get('itens',[]) if item.get('fonte')==source['id'] and item.get('channel_id')==channel['id']]
        valid=[]
        for item in found:
            try:
                recent=now-timedelta(days=180) <= datetime.fromisoformat(item.get('data','')).replace(tzinfo=timezone.utc) <= now+timedelta(days=1)
            except ValueError:
                recent=False
            if recent and item.get('status')=='candidato' and VIDEO.fullmatch(item.get('video_id','')) and item.get('channel_id')==channel['id']:
                item={**item,'url':'https://www.youtube.com/watch?v='+item['video_id'],'ambiente':'business','tipo':'video','status':'candidato','revisao_editorial':False,'revisao_integral':False}
                valid.append(item);items[item['video_id']]=item
        health.append(dict(id=channel['id'],fonte=source['id'],status='erro' if error else 'ok',itens=len(valid),mensagem=error or '',verificado_em=now.isoformat()))
    return dict(ambiente='business',atualizado_em=now.isoformat(),politica='candidatos_sem_publicacao_automatica',fontes=health,itens=sorted(items.values(),key=lambda item:item['data'],reverse=True))


def collect():
    channels=[]
    for path in sorted(SOURCES.glob('*.json')):
        source=json.loads(path.read_text());source['id']=path.stem
        if source.get('status')=='aprovado' and 'videos' in source.get('escopos',[]):
            channels.extend((source,channel) for channel in source.get('canais',[]) if channel.get('status')=='aprovado' and CHANNEL.fullmatch(channel.get('id','')))
    now=datetime.now(timezone.utc);results=[]
    for source,channel in channels:
        try:
            results.append((fetch_channel(source,channel,now),None))
        except (requests.RequestException,ValueError,ET.ParseError) as error:
            results.append(([],type(error).__name__))
    previous=json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    data=assemble(channels,results,previous,now)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    temp=OUTPUT.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');temp.replace(OUTPUT)
    for state in data['fontes']:
        print(f"{state['id']}: {state['status']} ({state['itens']} candidatos)")
    print(f"Business vídeos: {len(channels)} canais aprovados; {len(data['itens'])} candidatos; sem publicação automática.")


if __name__=='__main__':
    collect()
