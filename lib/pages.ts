export const PAGE_KEYS = [
  'home',
  'videos',
  'streams',
  'playlists',
  'posts',
  'podcasts',
  'courses',
  'store',
] as const;

/** Páginas que a extensão conhece: têm rótulo e ícone próprios no popup. */
export type KnownPageKey = (typeof PAGE_KEYS)[number];

/**
 * Identificador de uma página do canal: o segmento da URL depois de `/@handle` (`videos`,
 * `shorts`, `shows`...) ou `home` para o Início. Além das páginas conhecidas, vale qualquer
 * aba que o YouTube informe para o canal.
 */
export type PageKey = string;

// Só letras minúsculas, números e hífen: é o que o YouTube usa nos endereços das abas, e
// garante que o valor guardado nunca tenha nada que mude o sentido de uma regra ou de uma URL.
const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** Abas que o YouTube informa mas que não são uma página para abrir (a busca do canal). */
const NOT_A_PAGE = new Set(['search']);

export interface PageDefinition {
  key: KnownPageKey;
  /** Segmento da URL depois de `/@handle`. Vazio para o Início. */
  path: string;
  /** Outros segmentos que levam à mesma página. */
  aliases: readonly string[];
  /** Páginas opcionais só existem em alguns canais. */
  optional: boolean;
}

/** Na ordem em que aparecem no popup. */
export const PAGES: readonly PageDefinition[] = [
  { key: 'home', path: '', aliases: ['featured'], optional: false },
  { key: 'videos', path: 'videos', aliases: [], optional: false },
  { key: 'streams', path: 'streams', aliases: [], optional: false },
  { key: 'playlists', path: 'playlists', aliases: [], optional: false },
  { key: 'posts', path: 'posts', aliases: [], optional: false },
  { key: 'podcasts', path: 'podcasts', aliases: [], optional: true },
  { key: 'courses', path: 'courses', aliases: [], optional: true },
  { key: 'store', path: 'store', aliases: [], optional: true },
];

/** Página usada em todo canal que não tem preferência salva. */
export const DEFAULT_PAGE: PageKey = 'videos';

export function isPageKey(value: unknown): value is PageKey {
  return typeof value === 'string' && SLUG.test(value);
}

/** Dados de uma página. Uma aba que a extensão não conhece usa o próprio nome como caminho. */
export function getPage(key: PageKey): PageDefinition | { key: PageKey; path: string } {
  const known = PAGES.find((candidate) => candidate.key === key);
  return known ?? { key, path: key };
}

/**
 * Página que um segmento de URL representa: uma conhecida, ou o próprio segmento quando é
 * uma aba qualquer. Devolve null para o que não é uma página (a busca do canal, textos fora
 * do formato de um endereço de aba).
 */
export function pageKeyFromSegment(segment: string): PageKey | null {
  const normalized = segment.toLowerCase();
  const known = findPageBySegment(normalized);
  if (known) return known.key;
  return SLUG.test(normalized) && !NOT_A_PAGE.has(normalized) ? normalized : null;
}

/** Acha a página pelo segmento da URL (`videos`, `featured`, ou vazio para o Início). */
export function findPageBySegment(segment: string): PageDefinition | undefined {
  const normalized = segment.toLowerCase();
  return PAGES.find(
    (candidate) => candidate.path === normalized || candidate.aliases.includes(normalized),
  );
}
