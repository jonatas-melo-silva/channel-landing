import { GET_CHANNEL, type GetChannelResponse } from './messages';

/**
 * Aba de que o popup fala. Normalmente é a aba ativa. Os testes e2e abrem o popup numa aba
 * comum (o Playwright não clica no ícone da extensão), então ali a aba vem em `?tab=ID`.
 */
async function targetTab() {
  const id = Number(new URLSearchParams(window.location.search).get('tab'));
  if (Number.isInteger(id) && id > 0) return browser.tabs.get(id);
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/** Pergunta ao content script da aba ativa qual é o canal aberto. */
export async function getActiveChannel(): Promise<GetChannelResponse> {
  const tab = await targetTab().catch(() => undefined);
  if (tab?.id === undefined || !tab.url?.startsWith('https://www.youtube.com/@')) {
    return { ok: false, reason: 'not-channel' };
  }

  try {
    const response: unknown = await browser.tabs.sendMessage(tab.id, { type: GET_CHANNEL });
    if (typeof response === 'object' && response !== null && 'ok' in response) {
      return response as GetChannelResponse;
    }
  } catch {
    // Aba aberta antes de a extensão ser instalada ou ainda sem o content script.
  }
  return { ok: false, reason: 'unavailable' };
}
