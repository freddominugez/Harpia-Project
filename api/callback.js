// /callback: o GitHub volta aqui; o token é entregue à janela do painel. Ver api/_oauth.js.
import { concluir } from "./_oauth.js";

export default function handler(req, res) {
  return concluir(req, res);
}
