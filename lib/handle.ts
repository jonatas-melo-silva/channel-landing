import { pageKeyFromSegment, type PageKey } from './pages';

const YOUTUBE_HOST = 'www.youtube.com';

export interface ChannelLocation {
  /** Handle normalizado (minúsculas, decodificado, com `@`). É a chave das preferências. */
  key: string;
  /** Handle exatamente como veio na URL, para montar o destino sem alterar nada. */
  rawHandle: string;
  /** Página do canal que a URL representa (`videos`, `shorts`...), ou null se não for uma. */
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
  const page = segments.length <= 2 ? pageKeyFromSegment(segments[1] ?? '') : null;

  return { key, rawHandle, page, isLanding: page === 'home' };
}

// Primeiros segmentos do YouTube que não são nome de canal. A lista só precisa cobrir o que é
// comum: um nome que escape dela apenas faz a aba lembrar um canal que não existe.
const NOT_A_CHANNEL_NAME = new Set([
  'watch',
  'shorts',
  'feed',
  'results',
  'playlist',
  'live',
  'hashtag',
  'embed',
  'clip',
  'post',
  'premium',
  'gaming',
  'account',
  'channel',
  'c',
  'user',
  'kids',
  'music',
  'tv',
  'podcasts',
  'trending',
  'upload',
  'studio',
  'reporthistory',
  'howyoutubeworks',
  'yt',
  's',
  'redirect',
]);

/**
 * Chave do canal para endereços antigos, sem `@`: `/nome`, `/nome/videos`, `/c/nome` e
 * `/user/nome`. O YouTube leva alguns canais de `/@nome/videos` para `/nome/videos`, e sem isso
 * a extensão não saberia que clicar em Início dentro dele continua no mesmo canal.
 * Só serve para lembrar em que canal a aba estava, nunca para redirecionar: `/nome` não se
 * distingue de outras páginas do YouTube pelo endereço.
 */
export function legacyChannelKey(input: string | URL): string | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.hostname !== YOUTUBE_HOST) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first === undefined || first.startsWith('@')) return null;

  const name = first === 'c' || first === 'user' ? segments[1] : segments[0];
  if (name === undefined || (first !== 'c' && first !== 'user' && NOT_A_CHANNEL_NAME.has(first))) {
    return null;
  }
  return normalizeHandle(`@${name}`);
}
