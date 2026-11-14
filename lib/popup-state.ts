import type { ChannelInfo } from './channel';
import type { GetChannelResponse } from './messages';
import { DEFAULT_PAGE, PAGES, type PageDefinition, type PageKey } from './pages';

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

/**
 * Páginas que aparecem na lista. As padrão aparecem sempre; as opcionais (Podcasts, Cursos,
 * Loja) só quando o canal as tem. Sem a lista de abas, só as padrão.
 */
export function visiblePages(tabs: readonly PageKey[] | null): PageDefinition[] {
  return PAGES.filter((page) => !page.optional || (tabs?.includes(page.key) ?? false));
}

/**
 * Página que aparece ligada. É a preferência do canal, a não ser que ela não esteja na lista
 * (o canal não tem a página): nesse caso a extensão abre Vídeos, e é Vídeos que aparece ligado.
 */
export function activePage(preference: PageKey, tabs: readonly PageKey[] | null): PageKey {
  return visiblePages(tabs).some((page) => page.key === preference) ? preference : DEFAULT_PAGE;
}
