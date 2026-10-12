"""Coletor da curadoria diária do Harpya.

Lê as fontes ativas de src/content/fontes-monitoradas/, pega o que saiu nos últimos dias,
tira o que já está no site (publicado ou rascunho) e o que já foi avaliado e registrado em
curadoria/registro/, confere cada vídeo no oEmbed do YouTube e cada página por HTTP, e grava
curadoria/candidatos-diarios.json (arquivo de trabalho, fora do Git).

Não guarda estado: o registro diário é a memória. Assim, um dia sem novidade não gera commit.

Não escreve conteúdo: a decisão editorial (tema, resumo, módulo, nível, pautas) é da
tarefa agendada do Claude, descrita em docs/TAREFA_CURADORIA.md.

Uso:
    pip install -r scripts/requirements.txt
    python3 scripts/curadoria_diaria.py             # últimos 3 dias
    python3 scripts/curadoria_diaria.py --dias 7    # janela maior, depois de uma pausa
"""
from __future__ import annotations

import argparse
import calendar
import json
import re
import time
from pathlib import Path

import feedparser
import requests

RAIZ = Path(__file__).resolve().parent.parent
CONTEUDO = RAIZ / "src" / "content"
SAIDA = RAIZ / "curadoria" / "candidatos-diarios.json"
REGISTRO = RAIZ / "curadoria" / "registro"
UA = "harpya-curadoria/1.0 (+https://www.harpya.org)"

# Mesmo filtro temático do robô de news, ampliado para os módulos do catálogo de vídeos.
TERMOS = re.compile(
    r"embedding|vector (search|database|index|quantiz)|nearest[- ]neighbo|retriev|\bRAG\b|rerank|quantiz|"
    r"inner[- ]product|\bMIPS\b|rabitq|matryoshka|lattice|softmax|vocabular|tokeni[sz]|kv[- ]cache|"
    r"low[- ]bit|1[- ]bit|\bint[48]\b|tensor[- ]train|hyperbolic|transformer|attention|mixture[- ]of[- ]experts|\bMoE\b|"
    r"lora|fine[- ]tun|distill|rlhf|\bDPO\b|alignment|agent|tool[- ]use|multimodal|vision[- ]language|"
    r"(inference|decoding|serving) (cost|speed|latency|efficien)|efficient (inference|decoding|attention)|"
    r"speculative decoding|flash[- ]?attention|state[- ]space|mamba|reasoning|test[- ]time|"
    r"\bLLM|language model",
    re.I,
)


def ja_no_site() -> set[str]:
    """IDs de vídeo e URLs já presentes em qualquer status, para não repetir."""
    chaves: set[str] = set()
    for pasta in ("videos", "artigos", "livros", "fontes"):
        for arq in (CONTEUDO / pasta).glob("*.json"):
            item = json.loads(arq.read_text(encoding="utf-8"))
            for campo in ("id", "url", "fonte_url"):
                if item.get(campo):
                    chaves.add(str(item[campo]).lower().rstrip("/"))
    # Pautas e registros: toda URL citada já foi vista (aceita ou recusada).
    for arq in [*(CONTEUDO / "pautas").glob("*.md"), *REGISTRO.glob("*.md")]:
        for url in re.findall(r"https?://[^\s\"'<>)\]`]+", arq.read_text(encoding="utf-8")):
            url = url.lower().rstrip("/.,;")
            chaves.add(url)
            vid = id_youtube(url)
            if vid:
                chaves.add(vid.lower())
    return chaves


def id_youtube(link: str) -> str | None:
    m = re.search(r"(?:v=|youtu\.be/|/shorts/)([A-Za-z0-9_-]{11})", link)
    return m.group(1) if m else None


def oembed(video_id: str) -> dict | None:
    try:
        r = requests.get("https://www.youtube.com/oembed", params={"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"}, timeout=20, headers={"User-Agent": UA})
        return r.json() if r.status_code == 200 else None
    except requests.RequestException:
        return None


