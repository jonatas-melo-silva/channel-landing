const STORAGE_KEY = 'tabChannels';

/** Canal (chave normalizada) em que cada aba estava na última navegação, por id da aba. */
type TabChannels = Record<string, string>;

// O service worker é encerrado quando fica ocioso, então o estado vai para storage.session,
// que dura até o navegador fechar e nunca é gravado em disco.
async function read(): Promise<TabChannels> {
  const stored = await browser.storage.session.get(STORAGE_KEY);
  const raw: unknown = stored[STORAGE_KEY];
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};

  const result: TabChannels = {};
  for (const [tabId, channel] of Object.entries(raw)) {
    if (typeof channel === 'string') result[tabId] = channel;
  }
  return result;
}

export async function getTabChannel(tabId: number): Promise<string | null> {
  return (await read())[String(tabId)] ?? null;
}

/** Lembra o canal da aba. Com `null`, esquece a aba (ela saiu de qualquer canal). */
export async function setTabChannel(tabId: number, channel: string | null): Promise<void> {
  const channels = await read();
  if (channel === null) {
    delete channels[String(tabId)];
  } else {
    channels[String(tabId)] = channel;
  }
  await browser.storage.session.set({ [STORAGE_KEY]: channels });
}

export function clearTabChannel(tabId: number): Promise<void> {
  return setTabChannel(tabId, null);
}
