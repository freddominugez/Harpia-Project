// Servidor do fórum do Harpya: Waline (https://waline.js.org), MIT.
// Configuração por variáveis de ambiente na Vercel (ver docs/FORUM.md).
const Application = require("@waline/vercel");

module.exports = Application({
  plugins: [],
  async postSave() {},
});
