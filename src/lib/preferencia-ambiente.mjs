export const PREFERENCE_KEY = 'harpya.ambiente.v1';
export const ambienteValido = value => value === 'tecnologia' || value === 'business';
export function lerPreferencia(storage) {
  try { const value = storage.getItem(PREFERENCE_KEY); return ambienteValido(value) ? value : null; } catch { return null; }
}
export function salvarPreferencia(storage, value) {
  if (!ambienteValido(value)) return false;
  try { storage.setItem(PREFERENCE_KEY, value); return true; } catch { return false; }
}
export function destinoInicial(path, search, preference) {
  if (path !== '/' || new URLSearchParams(search).get('ambientes') === '1' || !ambienteValido(preference)) return null;
  return preference === 'business' ? '/business/' : '/tecnologia/';
}
