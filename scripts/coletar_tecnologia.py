"""Cards laterais via RSS público, sem chave, tradução automática ou corpo de matéria."""
from __future__ import annotations

import json
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from coletar_radar_ia import assemble, canonical_url, fetch_source

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / 'scripts/fontes_tecnologia.json'
OUTPUT = ROOT / 'public/data/tecnologia.json'


def eligible(source, item):
    url = canonical_url(source, item.get('url', ''))
    if not url:
        return False
    path = urlsplit(url).path.strip('/')
    # O feed do HF também inclui autores da comunidade. Usar somente o blog editorial.
    if source.get('somente_blog_editorial') and len(path.split('/')) != 2:
        return False
    if source['id'] == 'mit-electronics' and not re.match(r'^20\d{2}/.+', path):
        return False
    return bool(re.search(source['termos'], item.get('title', ''), re.I))


def assemble_cards(sources, results, previous, now):
    configs = {s['id']: s for s in sources}
    # Reutiliza validação de HTTPS, datas, duplicatas e preservação em caso de falha.
    data = assemble(sources, results, previous, now)
    data['items'] = [item for item in data['items'] if eligible(configs[item['source_id']], item)]
    data.pop('featured_id', None)
    data['publication_policy'] = 'trusted_technology_rss'
    for item in data['items']:
        item['tema'] = configs[item['source_id']]['tema']
        # Apenas título, fonte, data e link; não republicar os resumos dos feeds.
        item['summary'] = ''
        item.pop('impact_score', None)
        item.pop('topics', None)
    return data


def collect():
    sources = json.loads(CONFIG.read_text(encoding='utf-8'))
    previous = json.loads(OUTPUT.read_text(encoding='utf-8')) if OUTPUT.exists() else {}
    now = datetime.now(timezone.utc)
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda source: fetch_source(source, now), sources))
    # Filtrar antes do limite por fonte para notícias gerais não expulsarem as relevantes.
    results = [([item for item in items if eligible(source, item)], health)
               for source, (items, health) in zip(sources, results)]
    data = assemble_cards(sources, results, previous, now)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUTPUT.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(OUTPUT)
    for health in data['sources']:
        print(f"{health['nome']}: {health['status']} ({health['item_count']} itens lidos)")
    print(f"Tecnologia: {len(data['items'])} títulos publicados")


if __name__ == '__main__':
    collect()
