import { describe, expect, it } from 'vitest';
import { normalizeHandle, parseChannelUrl } from '@/lib/handle';

const YT = 'https://www.youtube.com';

describe('normalizeHandle', () => {
  it.each([
    ['@KipperDev', '@kipperdev'],
    ['@kipperdev', '@kipperdev'],
    ['@caf%C3%A9', '@café'],
    ['@CAF%C3%89', '@café'],
    ['@a.b_c-d', '@a.b_c-d'],
  ])('%s vira %s', (raw, expected) => {
    expect(normalizeHandle(raw)).toBe(expected);
  });

  it('é idempotente', () => {
    const once = normalizeHandle('@KipperDev%C3%89');
    expect(once).toBe('@kipperdevé');
    expect(normalizeHandle(once ?? '')).toBe(once);
  });

  it.each(['kipperdev', '@', '', '@a b', '@a/b', '@a?b', '@a#b'])('recusa %j', (raw) => {
    expect(normalizeHandle(raw)).toBeNull();
  });

  it('não quebra com codificação malformada', () => {
    expect(() => normalizeHandle('@%E0%A4%A')).not.toThrow();
  });
});

describe('parseChannelUrl', () => {
  it.each([
    [`${YT}/@kipperdev`, 'home', true],
    [`${YT}/@kipperdev/`, 'home', true],
    [`${YT}/@kipperdev/featured`, 'home', true],
    [`${YT}/@kipperdev/featured/`, 'home', true],
    [`${YT}/@kipperdev?si=abc`, 'home', true],
    [`${YT}/@kipperdev/videos`, 'videos', false],
    [`${YT}/@kipperdev/streams`, 'streams', false],
    [`${YT}/@kipperdev/playlists`, 'playlists', false],
    [`${YT}/@kipperdev/posts`, 'posts', false],
    [`${YT}/@kipperdev/podcasts`, 'podcasts', false],
    [`${YT}/@kipperdev/courses`, 'courses', false],
    [`${YT}/@kipperdev/store`, 'store', false],
    [`${YT}/@kipperdev/Videos`, 'videos', false],
  ])('%s é a página %s (entrada: %s)', (url, page, isLanding) => {
    const location = parseChannelUrl(url);
    expect(location?.key).toBe('@kipperdev');
    expect(location?.page).toBe(page);
    expect(location?.isLanding).toBe(isLanding);
  });

  it.each([
    `${YT}/@kipperdev/about`,
    `${YT}/@kipperdev/community`,
    `${YT}/@kipperdev/shorts`,
    `${YT}/@kipperdev/search?query=a`,
    `${YT}/@kipperdev/videos/extra`,
    `${YT}/@kipperdev/featured/extra`,
  ])('%s não é uma aba conhecida nem entrada do canal', (url) => {
    const location = parseChannelUrl(url);
    expect(location?.key).toBe('@kipperdev');
    expect(location?.page).toBeNull();
    expect(location?.isLanding).toBe(false);
  });

  it('guarda o handle como veio na URL e a chave normalizada', () => {
    expect(parseChannelUrl(`${YT}/@KipperDev/Streams`)).toEqual({
      key: '@kipperdev',
      rawHandle: '@KipperDev',
      page: 'streams',
      isLanding: false,
    });
  });

  it('decodifica handles com caracteres especiais', () => {
    expect(parseChannelUrl(`${YT}/@café`)).toEqual({
      key: '@café',
      rawHandle: '@caf%C3%A9',
      page: 'home',
      isLanding: true,
    });
  });

  it('aceita um objeto URL', () => {
    expect(parseChannelUrl(new URL(`${YT}/@kipperdev/videos`))?.page).toBe('videos');
  });

  it.each([
    `${YT}/watch?v=abc`,
    `${YT}/shorts/abc`,
    `${YT}/`,
    YT,
    `${YT}/channel/UCabc`,
    `${YT}/c/nome`,
    `${YT}/user/nome`,
    'https://m.youtube.com/@kipperdev',
    'https://youtube.com/@kipperdev',
    'http://www.youtube.com/@kipperdev',
    'https://example.com/@kipperdev',
    'não é uma url',
    '',
  ])('devolve null para %j', (url) => {
    expect(parseChannelUrl(url)).toBeNull();
  });
});
