"""Portão de publicação da curadoria técnica.

O agente editorial prepara arquivos com status ``rascunho`` e um manifesto de aprovação.
Este programa só promove itens aprovados depois de conferir a evidência, os metadados, a
identidade do arquivo, as URLs e duplicatas. Por padrão faz somente uma simulação.

Uso::

    python3 scripts/publicar_curadoria_tecnologia.py --manifest curadoria/aprovacoes/tecnologia/AAAA-MM-DD.json
    python3 scripts/publicar_curadoria_tecnologia.py --manifest curadoria/aprovacoes/tecnologia/AAAA-MM-DD.json --apply

O manifesto tem o formato::

    {"data":"AAAA-MM-DD","items":[{
      "path":"src/content/videos/ID.json", "sha256":"hash do rascunho",
      "verificacao":{"responsavel":"T2", "evidencias":["https://..."],
        "alegacoes":[{"texto":"alegação material","url":"https://...",
                       "resultado":"confirmada"}]},
      "selecao":{"responsavel":"T3", "nota":4, "justificativa":"..."}
    }]}

O manifesto fica no repositório e deve entrar no mesmo commit dos itens publicados.
Após ``--apply``, cada entrada recebe ``sha256_publicado`` para permitir reexecução
idempotente e conferir a integridade do material publicado.

Este portão verifica dados e proveniência, mas o manifesto é a atestação editorial de
que a leitura das fontes foi feita por pessoas ou agentes independentes. Não simula
revisão integral de vídeo, livro ou paper. O build/QA e o deploy continuam obrigatórios
após a promoção; a orquestração deve revertê-la se esses portões falharem.
"""

from __future__ import annotations

import argparse
import hashlib
import ipaddress
import json
import os
import re
import tempfile
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parent.parent
COLLECTIONS = {"noticias", "artigos", "videos", "livros", "filmes"}
VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
USER_AGENT = "Harpya-editorial/1.0 (+https://www.harpya.org)"
FORTALEZA = ZoneInfo("America/Fortaleza")


def today() -> date:
    return datetime.now(FORTALEZA).date()


class Reprovado(ValueError):
    """Item não pode ser publicado automaticamente."""


def require(test: bool, message: str) -> None:
    if not test:
        raise Reprovado(message)


def is_https_public(value: str) -> bool:
    try:
        url = urlparse(value)
        host = url.hostname or ""
        if url.scheme != "https" or not host or url.username or url.password or url.port not in (None, 443):
            return False
        if host == "localhost" or host.endswith(".local"):
            return False
        try:
            ipaddress.ip_address(host)
            return False  # O manifesto usa domínios institucionais, nunca IPs literais.
        except ValueError:
            return True
    except (TypeError, ValueError):
        return False


def get_checked(url: str, *, session=requests, params: dict | None = None):
    """Baixa URL HTTPS pública, validando cada redirecionamento."""
    require(is_https_public(url), f"URL não pública ou insegura: {url}")
    target = url
    for _ in range(4):
        try:
            response = session.get(target, params=params, timeout=18,
                                   headers={"User-Agent": USER_AGENT},
                                   allow_redirects=False, stream=True)
        except requests.RequestException as exc:
            raise Reprovado(f"Falha de rede em {target}: {exc}") from exc
        if response.status_code in (301, 302, 303, 307, 308):
            location = response.headers.get("Location", "")
            response.close()
            target = urljoin(target, location)
            require(is_https_public(target), f"Redirecionamento inseguro: {target}")
            params = None
            continue
        require(response.status_code == 200, f"HTTP {response.status_code}: {target}")
        return response
    raise Reprovado(f"Redirecionamentos demais: {url}")


def check_url(url: str, *, session=requests) -> None:
    response = get_checked(url, session=session)
    response.close()


def normalized(value: str) -> str:
    return " ".join(value.casefold().split())


