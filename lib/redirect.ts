import { normalizeHandle, parseChannelUrl } from './handle';
import { getPage } from './pages';
import { getChannelPage, type Preferences } from './preferences';

/**
 * Diz para onde uma URL deve ser redirecionada, ou null se não deve.
 *
 * Só as URLs de entrada do canal (`/@handle`, `/@handle/` e `/@handle/featured`) são
 * redirecionadas. Qualquer outra aba é deixada em paz, senão o usuário não conseguiria
 * navegar entre as abas do canal. A query string é mantida e o fragmento (`#...`) não.
 *
 * `previousHandle` é o canal em que a aba estava antes (chave normalizada). Se for o mesmo
 * canal, o usuário clicou em Início dentro do canal, então não redireciona.
 */
export function resolveTarget(
  url: string | URL,
  prefs: Preferences,
  previousHandle?: string | null,
): string | null {
  const location = parseChannelUrl(url);
  if (location === null || !location.isLanding) return null;

  if (previousHandle && normalizeHandle(previousHandle) === location.key) return null;

  const page = getChannelPage(prefs, location.key);
  if (page === 'home') return null;

  const target = new URL(url);
  target.pathname = `/${location.rawHandle}/${getPage(page).path}`;
  target.hash = '';
  return target.href;
}
