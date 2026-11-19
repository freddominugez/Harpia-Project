import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const inicio = '2026-11-19';
const regras = [
  { pasta: 'src/content/noticias', manifestos: 'curadoria/aprovacoes/tecnologia', campo: 'adicionado_em' },
  { pasta: 'src/content/artigos', manifestos: 'curadoria/aprovacoes/tecnologia', campo: 'adicionado_em' },
  { pasta: 'src/content/business/acervo', manifestos: 'curadoria/business/aprovacoes', campo: 'revisado_em' },
];

function aprovacoes(pasta) {
  const dir = join(raiz, pasta);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(nome => nome.endsWith('.json')).flatMap(nome => {
    const manifesto = JSON.parse(readFileSync(join(dir, nome), 'utf8'));
    return (manifesto.items ?? []).map(item => ({ ...item, manifesto: `${pasta}/${nome}` }));
  });
}

const aprovadas = new Map();
for (const pasta of [...new Set(regras.map(r => r.manifestos))]) {
  for (const item of aprovacoes(pasta)) {
    const lista = aprovadas.get(item.path) ?? [];
    lista.push(item);
    aprovadas.set(item.path, lista);
  }
}

const problemas = [];
let conferidas = 0;
for (const regra of regras) {
  const dir = join(raiz, regra.pasta);
  for (const nome of readdirSync(dir).filter(nome => nome.endsWith('.json'))) {
    const arquivo = join(dir, nome);
    const bytes = readFileSync(arquivo);
    const conteudo = JSON.parse(bytes.toString('utf8'));
    if (conteudo.status !== 'publicado' || !conteudo[regra.campo] || conteudo[regra.campo] < inicio) continue;
    const caminho = relative(raiz, arquivo).replaceAll('\\', '/');
    const hash = createHash('sha256').update(bytes).digest('hex');
    const valido = (aprovadas.get(caminho) ?? []).some(item =>
      item.manifesto.startsWith(`${regra.manifestos}/`) &&
      item.sha256_publicado === hash &&
      item.verificacao?.responsavel &&
      item.verificacao?.evidencias?.length > 0 &&
      item.selecao?.responsavel &&
      (item.publicacao?.responsavel || typeof item.publicacao === 'string')
    );
    if (!valido) problemas.push(`${caminho}: publicação sem manifesto aprovado e hash correspondente`);
    conferidas++;
  }
}

if (problemas.length) {
  console.error(`Portão editorial recusou ${problemas.length} publicação(ões):\n${problemas.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Portão editorial: ${conferidas} publicação(ões) recentes com aprovação e hash conferidos.`);
}