def verify_video(item: dict, *, session=requests) -> None:
    vid = str(item.get("id", ""))
    require(bool(VIDEO_ID.fullmatch(vid)), "ID do YouTube inválido")
    expected = f"https://www.youtube.com/watch?v={vid}"
    require(item.get("fonte_url") == expected, "fonte_url do vídeo não corresponde ao ID")
    response = get_checked("https://www.youtube.com/oembed", session=session,
                           params={"url": expected, "format": "json"})
    try:
        meta = response.json()
    except (ValueError, requests.RequestException) as exc:
        raise Reprovado(f"oEmbed do vídeo inválido: {vid}") from exc
    finally:
        response.close()
    require(normalized(str(meta.get("title", ""))) == normalized(str(item.get("titulo", ""))),
            f"Título do YouTube diverge do cadastro: {vid}")
    require(normalized(str(meta.get("author_name", ""))) == normalized(str(item.get("canal", ""))),
            f"Canal do YouTube diverge do cadastro: {vid}")


def item_source_urls(collection: str, item: dict) -> set[str]:
    if collection == "noticias":
        return {str(f.get("url", "")) for f in item.get("fontes", [])}
    if collection == "videos":
        return {str(item.get("fonte_url", ""))}
    if collection == "filmes":
        urls = {str(item.get("url", ""))}
        for key in ("assistir_url", "imagem_fonte"):
            if item.get(key):
                urls.add(str(item[key]))
        return urls
    return {str(item.get("fonte_url", ""))} | ({str(item["url"])} if item.get("url") else set())


def validate_content(collection: str, item: dict, root: Path = ROOT) -> None:
    require(item.get("status") in ("rascunho", "publicado"),
            "item deve estar em rascunho ou já publicado pelo manifesto")
    require(item.get("origem") == "curadoria-diaria", "origem deve ser curadoria-diaria")
    require(len(str(item.get("titulo", "")).strip()) >= 3, "título ausente")
    require(date.fromisoformat(str(item.get("verificado_em", ""))) <= today(),
            "data de verificação inválida ou futura")
    if collection == "noticias":
        require(20 <= len(item["titulo"]) <= 140, "título de notícia fora de 20–140 caracteres")
        require(60 <= len(str(item.get("resumo", ""))) <= 200,
                "resumo de notícia fora de 60–200 caracteres")
        corpo = item.get("corpo", [])
        require(isinstance(corpo, list) and 2 <= len(corpo) <= 8
                and all(isinstance(p, str) and len(p) >= 40 for p in corpo),
                "corpo de notícia fora do schema")
        require(40 <= len(str(item.get("harpia", ""))) <= 400, "contexto Harpya fora do schema")
        require(isinstance(item.get("fontes"), list) and 1 <= len(item["fontes"]) <= 8,
                "notícia sem fontes válidas")
    elif collection == "artigos":
        require(isinstance(item.get("ano"), int) and 1900 <= item["ano"] <= today().year,
                "ano do artigo inválido")
        require(str(item.get("autores", "")).strip() and str(item.get("rotulo", "")).strip(),
                "autoria ou rótulo do artigo ausentes")
        require(item.get("grupo") in ("fund", "busca", "arte"), "grupo de artigo inválido")
        require(item.get("selo") in ("medido", "arte", "lacuna", "teste"), "selo inválido")
    elif collection == "videos":
        require(bool(VIDEO_ID.fullmatch(str(item.get("id", "")))), "ID de vídeo inválido")
        require(str(item.get("canal", "")).strip(), "canal ausente")
        require(len(str(item.get("resumo", ""))) >= 20, "resumo de vídeo curto")
        require(item.get("nivel") in ("Iniciante", "Intermediário", "Avançado"), "nível inválido")
        require(isinstance(item.get("modulo"), int) and 0 <= item["modulo"] <= 99,
                "módulo inválido")
    elif collection == "livros":
        require(str(item.get("autores", "")).strip() and str(item.get("nota", "")).strip(),
                "autoria ou nota do livro ausentes")
        require(str(item.get("uso", "")).strip() and str(item.get("resenha", "")).strip(),
                "livro sem uso no Harpya ou resenha")
        require(item.get("cor") in {f"c{i}" for i in range(1, 7)}, "cor do card inválida")
        require(not item.get("capa") or str(item["capa"]).startswith("/img/livros/"),
                "capa não é arquivo local aprovado")
    elif collection == "filmes":
        require(isinstance(item.get("ano"), int) and 1895 <= item["ano"] <= today().year,
                "ano do filme inválido")
        require(len(str(item.get("direcao", "")).strip()) >= 2, "direção ausente")
        require(60 <= len(str(item.get("resumo", ""))) <= 200,
                "resumo de filme fora de 60–200 caracteres")
        require(len(str(item.get("porque_ver", ""))) >= 40
                and len(str(item.get("limites", ""))) >= 20,
                "relevância ou limites do filme insuficientes")
        require(str(item.get("revisor", "")).strip()
                and bool(str(item.get("revisado_em", "")).strip()),
                "filme publicado exige revisor e data")
        if item.get("imagem"):
            image = str(item["imagem"])
            require(bool(re.fullmatch(r"/img/filmes/[A-Za-z0-9._-]+", image)),
                    "caminho da imagem do filme inválido")
            require((root / "public" / image.lstrip("/")).is_file(),
                    "imagem do filme ausente")
            require(all(str(item.get(key, "")).strip() for key in
                        ("imagem_credito", "imagem_fonte", "imagem_licenca")),
                    "imagem do filme sem licença, crédito ou fonte")
    sources = item_source_urls(collection, item)
    require(bool(sources) and all(is_https_public(url) for url in sources),
            "fonte primária ausente ou sem HTTPS público")


