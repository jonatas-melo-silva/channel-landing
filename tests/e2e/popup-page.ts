import type { BrowserContext, Page, Worker } from '@playwright/test';

/** Só o que os testes usam do objeto `chrome` dentro do service worker. */
export interface ChromeStorageApi {
  tabs: { query(filter: { url: string }): Promise<{ id?: number }[]> };
  storage: { local: { get(key: string): Promise<Record<string, unknown>> } };
}

/**
 * Abre o popup numa aba comum (o Playwright não clica no ícone da extensão), apontado para
 * a aba do YouTube que está aberta. É o mesmo código e a mesma página que o popup de verdade.
 */
export async function openPopup(
  context: BrowserContext,
  serviceWorker: Worker,
  youtube: Page,
): Promise<Page> {
  const tabId = await serviceWorker.evaluate(async (url) => {
    const { tabs } = (globalThis as unknown as { chrome: ChromeStorageApi }).chrome;
    const [tab] = await tabs.query({ url });
    return tab?.id;
  }, youtube.url());
  const extensionId = new URL(serviceWorker.url()).host;

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html?tab=${tabId}`);
  return popup;
}
