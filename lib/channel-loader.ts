import { dataHandle, extractChannel, parseInitialData, type ChannelInfo } from './channel';
import { parseChannelUrl, type ChannelLocation } from './handle';
import type { GetChannelResponse } from './messages';
import { missingTabTarget } from './missing-tab';
import { getChannelPage } from './preferences';
import { loadPreferences } from './storage';

const cache = new Map<string, ChannelInfo>();

/** Esquece os canais já lidos. Existe para os testes começarem sem estado. */
export function clearChannelCache(): void {
  cache.clear();
}

/** Procura os dados nos scripts da própria página. Só vale numa carga completa. */
function readFromPage(key: string): unknown {
  for (const script of Array.from(document.scripts)) {
    const text = script.textContent;
    if (!text?.includes('ytInitialData')) continue;
    const data = parseInitialData(text);
    if (data !== null && dataHandle(data) === key) return data;
  }
  return null;
}

/**
 * Na navegação interna os scripts da página são do canal anterior, então baixa a página do
 * canal. É uma requisição do próprio site, com a sessão da pessoa, como qualquer navegação.
 */
async function readFromNetwork(location: ChannelLocation): Promise<unknown> {
  const response = await fetch(`/${location.rawHandle}`, { credentials: 'same-origin' });
  if (!response.ok) return null;
  const data = parseInitialData(await response.text());
  return data !== null && dataHandle(data) === location.key ? data : null;
}

export async function loadChannel(location: ChannelLocation): Promise<ChannelInfo | null> {
  const cached = cache.get(location.key);
  if (cached) return cached;

  let data = readFromPage(location.key);
  if (data === null) {
    try {
      data = await readFromNetwork(location);
    } catch {
      data = null;
    }
  }
  if (data === null) return null;

  const channel = extractChannel(data, location.key);
  cache.set(location.key, channel);
  return channel;
}

export async function loadCurrentChannel(
  href: string = window.location.href,
): Promise<GetChannelResponse> {
  const location = parseChannelUrl(href);
  if (location === null) return { ok: false, reason: 'not-channel' };

  const channel = await loadChannel(location);
  return channel ? { ok: true, channel } : { ok: false, reason: 'unavailable' };
}

/**
 * Se a pessoa caiu numa página que ela escolheu mas o canal não tem, vai para Vídeos.
 * Só age na página escolhida para o canal: quem abre outra aba de propósito não é desviado.
 * O destino é Vídeos, que nunca é redirecionado, então não há como entrar em loop.
 */
export async function applyMissingTabFallback({
  href = window.location.href,
  navigate = (url: string) => window.location.replace(url),
}: { href?: string; navigate?: (url: string) => void } = {}): Promise<void> {
  const location = parseChannelUrl(href);
  if (location === null || location.page === null) return;

  const prefs = await loadPreferences();
  if (location.page !== getChannelPage(prefs, location.key)) return;

  const channel = await loadChannel(location);
  if (channel === null) return;

  const target = missingTabTarget(location.page, channel.tabs, location.rawHandle);
  if (target !== null) navigate(target);
}