def validate_manifest_entry(entry: dict, collection: str, item: dict) -> set[str]:
    verification = entry.get("verificacao", {})
    selection = entry.get("selecao", {})
    verifier = str(verification.get("responsavel", "")).strip()
    selector = str(selection.get("responsavel", "")).strip()
    require(verifier and selector and verifier != selector,
            "verificação e seleção exigem responsáveis distintos")
    require(isinstance(selection.get("nota"), (int, float)) and selection["nota"] >= 4
            and selection["nota"] <= 5, "nota editorial deve ser de 4 a 5")
    require(len(str(selection.get("justificativa", "")).strip()) >= 30,
            "justificativa editorial insuficiente")
    evidences = verification.get("evidencias", [])
    require(isinstance(evidences, list) and evidences and
            all(isinstance(url, str) and is_https_public(url) for url in evidences),
            "evidências HTTPS ausentes ou inválidas")
    evidence_set = set(evidences)
    sources = item_source_urls(collection, item)
    require(sources <= evidence_set, "fontes do cadastro ausentes nas evidências")
    claims = verification.get("alegacoes", [])
    require(isinstance(claims, list) and claims, "nenhuma alegação foi verificada")
    for claim in claims:
        require(isinstance(claim, dict) and len(str(claim.get("texto", "")).strip()) >= 15,
                "alegação sem descrição suficiente")
        require(claim.get("url") in evidence_set, "alegação sem URL entre as evidências")
        require(claim.get("resultado") in ("confirmada", "qualificada"),
                "alegação não confirmada")
    return evidence_set


def duplicate_keys(collection: str, item: dict) -> set[str]:
    keys = {f"{collection}:{url.rstrip('/').casefold()}"
            for url in item_source_urls(collection, item) if url}
    if collection == "videos":
        keys.add(f"{collection}:{str(item['id']).casefold()}")
    return keys


def validate_duplicates(root: Path, selected: list[tuple[Path, str, dict]]) -> None:
    selected_paths = {path.resolve() for path, _, _ in selected}
    candidates: dict[str, Path] = {}
    for path, collection, item in selected:
        for key in duplicate_keys(collection, item):
            require(key not in candidates, f"duplicata no manifesto: {path} / {candidates.get(key)}")
            candidates[key] = path
    for folder in COLLECTIONS:
        for path in (root / "src" / "content" / folder).glob("*.json"):
            if path.resolve() in selected_paths:
                continue
            try:
                item = json.loads(path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, UnicodeError) as exc:
                raise Reprovado(f"arquivo de conteúdo ilegível: {path}") from exc
            for key in duplicate_keys(folder, item):
                require(key not in candidates, f"duplicata existente: {path} / {candidates.get(key)}")


