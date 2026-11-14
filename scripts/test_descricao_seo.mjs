import test from "node:test";
import assert from "node:assert/strict";
import { descricaoSeo, DESCRICAO_MAX, DESCRICAO_MIN } from "../src/lib/descricao-seo.mjs";

test("descrição dentro da faixa fica como está", () => {
  const d = "Entenda atribuição, incrementalidade e pressupostos das contas de retorno.";
  assert.equal(descricaoSeo(d, "Mensuração"), d);
});

test("descrição longa é cortada no fim de uma frase", () => {
  const d = "Primeira frase com tamanho suficiente para passar do mínimo exigido. " + "Segunda frase bem mais comprida. ".repeat(10);
  const r = descricaoSeo(d);
  assert.ok(r.length <= DESCRICAO_MAX && r.length >= DESCRICAO_MIN);
  assert.ok(r.endsWith("."));
});

test("sem fim de frase, corta na palavra e põe reticências", () => {
  const r = descricaoSeo("palavra ".repeat(60));
  assert.ok(r.length <= DESCRICAO_MAX);
  assert.ok(r.endsWith("palavra…"));
});

test("descrição curta ganha o título na frente", () => {
  const r = descricaoSeo("Conecte escuta, melhoria da entrega e retenção.", "Experiência, relacionamento e fidelização");
  assert.equal(r, "Experiência, relacionamento e fidelização: Conecte escuta, melhoria da entrega e retenção.");
  assert.ok(r.length >= DESCRICAO_MIN);
});

test("espaços e quebras de linha viram um espaço", () => {
  assert.equal(descricaoSeo("  Uma descrição\n com   espaços sobrando, mas de tamanho bom o bastante.  "), "Uma descrição com espaços sobrando, mas de tamanho bom o bastante.");
});
