// /auth: primeiro passo do login do painel (redireciona para o GitHub). Ver api/_oauth.js.
import { iniciar } from "./_oauth.js";

export default function handler(req, res) {
  return iniciar(req, res);
}
