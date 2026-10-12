"""Confere se o painel (public/admin/config.yml) cobre todos os campos dos arquivos de conteúdo.

Um campo que existe no arquivo e não existe no painel pode ser perdido ao salvar pelo painel.
Sai com código 1 se encontrar diferença. Uso: python3 scripts/validar_cms.py
"""
import json, pathlib, sys, yaml

cfg = yaml.safe_load(open("public/admin/config.yml", encoding="utf-8"))
erros = []

def chaves_arquivo(p: pathlib.Path):
    if p.suffix == ".json":
        return set(json.loads(p.read_text(encoding="utf-8")).keys())
    texto = p.read_text(encoding="utf-8")
    fm = yaml.safe_load(texto.split("---", 2)[1]) if texto.startswith("---") else {}
    return set(fm.keys()) | {"body"}

for col in cfg["collections"]:
    alvos = []
    if "folder" in col:
        alvos = [(col["name"], sorted(pathlib.Path(col["folder"]).glob(f"*.{col['extension']}")), col["fields"])]
    for f in col.get("files", []):
        alvos.append((f"{col['name']}/{f['name']}", [pathlib.Path(f["file"])], f["fields"]))
    for nome, arquivos, campos in alvos:
        nomes = {c["name"] for c in campos}
        obrigatorios = {c["name"] for c in campos if c.get("required", True) and c.get("widget") not in ("hidden",) and "default" not in c}
        for a in arquivos:
            ch = chaves_arquivo(a)
            faltam_no_painel = ch - nomes
            faltam_no_arquivo = obrigatorios - ch
            if faltam_no_painel:
                erros.append(f"{a}: campos sem equivalente no painel: {sorted(faltam_no_painel)}")
            if faltam_no_arquivo:
                erros.append(f"{a}: campos obrigatórios do painel ausentes no arquivo: {sorted(faltam_no_arquivo)}")
        print(f"{nome}: {len(arquivos)} arquivos conferidos")

if erros:
    print("\n".join(erros)); sys.exit(1)
print("painel e conteúdo coerentes")
