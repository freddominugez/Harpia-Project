"""Migração única: listas de src/data/*.json para um arquivo por item em src/content/.
Mantida no repositório como registro de como a estrutura foi criada."""
import json, os, re, unicodedata

def slug(s, n=60):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:n].rstrip("-") or "item"

HOJE = "2026-10-12"
BASE = {"status": "publicado", "origem": "manual", "adicionado_em": HOJE, "verificado_em": HOJE}

def grava(col, nome, dados):
    os.makedirs(f"src/content/{col}", exist_ok=True)
    caminho = f"src/content/{col}/{nome}.json"
    assert not os.path.exists(caminho), f"repetido: {caminho}"
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
        f.write("\n")

def unico(usados, base):
    s, i = base, 2
    while s in usados:
        s = f"{base}-{i}"; i += 1
    usados.add(s); return s

d = lambda n: json.load(open(f"src/data/{n}.json", encoding="utf-8"))

for i, v in enumerate(d("videos")):
    grava("videos", v["id"], {**v, "ordem": i + 1, "fonte_url": f"https://www.youtube.com/watch?v={v['id']}", **BASE})
for m in d("modulos"):
    grava("modulos", f"{m['numero']:02d}", m)
us = set()
for i, a in enumerate(d("artigos")):
    grava("artigos", unico(us, f"{a['ano']}-{slug(a['titulo'], 50)}"), {**a, "ordem": i + 1, "fonte_url": a["url"], **BASE})
us = set()
for i, l in enumerate(d("livros")):
    grava("livros", unico(us, slug(l["titulo"])), {**l, "ordem": i + 1, "fonte_url": l.get("url", ""), **BASE})
us = set()
k = 0
for gi, g in enumerate(d("fontes")):
    for n, u, desc in g["itens"]:
        k += 1
        grava("fontes", unico(us, slug(n)), {"nome": n, "url": u, "descricao": desc, "grupo": g["grupo"], "grupo_ordem": gi + 1, "ordem": k, "fonte_url": u, **BASE})
us = set()
for i, f in enumerate(d("feeds")):
    grava("feeds", unico(us, slug(f["nome"])), {**f, "ordem": i + 1})
us = set()
for i, x in enumerate(d("ml")):
    grava("aprendizado", unico(us, f"{x['ano']}-{slug(x['titulo'], 40)}"), {**x, "ordem": i + 1, **BASE})
us = set(); era = None; k = 0
for x in d("timeline"):
    if "era" in x:
        era = x["era"]; continue
    k += 1
    grava("linha-do-tempo", unico(us, f"{x['ano']}-{slug(x['titulo'], 40)}"), {**x, "era": era, "marco": bool(x.get("marco")), "ordem": k, **BASE})
print("ok")
