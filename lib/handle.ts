import { findPageBySegment, type PageKey } from './pages';

const YOUTUBE_HOST = 'www.youtube.com';

export interface ChannelLocation {
  /** Handle normalizado (minúsculas, decodificado, com `@`). É a chave das preferências. */
  key: string;
  /** Handle exatamente como veio na URL, para montar o destino sem alterar nada. */
  rawHandle: string;
  /** Página do canal que a URL representa, ou null (about, community, shorts...). */
  page: PageKey | null;
  /** True para `/@handle`, `/@handle/` e `/@handle/featured`. */
  isLanding: boolean;
}

/**
 * Devolve a chave de um handle: decodificado, em minúsculas e com o `@` na frente.
 * O YouTube trata `@KipperDev` e `@kipperdev` como o mesmo canal. Devolve null se não
 * parecer um handle. Aplicar a função duas vezes dá o mesmo resultado.
 */
export function normalizeHandle(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const key = decoded.normalize('NFC').toLowerCase();
  return /^@[^\s/?#]+$/.test(key) ? key : null;
}

/**
 * Lê uma URL do YouTube e diz de qual canal e página ela é. Só reconhece
 * `https://www.youtube.com/@handle/...`. Qualquer outra coisa devolve null.
 */
export function parseChannelUrl(input: string | URL): ChannelLocation | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.hostname !== YOUTUBE_HOST) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  const rawHandle = segments[0];
  if (rawHandle === undefined || !rawHandle.startsWith('@')) return null;

  const key = normalizeHandle(rawHandle);
  if (key === null) return null;

  // Mais de dois segmentos (`/@x/videos/algo`) não é uma página de aba.
  const page = segments.length <= 2 ? (findPageBySegment(segments[1] ?? '')?.key ?? null) : null;

  return { key, rawHandle, page, isLanding: page === 'home' };
}
