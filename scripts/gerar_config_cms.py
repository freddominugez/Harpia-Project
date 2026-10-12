"""Gera public/admin/config.yml a partir de scripts/cms-config.fonte.yml.

A fonte usa âncoras YAML para não repetir campos; o arquivo publicado sai expandido,
sem âncoras e sem chaves auxiliares (x-*), para qualquer leitor YAML entender igual.
Uso: python3 scripts/gerar_config_cms.py
"""
import yaml

class SemAlias(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

fonte = yaml.safe_load(open("scripts/cms-config.fonte.yml", encoding="utf-8"))
config = {k: v for k, v in fonte.items() if not k.startswith("x-")}
cabecalho = (
    "# GERADO por scripts/gerar_config_cms.py a partir de scripts/cms-config.fonte.yml.\n"
    "# Não edite aqui: edite a fonte e rode o script.\n"
    "# Painel de conteúdo do Harpya (Sveltia CMS). Documentação: docs/PAINEL_ADMIN.md.\n\n"
)
with open("public/admin/config.yml", "w", encoding="utf-8") as f:
    f.write(cabecalho)
    yaml.dump(config, f, Dumper=SemAlias, allow_unicode=True, sort_keys=False, width=140)
print("ok:", len(config["collections"]), "coleções")
