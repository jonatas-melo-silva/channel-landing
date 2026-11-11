import { normalizeHandle } from './handle';
import type { PageKey } from './pages';
import { sanitizePreferences, setChannelPage, type Preferences } from './preferences';

const STORAGE_KEY = 'preferences';

/** Lê as preferências de `storage.local`. Dado inválido ou ausente vira `{}`. */
export async function loadPreferences(): Promise<Preferences> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizePreferences(stored[STORAGE_KEY]);
}

/** Guarda a página escolhida para um canal e devolve as preferências já atualizadas. */
export async function savePreference(handle: string, page: PageKey): Promise<Preferences> {
  const key = normalizeHandle(handle);
  if (key === null) throw new Error(`Handle inválido: ${handle}`);

  const next = setChannelPage(await loadPreferences(), key, page);
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

/** Chama `callback` sempre que as preferências mudarem. Devolve a função que cancela. */
export function watchPreferences(callback: (prefs: Preferences) => void): () => void {
  const listener = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area === 'local' && STORAGE_KEY in changes) {
      callback(sanitizePreferences(changes[STORAGE_KEY]?.newValue));
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
