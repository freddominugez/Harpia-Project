import {build} from 'esbuild';
await build({entryPoints:['src/lib/business-schema.ts'],outfile:'public/admin/business/schemas.js',bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,alias:{'astro:content':'zod/v3'},banner:{js:'// @ts-nocheck\n// Gerado de src/lib/business-schema.ts por scripts/gerar_business_validator.mjs. Não editar.'}});
