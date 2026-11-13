import { GET_CHANNEL, type GetChannelResponse } from './messages';

/** Pergunta ao content script da aba ativa qual é o canal aberto. */
export async function getActiveChannel(): Promise<GetChannelResponse> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
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
