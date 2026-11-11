import { normalizeHandle } from './handle';
import { DEFAULT_PAGE, isPageKey, type PageKey } from './pages';

/** Página escolhida para cada canal. A chave é o handle normalizado (ver `normalizeHandle`). */
export type Preferences = Record<string, PageKey>;

/** Página de um canal, com Vídeos para quem não tem preferência ou tem valor inválido. */
export function getChannelPage(prefs: Preferences, key: string): PageKey {
  const page = prefs[key];
  return isPageKey(page) ? page : DEFAULT_PAGE;
}

/**
 * Devolve uma cópia das preferências com a escolha aplicada. Escolher a página padrão
 * remove a entrada do canal, porque quem não está no mapa já usa o padrão.
 */
export function setChannelPage(prefs: Preferences, key: string, page: PageKey): Preferences {
  const next = { ...prefs };
  if (page === DEFAULT_PAGE) {
    delete next[key];
  } else {
    next[key] = page;
  }
  return next;
}

/** Limpa o que veio do storage: descarta chaves inválidas, páginas desconhecidas e o padrão. */
export function sanitizePreferences(raw: unknown): Preferences {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};

  const result: Preferences = {};
  for (const [rawKey, value] of Object.entries(raw)) {
    const key = normalizeHandle(rawKey);
    if (key !== null && isPageKey(value) && value !== DEFAULT_PAGE) {
      result[key] = value;
    }
  }
  return result;
}
