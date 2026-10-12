"""Cria no GitHub Discussions as pautas aprovadas no painel.

Para cada src/content/pautas/*.md com status "aprovada" e sem discussao_url:
cria a discussão na categoria de mesmo nome, grava a URL no arquivo e muda o status
para "criada". Roda em .github/workflows/discussoes.yml com o GITHUB_TOKEN do próprio
repositório (permissão discussions: write). Nunca cria discussão de pauta só proposta.

Uso local (só para teste, com um token próprio na variável de ambiente):
    GITHUB_TOKEN=... GITHUB_REPOSITORY=freddominugez/Harpia-Project python3 scripts/criar_discussoes.py --simular
"""
from __future__ import annotations

import argparse
import os
import re
import sys
import unicodedata
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parent.parent
PAUTAS = RAIZ / "src" / "content" / "pautas"
API = "https://api.github.com/graphql"
SITE = "https://www.harpya.org"


def normal(t: str) -> str:
    return unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().strip().lower()


def frontmatter(texto: str) -> tuple[dict[str, str], str]:
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", texto, re.S)
    if not m:
        return {}, texto
    campos = {}
    for linha in m.group(1).splitlines():
        k = re.match(r"^([a-z_]+):\s*(.*)$", linha)
        if k:
            campos[k.group(1)] = k.group(2).strip().strip("\"'")
    links = re.findall(r"^\s*-\s*[\"']?(https?://[^\"'\s]+)", m.group(1), re.M)
    campos["_links"] = "\n".join(links)
    return campos, m.group(2).strip()


def gravar(arq: Path, url: str) -> None:
    texto = arq.read_text(encoding="utf-8")
    cab, resto = texto.split("\n---", 1)
    cab = re.sub(r"^status:.*$", 'status: "criada"', cab, flags=re.M)
    if re.search(r"^discussao_url:", cab, re.M):
        cab = re.sub(r"^discussao_url:.*$", f'discussao_url: "{url}"', cab, flags=re.M)
    else:
        cab += f'\ndiscussao_url: "{url}"'
    arq.write_text(cab + "\n---" + resto, encoding="utf-8")


def gql(token: str, query: str, variaveis: dict) -> dict:
    r = requests.post(API, json={"query": query, "variables": variaveis}, headers={"Authorization": f"Bearer {token}"}, timeout=30)
    r.raise_for_status()
    dados = r.json()
    if dados.get("errors"):
        raise RuntimeError(dados["errors"])
    return dados["data"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--simular", action="store_true", help="lista o que seria criado, sem criar")
    args = ap.parse_args()

    pendentes = []
    for arq in sorted(PAUTAS.glob("*.md")):
        campos, corpo = frontmatter(arq.read_text(encoding="utf-8"))
        if campos.get("status") == "aprovada" and not campos.get("discussao_url"):
            pendentes.append((arq, campos, corpo))
    if not pendentes:
        print("nenhuma pauta aprovada pendente")
        return 0

    token = os.environ.get("GITHUB_TOKEN", "")
    dono, repo = os.environ.get("GITHUB_REPOSITORY", "freddominugez/Harpia-Project").split("/")
    if args.simular or not token:
        for arq, campos, _ in pendentes:
            print(f"[simulação] {arq.name}: {campos['titulo']} -> {campos['categoria']}")
        return 0

    info = gql(token, """query($o:String!,$r:String!){repository(owner:$o,name:$r){id discussionCategories(first:50){nodes{id name}}}}""", {"o": dono, "r": repo})
    repo_id = info["repository"]["id"]
    categorias = {normal(c["name"]): c["id"] for c in info["repository"]["discussionCategories"]["nodes"]}

    falhas = 0
    for arq, campos, corpo in pendentes:
        cat = categorias.get(normal(campos.get("categoria", "")))
        if not cat:
            print(f"[erro] {arq.name}: categoria '{campos.get('categoria')}' não existe. Disponíveis: {', '.join(categorias)}")
            falhas += 1
            continue
        partes = [corpo]
        if campos.get("_links"):
            partes.append("**Referências**\n\n" + "\n".join(f"- {u}" for u in campos["_links"].splitlines()))
        if campos.get("caminho"):
            partes.append(f"Caminho no site: {SITE}/estudos/caminhos/{campos['caminho']}/")
        partes.append("_Pauta proposta no Harpya e aprovada pelo mantenedor. Traga medida, contraexemplo ou referência._")
        criada = gql(token, """mutation($r:ID!,$c:ID!,$t:String!,$b:String!){createDiscussion(input:{repositoryId:$r,categoryId:$c,title:$t,body:$b}){discussion{url}}}""",
                     {"r": repo_id, "c": cat, "t": campos["titulo"], "b": "\n\n".join(partes)})
        url = criada["createDiscussion"]["discussion"]["url"]
        gravar(arq, url)
        print(f"[ok] {arq.name} -> {url}")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
