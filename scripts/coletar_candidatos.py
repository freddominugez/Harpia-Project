"""Coletor de candidatos para a curadoria do Harpia Project.

Busca artigos (arXiv), vídeos (YouTube Data API v3, opcional) e livros (Open Library)
e grava curadoria/candidatos.json. Nada aqui vai direto para o site: o workflow
semanal abre um pull request, o agente de curadoria pontua e o autor aprova.

Uso local:
    pip install -r scripts/requirements.txt
    YOUTUBE_API_KEY=... python scripts/coletar_candidatos.py   # a chave é opcional
"""
from __future__ import annotations

import json
import os
import time
from pathlib import Path

import feedparser
import requests

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "curadoria" / "candidatos.json"
DADOS = RAIZ / "src" / "data"
UA = {"User-Agent": "harpia-project-curadoria/1.0"}

# Consultas ligadas aos caminhos. Edite à vontade.
ARXIV = [
    'abs:"embedding" AND abs:"quantization"',
    'abs:"maximum inner product search"',
    'abs:"nearest neighbor search" AND abs:"bound"',
    'abs:"lattice quantization"',
    'abs:"softmax" AND abs:"vocabulary" AND abs:"efficient"',
]
YOUTUBE = [
    "embeddings explained math",
    "vector search quantization",
    "transformer attention math explained",
    "linear algebra for machine learning",
]
LIVROS = ["information retrieval", "deep learning mathematics", "lattice quantization", "concentration inequalities"]


def ja_publicados() -> set[str]:
    chaves: set[str] = set()
    for nome, campo in (("videos.json", "id"), ("artigos.json", "url"), ("livros.json", "titulo")):
        try:
            for item in json.loads((DADOS / nome).read_text(encoding="utf-8")):
                chaves.add(str(item.get(campo, "")).lower())
        except FileNotFoundError:
            pass
    return chaves


def artigos(publicados: set[str]) -> list[dict]:
    saida = []
    for q in ARXIV:
        url = "https://export.arxiv.org/api/query"
        params = {"search_query": q, "sortBy": "submittedDate", "sortOrder": "descending", "max_results": 15}
        try:
            r = requests.get(url, params=params, headers=UA, timeout=30)
            r.raise_for_status()
        except requests.RequestException as erro:
            print(f"[aviso] arXiv '{q}': {erro}")
            continue
        for e in feedparser.parse(r.text).entries:
            link = e.get("id", "").replace("http://", "https://")
            if link.lower() in publicados:
                continue
            saida.append({
                "tipo": "artigo",
                "titulo": " ".join(e.get("title", "").split()),
                "autores": ", ".join(a.get("name", "") for a in e.get("authors", [])[:6]),
                "ano": int(e.get("published", "0000")[:4] or 0),
                "url": link,
                "resumo": " ".join(e.get("summary", "").split())[:600],
                "consulta": q,
            })
        time.sleep(3)  # o arXiv pede no máximo uma chamada a cada 3 segundos
    return saida


def videos(publicados: set[str]) -> list[dict]:
    chave = os.environ.get("YOUTUBE_API_KEY")
    if not chave:
        print("[info] YOUTUBE_API_KEY ausente: vídeos não coletados")
        return []
    saida = []
    for q in YOUTUBE:
        params = {"part": "snippet", "type": "video", "q": q, "maxResults": 10,
                  "relevanceLanguage": "en", "videoEmbeddable": "true", "key": chave}
        try:
            r = requests.get("https://www.googleapis.com/youtube/v3/search", params=params, timeout=30)
            r.raise_for_status()
        except requests.RequestException as erro:
            print(f"[aviso] YouTube '{q}': {erro}")
            continue
        for it in r.json().get("items", []):
            vid = it["id"].get("videoId", "")
            if not vid or vid.lower() in publicados:
                continue
            s = it["snippet"]
            saida.append({"tipo": "video", "id": vid, "titulo": s.get("title", ""), "canal": s.get("channelTitle", ""),
                          "publicado": s.get("publishedAt", "")[:10], "descricao": s.get("description", "")[:400], "consulta": q})
    return saida


def livros(publicados: set[str]) -> list[dict]:
    saida = []
    for q in LIVROS:
        try:
            r = requests.get("https://openlibrary.org/search.json", params={"q": q, "limit": 8}, headers=UA, timeout=30)
            r.raise_for_status()
        except requests.RequestException as erro:
            print(f"[aviso] Open Library '{q}': {erro}")
            continue
        for d in r.json().get("docs", []):
            titulo = d.get("title", "")
            if not titulo or titulo.lower() in publicados:
                continue
            saida.append({"tipo": "livro", "titulo": titulo, "autores": ", ".join(d.get("author_name", [])[:4]),
                          "ano": d.get("first_publish_year"), "url": f"https://openlibrary.org{d.get('key', '')}", "consulta": q})
    return saida


if __name__ == "__main__":
    pub = ja_publicados()
    todos = artigos(pub) + videos(pub) + livros(pub)
    vistos, unicos = set(), []
    for c in todos:
        chave = c.get("url") or c.get("id")
        if chave not in vistos:
            vistos.add(chave)
            unicos.append(c)
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps({"gerado_em": time.strftime("%Y-%m-%d"), "candidatos": unicos},
                                ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(unicos)} candidatos gravados em {SAIDA.relative_to(RAIZ)}")
