import { tabPageKey, type ChannelInfo } from './channel';
import type { GetChannelResponse } from './messages';
import { DEFAULT_PAGE, PAGES, type PageKey } from './pages';

/** O que o popup mostra. `loading` é o estado antes de a aba responder. */
export type ViewState =
  | { status: 'loading' }
  | { status: 'not-channel' }
  | { status: 'error' }
  | { status: 'ready'; channel: ChannelInfo };

export function toViewState(response: GetChannelResponse): ViewState {
  if (response.ok) return { status: 'ready', channel: response.channel };
  return response.reason === 'not-channel' ? { status: 'not-channel' } : { status: 'error' };
}

/** Uma linha da lista do popup. */
export interface PopupPage {
  key: PageKey;
  /** Nome que o YouTube dá à aba. Só é mostrado para as páginas que a extensão não conhece. */
  title: string | null;
}

/**
 * Páginas que aparecem na lista, na ordem do YouTube: todas as abas que ele informa para o
 * canal, menos a busca. Sem a lista de abas, só as páginas padrão.
 */
export function popupPages(channel: Pick<ChannelInfo, 'rawTabs'>): PopupPage[] {
  const pages: PopupPage[] = [];
  const seen = new Set<PageKey>();
  for (const tab of channel.rawTabs ?? []) {
    const key = tabPageKey(tab.url);
    if (key === null || seen.has(key)) continue;
    seen.add(key);
    pages.push({ key, title: tab.title });
  }
  if (pages.length > 0) return pages;

  return PAGES.filter((page) => !page.optional).map((page) => ({ key: page.key, title: null }));
}

/**
 * Página que aparece ligada. É a preferência do canal, a não ser que ela não esteja na lista
 * (o canal não tem a página): nesse caso a extensão abre Vídeos, e é Vídeos que aparece ligado.
 */
export function activePage(preference: PageKey, pages: readonly PopupPage[]): PageKey {
  if (pages.some((page) => page.key === preference)) return preference;
  return pages.some((page) => page.key === DEFAULT_PAGE)
    ? DEFAULT_PAGE
    : (pages[0]?.key ?? DEFAULT_PAGE);
}
