// /auth: login do painel. Com e-mail e senha configurados, mostra a tela própria; senão, vai ao GitHub. Ver api/_oauth.js.
import { iniciar } from "./_oauth.js";

export default function handler(req, res) {
  return iniciar(req, res);
}
