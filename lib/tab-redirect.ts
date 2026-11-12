import { decideNavigation } from './navigation';
import { loadPreferences } from './storage';
import { getTabChannel, setTabChannel } from './tab-state';

/**
 * Leva a aba para `url` trocando a entrada atual do histórico (`location.replace`), para o
 * botão Voltar não cair de novo na página de entrada do canal e ser redirecionado outra vez.
 * Se não der para injetar o script, navega pela API de abas.
 */
export async function redirectTab(tabId: number, url: string): Promise<void> {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: (target: string) => {
        location.replace(target);
      },
      args: [url],
    });
  } catch {
    await browser.tabs.update(tabId, { url });
  }
}

/**
 * Trata uma navegação da aba. `source` diz de onde veio o evento: `history` é a navegação
 * interna do YouTube (troca a URL sem recarregar) e `load` é uma carga completa de página.
 * Só na navegação interna importa o canal anterior: clicar em Início dentro do canal não
 * deve ser desfeito. Numa carga completa a pessoa veio de fora, então o canal anterior
 * não conta.
 */
export async function handleNavigation(
  tabId: number,
  url: string,
  source: 'history' | 'load',
): Promise<void> {
  const [prefs, remembered] = await Promise.all([loadPreferences(), getTabChannel(tabId)]);
  const previousChannel = source === 'history' ? remembered : null;

  const { redirectTo, channel } = decideNavigation(url, prefs, previousChannel);
  await setTabChannel(tabId, channel);
  if (redirectTo !== null) await redirectTab(tabId, redirectTo);
}
