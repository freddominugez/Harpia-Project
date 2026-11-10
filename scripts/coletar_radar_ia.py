"""Publica somente anúncios de canais oficiais. Não gera fatos nem matérias completas."""
from __future__ import annotations
import argparse
import calendar
import json
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

import feedparser
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / 'scripts/fontes_ia.json'
OUTPUT = ROOT / 'public/data/radar-ia.json'
AI = re.compile(r'\bAI\b|artificial intelligence|generative|\bLLM|\bGPU|\bCUDA|\bLlama|neural|machine learning|\bmodel\b|reasoning', re.I)
MONTH_DATE = r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}'

def clean(text, limit=240):
    plain = BeautifulSoup(str(text or ''), 'html.parser').get_text(' ', strip=True)
    plain = ' '.join(plain.split())
    return plain if len(plain) <= limit else plain[:limit].rsplit(' ', 1)[0] + '…'

def canonical_url(source, value):
    try:
        u = urlsplit(urljoin(source['canal'], value))
        if u.scheme != 'https' or u.hostname not in source['hosts'] or u.username or u.password or u.port not in (None, 443):
            return None
        if source['id'] == 'anthropic' and u.path.rstrip('/') in ('/news/announcements', '/news/features', '/news/research', '/news/partnerships', '/news/company', '/news/product', '/news/policy', '/news/events'):
            return None
        if not any(u.path.startswith(prefix) and len(u.path) > len(prefix) for prefix in source['prefixos']) and not (source['tipo'] == 'changelog' and u.path == '/updates/' and u.fragment):
            return None
        query = urlencode(sorted((k, v) for k, v in parse_qsl(u.query) if not k.lower().startswith('utm_') and k not in ('fbclid', 'gclid')))
        return urlunsplit(('https', u.hostname, u.path, query, u.fragment if source.get('fragmentos') else ''))
    except (ValueError, TypeError):
        return None

def parse_date(value):
    if not value:
        return None
    text = str(value).strip()
    try:
        result = datetime.fromisoformat(text.replace('Z', '+00:00'))
    except ValueError:
        try:
            result = parsedate_to_datetime(text)
        except (ValueError, TypeError):
            result = None
            for fmt in ('%b %d, %Y', '%B %d, %Y', '%b %d %Y', '%B %d %Y'):
                try:
                    result = datetime.strptime(text, fmt)
                    break
                except ValueError:
                    pass
    return result.replace(tzinfo=timezone.utc) if result and result.tzinfo is None else result

def score(title, summary):
    text = f'{title} {summary}'.lower()
    topics = []
    weight = 10
    for label, expression, points in [
        ('Modelos', r'\bmodel|\bgpt|\bclaude|\bgemini|\bmistral|\bgrok|\bdeepseek|\bqwen|\bkimi|\bllama', 20),
        ('Código aberto', r'open.weight|open.source|open model|weights|license', 18),
        ('Pesquisa', r'research|benchmark|reasoning|scientific|science', 12),
        ('Segurança', r'safety|security|vulnerab|misuse|safeguard', 15),
        ('APIs e ferramentas', r'\bapi\b|agent|coding|inference|pricing', 10),
    ]:
        if re.search(expression, text):
            topics.append(label); weight += points
    if re.search(r'introduc|releas|launch|announc|new\b', title, re.I):
        weight += 15
    return min(weight, 100), topics[:3] or ['Atualização oficial']

def make_item(source, title, summary, url, published, now):
    url = canonical_url(source, url)
    date = parse_date(published)
    title, summary = clean(title, 190), clean(summary, 240)
    if not url or not date or date > now or date < now - timedelta(days=45) or len(title) < 5:
        return None
    if source.get('filtrar_ia') and not AI.search(f'{title} {summary}'):
        return None
    weight, topics = score(title, summary)
    return dict(id=url, source_id=source['id'], company=source['nome'], title=title,
                summary=summary, url=url, published_at=date.astimezone(timezone.utc).isoformat(), verified_at=now.isoformat(), impact_score=weight, topics=topics)

def parse_feed(source, content, now):
    result = []
    for item in feedparser.parse(content).entries[:150]:
        date = item.get('published') or item.get('updated')
        if not date and (item.get('published_parsed') or item.get('updated_parsed')):
            date = datetime.fromtimestamp(calendar.timegm(item.get('published_parsed') or item.get('updated_parsed')), timezone.utc).isoformat()
        candidate = make_item(source, item.get('title'), item.get('summary', ''), item.get('link', ''), date, now)
        if candidate:
            result.append(candidate)
    return result

