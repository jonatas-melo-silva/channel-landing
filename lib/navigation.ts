import { parseChannelUrl } from './handle';
import type { Preferences } from './preferences';
import { resolveTarget } from './redirect';

export interface NavigationDecision {
  /** Para onde levar a aba, ou null para deixar como está. */
  redirectTo: string | null;
  /** Canal da URL atual (chave normalizada), para lembrar como canal anterior da aba. */
  channel: string | null;
}

/**
 * Decide o que fazer quando uma aba navega para `url`. `previousChannel` é o canal em que a
 * aba estava antes, ou null se estava fora de um canal (ou se é uma carga completa de página).
 */
export function decideNavigation(
  url: string,
  prefs: Preferences,
  previousChannel: string | null,
): NavigationDecision {
  return {
    redirectTo: resolveTarget(url, prefs, previousChannel),
    channel: parseChannelUrl(url)?.key ?? null,
  };
}
