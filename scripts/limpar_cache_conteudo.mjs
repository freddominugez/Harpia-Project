// O glob do Astro pode manter no data store um item apagado de uma coleção
// que ficou vazia. Um build de publicação deve partir dos arquivos atuais.
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

const cache = join(process.cwd(), 'node_modules', '.astro', 'data-store.json');
try {
  await unlink(cache);
  console.log('Cache de conteúdo do Astro limpo antes do build.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
