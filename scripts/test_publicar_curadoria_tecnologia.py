"""Portões que evitam promoção indevida e permitem repetição segura da rotina."""

from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from scripts import publicar_curadoria_tecnologia as gate


class PublicacaoTecnologiaTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.today = datetime.now(ZoneInfo("America/Fortaleza")).date().isoformat()
        self.relative = Path("src/content/artigos/2026-exemplo.json")
        self.path = self.root / self.relative
        self.path.parent.mkdir(parents=True)
        self.manifest = self.root / "curadoria/aprovacoes/tecnologia" / f"{self.today}.json"
        self.manifest.parent.mkdir(parents=True)
        self.source = "https://example.org/research/example"
        self.item = {
            "ano": 2026, "titulo": "Exemplo de pesquisa conferida", "autores": "Pessoa Pesquisadora",
            "url": self.source, "grupo": "busca", "selo": "arte", "rotulo": "arte prévia",
            "fonte_url": self.source, "status": "rascunho", "origem": "curadoria-diaria",
            "adicionado_em": self.today, "verificado_em": self.today,
        }
        self.path.write_text(json.dumps(self.item, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
        self.entry = {
            "path": self.relative.as_posix(),
            "sha256": hashlib.sha256(self.path.read_bytes()).hexdigest(),
            "verificacao": {
                "responsavel": "T2", "evidencias": [self.source],
                "alegacoes": [{"texto": "O artigo apresenta um método de busca.",
                              "url": self.source, "resultado": "confirmada"}],
            },
            "selecao": {"responsavel": "T3", "nota": 4.5,
                        "justificativa": "Método pertinente e fonte original examinada."},
        }
        self.save_manifest()

    def save_manifest(self):
        self.manifest.write_text(json.dumps({"data": self.today, "items": [self.entry]},
                                            ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def test_simulacao_promocao_e_reexecucao(self):
        prepared = gate.prepare(self.manifest, self.root, network=False)
        self.assertEqual(json.loads(self.path.read_text())["status"], "rascunho")
        gate.promote(prepared, self.manifest)
        self.assertEqual(json.loads(self.path.read_text())["status"], "publicado")
        self.assertEqual(gate.prepare(self.manifest, self.root, network=False)[0][0], self.path)
        gate.promote(gate.prepare(self.manifest, self.root, network=False), self.manifest)
        self.assertEqual(json.loads(self.path.read_text())["status"], "publicado")

    def test_hash_adulterado_bloqueia(self):
        self.entry["sha256"] = "0" * 64
        self.save_manifest()
        with self.assertRaisesRegex(gate.Reprovado, "hash do rascunho divergente"):
            gate.prepare(self.manifest, self.root, network=False)

    def test_nome_e_data_do_manifesto_devem_coincidir(self):
        malformed = self.manifest.with_name("aprovacao.json")
        malformed.write_bytes(self.manifest.read_bytes())
        with self.assertRaisesRegex(gate.Reprovado, "nome do manifesto"):
            gate.prepare(malformed, self.root, network=False)
        wrong_date = self.manifest.with_name("2026-01-01.json")
        wrong_date.write_bytes(self.manifest.read_bytes())
        with self.assertRaisesRegex(gate.Reprovado, "data do manifesto diverge"):
            gate.prepare(wrong_date, self.root, network=False)

    def test_alegacao_nao_verificada_bloqueia(self):
        self.entry["verificacao"]["alegacoes"][0]["resultado"] = "não verificada"
        self.save_manifest()
        with self.assertRaisesRegex(gate.Reprovado, "alegação não confirmada"):
            gate.prepare(self.manifest, self.root, network=False)

    def test_responsaveis_iguais_bloqueia(self):
        self.entry["selecao"]["responsavel"] = "T2"
        self.save_manifest()
        with self.assertRaisesRegex(gate.Reprovado, "responsáveis distintos"):
            gate.prepare(self.manifest, self.root, network=False)

    def test_duplicata_bloqueia(self):
        other = self.root / "src/content/artigos/2026-duplicata.json"
        other.write_text(json.dumps({**self.item, "status": "publicado"}), encoding="utf-8")
        with self.assertRaisesRegex(gate.Reprovado, "duplicata existente"):
            gate.prepare(self.manifest, self.root, network=False)

    def test_url_local_ou_http_bloqueia(self):
        self.assertFalse(gate.is_https_public("http://example.org/x"))
        self.assertFalse(gate.is_https_public("https://localhost/x"))
        self.assertFalse(gate.is_https_public("https://127.0.0.1/x"))
        self.assertFalse(gate.is_https_public("https://example.org:8443/x"))
        self.assertTrue(gate.is_https_public(self.source))

    def test_noticia_exige_corpo_e_fontes(self):
        self.relative = Path("src/content/noticias/estudo-verificado.json")
        self.path = self.root / self.relative
        self.path.parent.mkdir(parents=True)
        self.item = {
            "titulo": "Estudo recente examina limites de busca vetorial",
            "resumo": "O trabalho descreve uma comparação de métodos e explica os limites da amostra avaliada.",
            "data": self.today, "categoria": "pesquisa", "icone": "lupa",
            "corpo": ["O estudo original apresenta os métodos comparados e os dados usados na avaliação.",
                      "A conclusão se restringe ao conjunto de testes descrito pelos autores no trabalho."],
            "harpia": "A leitura ajuda a formular novos testes no Harpya, mas não valida um caminho próprio.",
            "fontes": [{"veiculo": "Universidade", "titulo": "Estudo original", "url": self.source}],
            "status": "rascunho", "origem": "curadoria-diaria",
            "adicionado_em": self.today, "verificado_em": self.today,
        }
        self.path.write_text(json.dumps(self.item, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
        self.entry["path"] = self.relative.as_posix()
        self.entry["sha256"] = hashlib.sha256(self.path.read_bytes()).hexdigest()
        self.save_manifest()
        self.assertEqual(gate.prepare(self.manifest, self.root, network=False)[0][1], "noticias")
        self.item["fontes"] = []
        self.path.write_text(json.dumps(self.item, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
        self.entry["sha256"] = hashlib.sha256(self.path.read_bytes()).hexdigest()
        self.save_manifest()
        with self.assertRaisesRegex(gate.Reprovado, "notícia sem fontes"):
            gate.prepare(self.manifest, self.root, network=False)

    def test_filme_sem_capa_usa_arte_do_site(self):
        self.relative = Path("src/content/filmes/documentario-exemplo.json")
        self.path = self.root / self.relative
        self.path.parent.mkdir(parents=True)
        self.item = {
            "titulo": "Documentário de exemplo", "direcao": "Diretora Exemplo", "ano": 2025,
            "resumo": "Documentário que explica o desenvolvimento de uma tecnologia e apresenta entrevistas com os pesquisadores.",
            "porque_ver": "Ajuda a situar os desafios de pesquisa estudados no Harpya.",
            "limites": "A obra não substitui artigos técnicos.", "url": self.source,
            "revisor": "T2", "revisado_em": self.today,
            "status": "rascunho", "origem": "curadoria-diaria",
            "adicionado_em": self.today, "verificado_em": self.today,
        }
        self.path.write_text(json.dumps(self.item, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
        self.entry["path"] = self.relative.as_posix()
        self.entry["sha256"] = hashlib.sha256(self.path.read_bytes()).hexdigest()
        self.save_manifest()
        prepared = gate.prepare(self.manifest, self.root, network=False)
        gate.promote(prepared, self.manifest)
        self.assertEqual(json.loads(self.path.read_text())["status"], "publicado")


if __name__ == "__main__":
    unittest.main()