def ler_feed(url: str, tentativas: int = 3):
    """Baixa o feed com até 3 tentativas. O feed de canais do YouTube às vezes devolve 404 ou 500
    passageiros; a janela de 3 dias cobre o que ficar de fora num dia ruim."""
    ultimo = None
    for espera in (0, 2, 5)[:tentativas]:
        time.sleep(espera)
        try:
            r = requests.get(url, timeout=15, headers={"User-Agent": UA})
            if r.status_code == 200:
                feed = feedparser.parse(r.content)
                if feed.entries or not feed.bozo:
                    return feed, None
                ultimo = f"feed ilegível: {feed.bozo_exception}"
            else:
                ultimo = f"HTTP {r.status_code}"
        except requests.RequestException as erro:
            ultimo = str(erro)
    return None, (ultimo or "falha")[:200]


def http_ok(url: str) -> bool:
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": UA}, allow_redirects=True, stream=True)
        return r.status_code == 200
    except requests.RequestException:
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dias", type=float, default=3, help="janela em dias (padrão 3)")
    ap.add_argument("--max-por-fonte", type=int, default=8)
    args = ap.parse_args()

    agora = time.time()
    desde = agora - args.dias * 86400

    fontes = [json.loads(a.read_text(encoding="utf-8")) for a in sorted((CONTEUDO / "fontes-monitoradas").glob("*.json"))]
    fontes = [f for f in fontes if f.get("ativo")]
    conhecidos = ja_no_site()
    candidatos, falhas = [], []
    seguidas = 0

    for f in fontes:
        # Se o YouTube falhar em sequência, as tentativas extras só atrasam: passa a uma tentativa.
        feed, erro = ler_feed(f["feed"], 1 if seguidas >= 3 else 3)
        if erro:
            falhas.append({"fonte": f["nome"], "erro": erro})
            seguidas += f["tipo"] == "canal"
            continue
        seguidas = 0
        n = 0
        for e in feed.entries:
            t = e.get("published_parsed") or e.get("updated_parsed")
            ts = calendar.timegm(t) if t else 0
            if ts and ts < desde:
                continue
            titulo = " ".join(e.get("title", "").split())
            link = e.get("link", "")
            if not titulo or not link:
                continue
            vid = id_youtube(link) if f["tipo"] == "canal" else None
            chave = (vid or link).lower().rstrip("/")
            if chave in conhecidos:
                continue
            resumo = re.sub(r"<[^>]+>", " ", e.get("summary", "") or "")
            resumo = " ".join(resumo.split())[:600]
            # Sites: só entra o que toca o tema. Canais curados: tudo entra para avaliação.
            if f["tipo"] == "site" and not TERMOS.search(f"{titulo} {resumo}"):
                continue
            item = {"fonte": f["nome"], "tipo": f["tipo"], "relacionados": f.get("relacionados", []), "titulo_feed": titulo,
                    "url": link, "data": time.strftime("%Y-%m-%d", time.gmtime(ts)) if ts else "", "resumo_feed": resumo}
            if vid:
                o = oembed(vid)
                if not o:
                    continue  # privado, removido ou sem incorporação: não entra
                item.update({"video_id": vid, "titulo": o["title"], "canal": o["author_name"], "verificado": True})
            else:
                # Autores vêm do próprio feed (no arXiv, dc:creator), para a tarefa não precisar abrir a página.
                nomes = [a.get("name", "") for a in e.get("authors", []) if a.get("name")] or [e.get("author", "")]
                autores = ", ".join(n.strip() for n in ", ".join(nomes).split(",") if n.strip())
                item.update({"titulo": titulo, "autores_feed": autores, "ano": int(item["data"][:4]) if item["data"] else None,
                             "verificado": http_ok(link)})
            candidatos.append(item)
            conhecidos.add(chave)
            n += 1
            if n >= args.max_por_fonte:
                break

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps({"gerado_em": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(agora)),
                                 "desde": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(desde)),
                                 "fontes_lidas": len(fontes), "falhas": falhas, "candidatos": candidatos},
                                ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(candidatos)} candidatos de {len(fontes)} fontes; {len(falhas)} fontes com falha -> {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