def parse_cards(source, content, now):
    soup = BeautifulSoup(content, 'html.parser')
    result, seen = [], set()
    for anchor in soup.select('a[href]'):
        url = canonical_url(source, anchor.get('href'))
        if not url or url in seen:
            continue
        node = anchor
        candidate = None
        for _ in range(5):
            if not node or node.name in ('main', 'body', 'html'):
                break
            article_urls = {canonical_url(source, link.get('href')) for link in node.select('a[href]')}
            article_urls.discard(None)
            if len(article_urls) > 1:
                break  # não empresta título e data de um cartão vizinho ou do menu
            text = node.get_text(' ', strip=True)
            time = node.find('time')
            match = re.search(r'20\d{2}-\d{2}-\d{2}', text) or re.search(MONTH_DATE, text)
            date = (time.get('datetime') or time.get_text(strip=True)) if time else match.group() if match else None
            heading = node.find(['h2', 'h3', 'h4'])
            title = heading.get_text(' ', strip=True) if heading else anchor.get_text(' ', strip=True)
            paragraph = next((p for p in node.find_all('p') if len(p.get_text(strip=True)) > 40), None)
            summary = paragraph.get_text(' ', strip=True) if paragraph else ''
            candidate = make_item(source, title, summary, url, date, now)
            if candidate:
                break
            node = node.parent
        if candidate:
            seen.add(url); result.append(candidate)
    return result

def parse_changelog(source, content, now):
    soup = BeautifulSoup(content, 'html.parser')
    result = []
    for heading in soup.select('h2'):
        match = re.search(r'20\d{2}-\d{2}-\d{2}', heading.get_text())
        if not match:
            continue
        titles, summary = [], ''
        for node in heading.next_siblings:
            if getattr(node, 'name', None) == 'h2':
                break
            if getattr(node, 'name', None) == 'h3':
                titles.append(node.get_text(' ', strip=True).replace('\u200b', ''))
            if getattr(node, 'name', None) == 'p' and not summary:
                summary = node.get_text(' ', strip=True)
        url = f"{source['canal']}#{heading.get('id') or 'date-' + match.group()}"
        candidate = make_item(source, 'DeepSeek: ' + '; '.join(titles[:2]), summary, url, match.group(), now)
        if candidate:
            result.append(candidate)
    return result

def fetch_source(source, now):
    health = {k: source[k] for k in ('id', 'nome', 'site', 'canal')}
    health.update(checked_at=now.isoformat(), status='error', item_count=0)
    try:
        url = source['canal']
        for _ in range(4):
            with requests.get(url, timeout=(8, 18), headers={'User-Agent': 'HarpyaOfficialRadar/1.0 (+https://www.harpya.org/sobre/)'}, stream=True, allow_redirects=False) as response:
                if response.is_redirect:
                    target = urljoin(url, response.headers['Location'])
                    if urlsplit(target).scheme != 'https' or urlsplit(target).hostname not in source['hosts']:
                        raise ValueError('Redirecionamento fora do canal autorizado')
                    url = target
                    continue
                response.raise_for_status()
                pieces, size = [], 0
                for chunk in response.iter_content(65536):
                    size += len(chunk)
                    if size > 2_000_000:
                        raise ValueError('Canal acima do limite de leitura')
                    pieces.append(chunk)
                content = b''.join(pieces)
                break
        else:
            raise ValueError('Excesso de redirecionamentos')
        parser = {'rss': parse_feed, 'cards': parse_cards, 'changelog': parse_changelog}[source['tipo']]
        items = parser(source, content, now)
        health.update(status='ok' if items else 'no_recent_items', item_count=len(items))
        return items, health
    except (requests.RequestException, ValueError, KeyError) as error:
        health['error'] = f'HTTP {error.response.status_code}' if isinstance(error, requests.HTTPError) and error.response is not None else str(error)[:140]
        return [], health

def assemble(sources, results, previous, now):
    configs = {s['id']: s for s in sources}
    merged = {}
    for old in previous.get('items', []):
        source = configs.get(old.get('source_id'))
        if not source:
            continue
        candidate = make_item(source, old.get('title'), old.get('summary'), old.get('url'), old.get('published_at'), now)
        if candidate:
            candidate['verified_at'] = old.get('verified_at', previous.get('checked_at', now.isoformat()))
            merged[candidate['id']] = candidate
    statuses = []
    for items, health in results:
        statuses.append(health)
        for item in items:
            merged[item['id']] = item
    ranked = sorted(merged.values(), key=lambda item: (item['published_at'], item['impact_score']), reverse=True)
    counts, balanced = {}, []
    for item in ranked:
        if counts.get(item['source_id'], 0) < 10:
            balanced.append(item); counts[item['source_id']] = counts.get(item['source_id'], 0) + 1
    recent = [item for item in balanced if parse_date(item['published_at']) >= now - timedelta(days=7)]
    shortlist = recent or balanced[:10]
    featured = max(shortlist, key=lambda item: (item['impact_score'] + max(0, 10 - (now - parse_date(item['published_at'])).total_seconds() / 86400), item['published_at']), default=None)
    return dict(schema_version=1, checked_at=now.isoformat(), last_successful_at=now.isoformat() if any(items for items, _ in results) else previous.get('last_successful_at'),
                publication_policy='official_sources_automatic', featured_id=featured['id'] if featured else None, sources=statuses, items=balanced[:70])

def collect():
    sources = json.loads(CONFIG.read_text())
    now = datetime.now(timezone.utc)
    previous = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(lambda source: fetch_source(source, now), sources))
    result = assemble(sources, results, previous, now)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUTPUT.with_suffix('.tmp')
    temp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    temp.replace(OUTPUT)
    for health in result['sources']:
        print(f"{health['nome']}: {health['status']} ({health['item_count']} itens)")
    print(f"Radar publicado: {len(result['items'])} itens; destaque {result['featured_id']}")

if __name__ == '__main__':
    collect()
