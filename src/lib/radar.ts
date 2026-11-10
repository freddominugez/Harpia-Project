import raw from '../../public/data/radar-ia.json';
import editorial from '../../public/data/radar-curadoria.json';
import sources from '../../scripts/fontes_ia.json';

export type RadarItem = { id: string; source_id: string; company: string; title: string; summary: string; url: string; published_at: string; verified_at: string; impact_score: number; topics: string[] };
export type SourceStatus = { id: string; nome: string; site: string; canal: string; status: string; item_count: number; checked_at: string; error?: string };
const configs = new Map(sources.map(source => [source.id, source]));
export function isOfficial(item: Pick<RadarItem, 'source_id' | 'url'>) {
  const source = configs.get(item.source_id);
  if (!source) return false;
  try {
    const url = new URL(item.url);
    if (source.id === 'anthropic' && ['/news/announcements','/news/features','/news/research','/news/partnerships','/news/company','/news/product','/news/policy','/news/events'].includes(url.pathname.replace(/\/$/, ''))) return false;
    return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') &&
      source.hosts.includes(url.hostname) && (source.prefixos.some(prefix => url.pathname.startsWith(prefix) && url.pathname.length > prefix.length) || (source.id === 'deepseek' && url.pathname === '/updates/' && !!url.hash));
  } catch { return false; }
}
const data = raw as unknown as { checked_at: string; last_successful_at: string | null; featured_id: string | null; sources: SourceStatus[]; items: RadarItem[] };
export const RADAR = (data.items || []).filter(item => typeof item.title === 'string' && item.title.length >= 5 && item.title.length <= 190 && typeof item.summary === 'string' && item.summary.length <= 241 && isOfficial(item) && Number.isFinite(Date.parse(item.published_at)) && Date.parse(item.published_at) <= Date.now() && Date.parse(item.published_at) >= Date.now() - 45 * 86400000)
  .map(item => ({ ...item, company: configs.get(item.source_id)!.nome }))
  .sort((a, b) => b.published_at.localeCompare(a.published_at));
export const RADAR_SOURCES: SourceStatus[] = sources.map(source => {
  const health = (data.sources || []).find(item => item.id === source.id);
  return { id: source.id, nome: source.nome, site: source.site, canal: source.canal, status: health && ['ok','error','no_recent_items'].includes(health.status) ? health.status : 'error', item_count: health?.item_count || 0, checked_at: health?.checked_at || data.checked_at };
});
export const RADAR_CHECKED = data.checked_at;
export const RADAR_LAST_SUCCESS = data.last_successful_at;
const chosen = RADAR.find(item => item.id === editorial.item_id);
const validEditorial = chosen && editorial.source_url === chosen.url && typeof editorial.titulo_pt === 'string' && editorial.titulo_pt.length > 0 && editorial.titulo_pt.length <= 140 && typeof editorial.resumo_pt === 'string' && editorial.resumo_pt.length <= 400 && typeof editorial.por_que_importa === 'string' && editorial.por_que_importa.length <= 240 && Date.parse(editorial.updated_at || '') <= Date.now() && Date.parse(editorial.updated_at || '') >= Date.now() - 72 * 3600000;
export const RADAR_FEATURED = (validEditorial ? chosen : RADAR.find(item => item.id === data.featured_id)) || RADAR[0];
export const FEATURED_TITLE = validEditorial ? editorial.titulo_pt : RADAR_FEATURED?.title;
export const FEATURED_SUMMARY = validEditorial ? editorial.resumo_pt : RADAR_FEATURED?.summary;
export const FEATURED_WHY = validEditorial ? editorial.por_que_importa : '';
export const radarDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
