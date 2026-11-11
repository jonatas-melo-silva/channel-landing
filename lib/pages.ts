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

export type PageKey = (typeof PAGE_KEYS)[number];

export interface PageDefinition {
  key: PageKey;
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
  return typeof value === 'string' && (PAGE_KEYS as readonly string[]).includes(value);
}

export function getPage(key: PageKey): PageDefinition {
  const page = PAGES.find((candidate) => candidate.key === key);
  if (!page) throw new Error(`Página desconhecida: ${key}`);
  return page;
}

/** Acha a página pelo segmento da URL (`videos`, `featured`, ou vazio para o Início). */
export function findPageBySegment(segment: string): PageDefinition | undefined {
  const normalized = segment.toLowerCase();
  return PAGES.find(
    (candidate) => candidate.path === normalized || candidate.aliases.includes(normalized),
  );
}
