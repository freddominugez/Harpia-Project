"""Robô de news do Harpya.

Lê os feeds listados em src/content/feeds/*.json, mantém só itens ligados aos caminhos
do projeto e grava public/data/news.json. Roda no GitHub Actions a cada 6 horas.

Uso local:
    pip install -r scripts/requirements.txt
    python scripts/coletar_news.py
"""
from __future__ import annotations

import calendar
import json
import re
import time
from pathlib import Path

import feedparser

RAIZ = Path(__file__).resolve().parent.parent
FEEDS = RAIZ / "src" / "content" / "feeds"
SAIDA = RAIZ / "public" / "data" / "news.json"
MAX_ITENS = 40
MAX_DIAS = 30

# Termos que ligam um item aos caminhos do Harpya.
TERMOS = re.compile(
    r"embedding|vector (search|database|index|quantiz)|nearest[- ]neighbo|retriev|rerank|quantiz|"
    r"inner[- ]product|\bMIPS\b|rabitq|matryoshka|lattice|softmax|vocabular|tokeniz|kv[- ]cache|"
    r"low[- ]bit|1[- ]bit|\bint[48]\b|tensor[- ]train|hyperbolic|"
    r"(inference|decoding|serving) (cost|speed|latency|efficien)|efficient (inference|decoding|attention)",
    re.I,
)


def data_do(item) -> int:
    t = item.get("published_parsed") or item.get("updated_parsed")
    return calendar.timegm(t) if t else 0


def coletar() -> list[dict]:
    feeds = sorted((json.loads(a.read_text(encoding="utf-8")) for a in FEEDS.glob("*.json")), key=lambda f: f.get("ordem", 999))
    limite = time.time() - MAX_DIAS * 86400
    vistos: set[str] = set()
    saida: list[dict] = []
    for f in feeds:
        url = f.get("url")
        if not url:
            continue  # fontes sem RSS (Anthropic, CERN) ficam para o coletor de página
        try:
            feed = feedparser.parse(url, agent="harpya-project-news/1.0")
        except Exception as erro:  # um feed fora do ar não derruba os outros
            print(f"[aviso] {f['nome']}: {erro}")
            continue
        if feed.bozo and not feed.entries:
            print(f"[aviso] {f['nome']}: feed ilegível ({feed.bozo_exception})")
            continue
        for item in feed.entries[:300]:
            titulo = " ".join(item.get("title", "").split())
            link = item.get("link", "")
            # O arXiv publica centenas de itens por dia: nele só conta o título.
            texto = titulo if f.get("so_titulo") else f"{titulo} {item.get('summary', '')}"
            ts = data_do(item)
            if not titulo or not link or link in vistos or not TERMOS.search(texto):
                continue
            if ts and ts < limite:
                continue
            vistos.add(link)
            saida.append({
                "fonte": f["nome"],
                "titulo": titulo,
                "url": link,
                "data": time.strftime("%d/%m/%Y", time.gmtime(ts)) if ts else "",
                "ts": ts,
            })
        print(f"[ok] {f['nome']}: {len(feed.entries)} itens lidos")
    saida.sort(key=lambda n: n["ts"], reverse=True)
    # Equilíbrio: no máximo 12 itens por fonte, para o arXiv não engolir o resto.
    por_fonte: dict[str, int] = {}
    final = []
    for n in saida:
        if por_fonte.get(n["fonte"], 0) < 12:
            final.append(n)
            por_fonte[n["fonte"]] = por_fonte.get(n["fonte"], 0) + 1
    return final[:MAX_ITENS]


if __name__ == "__main__":
    itens = coletar()
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(itens, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(itens)} itens gravados em {SAIDA.relative_to(RAIZ)}")
