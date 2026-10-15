// Gera o valor de ADMIN_PASSWORD_HASH para o login por e-mail e senha do /admin.
// Uso: node scripts/gerar_hash_senha.mjs   (a senha é lida da entrada, sem aparecer na tela
// nem no histórico do terminal). Cole a linha impressa na Vercel, variável ADMIN_PASSWORD_HASH.
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const N = 16384, r = 8, p = 1, tamanho = 64;

async function lerSenha() {
  if (!process.stdin.isTTY) {
    let texto = "";
    for await (const parte of process.stdin) texto += parte;
    return texto.replace(/\r?\n$/, "");
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = () => {};
  process.stdout.write("Senha: ");
  const senha = await new Promise((ok) => rl.question("", ok));
  rl.close();
  process.stdout.write("\n");
  return senha;
}

const senha = await lerSenha();
if (senha.length < 10) {
  console.error("Use uma senha com pelo menos 10 caracteres.");
  process.exit(1);
}
const sal = randomBytes(16);
const hash = scryptSync(senha, sal, tamanho, { N, r, p });
console.log(`scrypt$${N}$${r}$${p}$${sal.toString("base64")}$${hash.toString("base64")}`);