def prepare(manifest_path: Path, root: Path = ROOT, *, network: bool = True,
            session=requests) -> list[tuple[Path, str, dict]]:
    approved_dir = root / "curadoria" / "aprovacoes" / "tecnologia"
    require(manifest_path.resolve().parent == approved_dir.resolve()
            and manifest_path.suffix == ".json",
            "manifesto deve ficar em curadoria/aprovacoes/tecnologia/*.json")
    require(bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}\.json", manifest_path.name)),
            "nome do manifesto deve ser AAAA-MM-DD.json")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    require(isinstance(manifest, dict) and isinstance(manifest.get("items"), list),
            "manifesto sem lista items")
    require(1 <= len(manifest["items"]) <= 10, "manifesto deve ter de 1 a 10 itens")
    manifest_date = date.fromisoformat(str(manifest.get("data", "")))
    require(manifest_date.isoformat() == manifest_path.stem,
            "data do manifesto diverge do nome do arquivo")
    require(manifest_date <= today(), "data do manifesto futura")
    selected: list[tuple[Path, str, dict]] = []
    all_evidence: set[str] = set()
    for entry in manifest["items"]:
        require(isinstance(entry, dict), "item de manifesto inválido")
        relative = Path(str(entry.get("path", "")))
        require(not relative.is_absolute() and len(relative.parts) == 4
                and relative.parts[:2] == ("src", "content")
                and relative.parts[2] in COLLECTIONS and relative.suffix == ".json",
                f"caminho fora das coleções técnicas: {relative}")
        collection = relative.parts[2]
        path = root / relative
        require(path.is_file() and not path.is_symlink(), f"rascunho ausente: {relative}")
        blob = path.read_bytes()
        current_hash = hashlib.sha256(blob).hexdigest()
        item = json.loads(blob)
        if item.get("status") == "publicado":
            require(current_hash == entry.get("sha256_publicado"),
                    f"hash da publicação divergente: {relative}")
        else:
            require(current_hash == entry.get("sha256"),
                    f"hash do rascunho divergente: {relative}")
        validate_content(collection, item, root)
        evidences = validate_manifest_entry(entry, collection, item)
        if collection == "videos":
            require(relative.stem == item["id"], "nome do vídeo não corresponde ao ID")
        selected.append((path, collection, item))
        all_evidence.update(evidences)
    validate_duplicates(root, selected)
    if network:
        for url in sorted(all_evidence):
            check_url(url, session=session)
        for _, collection, item in selected:
            if collection == "videos":
                verify_video(item, session=session)
    return selected


def promote(selected: list[tuple[Path, str, dict]], manifest_path: Path) -> None:
    """Troca status e registra hashes finais; rollback se a escrita falhar."""
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    originals = {path: path.read_bytes() for path, _, _ in selected}
    original_manifest = manifest_path.read_bytes()
    written: list[Path] = []
    try:
        for index, (path, _, item) in enumerate(selected):
            if item["status"] == "publicado":
                continue
            updated = dict(item, status="publicado")
            payload = (json.dumps(updated, ensure_ascii=False, indent=2) + "\n").encode()
            manifest["items"][index]["sha256_publicado"] = hashlib.sha256(payload).hexdigest()
            fd, tmp = tempfile.mkstemp(prefix=f".{path.stem}.", dir=path.parent)
            try:
                with os.fdopen(fd, "wb") as out:
                    out.write(payload)
                os.replace(tmp, path)
            finally:
                if os.path.exists(tmp):
                    os.unlink(tmp)
            written.append(path)
        if written:
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                                     encoding="utf-8")
    except OSError:
        for path in written:
            path.write_bytes(originals[path])
        manifest_path.write_bytes(original_manifest)
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--apply", action="store_true", help="promove os rascunhos após validar")
    args = parser.parse_args()
    try:
        selected = prepare(args.manifest)
        pending = [path for path, _, item in selected if item["status"] != "publicado"]
        if args.apply:
            promote(selected, args.manifest)
        if args.apply and not pending:
            label = "Já publicados"
        else:
            label = "Publicados" if args.apply else "Aptos para publicação"
        print(f"{label}: "
              + ", ".join(str(path.relative_to(ROOT)) for path, _, _ in selected))
        return 0
    except (Reprovado, ValueError, OSError, json.JSONDecodeError) as exc:
        print(f"BLOQUEADO: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
