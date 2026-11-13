import { findPageBySegment, type PageKey } from './pages';

/** Dados do canal que o popup mostra. */
export interface ChannelInfo {
  /** Handle normalizado, a mesma chave usada nas preferências. */
  key: string;
  name: string | null;
  avatar: string | null;
  /** Texto exatamente como o YouTube mostra (por exemplo "1,2 mi de inscritos"). */
  subscribers: string | null;
  videos: string | null;
  /** Abas que o canal tem, ou null quando não foi possível ler. */
  tabs: PageKey[] | null;
}

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Percorre `data` pelos nomes de `path`. Devolve undefined se algum passo não existir. */
function dig(data: unknown, ...path: (string | number)[]): unknown {
  let current = data;
  for (const step of path) {
    if (typeof step === 'number') {
      if (!Array.isArray(current)) return undefined;
      current = current[step];
    } else {
      if (!isObject(current)) return undefined;
      current = current[step];
    }
  }
  return current;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/**
 * Extrai o objeto JSON que o YouTube coloca no HTML como `var ytInitialData = {...};`.
 * Conta as chaves em vez de usar uma regex, porque o objeto é grande e tem textos com `}`.
 */
export function parseInitialData(source: string): unknown {
  const marker = source.indexOf('ytInitialData');
  if (marker === -1) return null;

  const start = source.indexOf('{', marker);
  if (start === -1) return null;
  // Entre o nome e a chave só pode haver `"]`, espaços e `=`.
  if (!/^["'\]\s=]*$/.test(source.slice(marker + 'ytInitialData'.length, start))) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) {
      try {
        return JSON.parse(source.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Handle do canal a que os dados pertencem, em minúsculas, ou null se não houver. */
export function dataHandle(data: unknown): string | null {
  const renderer = dig(data, 'metadata', 'channelMetadataRenderer');
  const candidates = [
    dig(renderer, 'vanityChannelUrl'),
    ...(Array.isArray(dig(renderer, 'ownerUrls')) ? (dig(renderer, 'ownerUrls') as unknown[]) : []),
  ];
  for (const candidate of candidates) {
    const url = asString(candidate);
    const match = url === null ? null : /\/(@[^/?#]+)/.exec(url);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]).normalize('NFC').toLowerCase();
      } catch {
        return match[1].toLowerCase();
      }
    }
  }
  return null;
}

function metadataTexts(data: unknown): string[] {
  const rows = dig(
    data,
    'header',
    'pageHeaderRenderer',
    'content',
    'pageHeaderViewModel',
    'metadata',
    'contentMetadataViewModel',
    'metadataRows',
  );
  if (!Array.isArray(rows)) return [];

  const texts: string[] = [];
  for (const row of rows) {
    const parts = dig(row, 'metadataParts');
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      const text = asString(dig(part, 'text', 'content'));
      if (text !== null) texts.push(text);
    }
  }
  return texts;
}

function legacyText(data: unknown, field: string): string | null {
  const header = dig(data, 'header', 'c4TabbedHeaderRenderer', field);
  return asString(dig(header, 'simpleText')) ?? asString(dig(header, 'runs', 0, 'text'));
}

const SUBSCRIBERS = /inscrit|subscri|suscri|abonn|iscritt|abonent/i;
const VIDEOS = /v[ií]de[oe]|vid[eé]os?/i;

/** Lê as abas pelas URLs de cada `tabRenderer`. Devolve null se não achar nenhuma. */
export function extractTabs(data: unknown): PageKey[] | null {
  const tabs = dig(data, 'contents', 'twoColumnBrowseResultsRenderer', 'tabs');
  if (!Array.isArray(tabs)) return null;

  const found = new Set<PageKey>();
  for (const tab of tabs) {
    const renderer = dig(tab, 'tabRenderer') ?? dig(tab, 'expandableTabRenderer');
    const url = asString(dig(renderer, 'endpoint', 'commandMetadata', 'webCommandMetadata', 'url'));
    if (url === null) continue;

    const segments = url.split(/[?#]/)[0]?.split('/').filter(Boolean) ?? [];
    if (!segments[0]?.startsWith('@')) continue;
    const page = findPageBySegment(segments[1] ?? '');
    if (page && segments.length <= 2) found.add(page.key);
  }
  return found.size > 0 ? [...found] : null;
}

export function extractChannel(data: unknown, key: string): ChannelInfo {
  const renderer = dig(data, 'metadata', 'channelMetadataRenderer');
  const thumbnails = dig(renderer, 'avatar', 'thumbnails');
  const lastThumbnail = Array.isArray(thumbnails) ? thumbnails[thumbnails.length - 1] : undefined;

  const texts = metadataTexts(data);
  return {
    key,
    name: asString(dig(renderer, 'title')),
    avatar: asString(dig(lastThumbnail, 'url')),
    subscribers:
      texts.find((text) => SUBSCRIBERS.test(text)) ?? legacyText(data, 'subscriberCountText'),
    videos: texts.find((text) => VIDEOS.test(text)) ?? legacyText(data, 'videosCountText'),
    tabs: extractTabs(data),
  };
}
