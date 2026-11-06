export type Ambiente = 'tecnologia' | 'business';
export const AMBIENTES = {
  tecnologia: { nome: 'Harpya Tecnologia e Matemática', inicio: '/tecnologia/', subtitulo: 'Pesquisa aberta' },
  business: { nome: 'Harpya Business', inicio: '/business/', subtitulo: 'Marketing e administração' },
} as const;
export const ambienteDaRota = (path: string): Ambiente => path.startsWith('/business/') ? 'business' : 'tecnologia';
export const PORTAL_DESCRICAO = 'Dois ambientes de conhecimento: tecnologia e matemática, marketing e administração. Pesquisa, curadoria e comunidade no Harpya.';
