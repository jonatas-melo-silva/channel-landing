import { describe, expect, it } from 'vitest';
import { PAGES, getPage, type PageKey } from '@/lib/pages';
import type { Preferences } from '@/lib/preferences';
import { resolveTarget } from '@/lib/redirect';

const YT = 'https://www.youtube.com';

describe('resolveTarget sem preferência (padrão Vídeos)', () => {
  it.each([
    [`${YT}/@x`, `${YT}/@x/videos`],
    [`${YT}/@x/`, `${YT}/@x/videos`],
    [`${YT}/@x/featured`, `${YT}/@x/videos`],
    [`${YT}/@x/featured/`, `${YT}/@x/videos`],
    [`${YT}/@x?si=abc`, `${YT}/@x/videos?si=abc`],
    [`${YT}/@x/?si=abc`, `${YT}/@x/videos?si=abc`],
    [`${YT}/@x/featured?si=abc`, `${YT}/@x/videos?si=abc`],
    [`${YT}/@x#topo`, `${YT}/@x/videos`],
  ])('%s vai para %s', (url, expected) => {
    expect(resolveTarget(url, {})).toBe(expected);
  });

  it('mantém o handle exatamente como veio na URL', () => {
    expect(resolveTarget(`${YT}/@KipperDev`, {})).toBe(`${YT}/@KipperDev/videos`);
    expect(resolveTarget(`${YT}/@caf%C3%A9`, {})).toBe(`${YT}/@caf%C3%A9/videos`);
  });

  it('aceita um objeto URL', () => {
    expect(resolveTarget(new URL(`${YT}/@x`), {})).toBe(`${YT}/@x/videos`);
  });
});

describe('resolveTarget com preferência', () => {
  const pages = PAGES.filter((page) => page.key !== 'home').map((page) => page.key);

  it.each(pages)('leva o canal para %s', (key) => {
    const prefs: Preferences = { '@x': key };
    expect(resolveTarget(`${YT}/@x`, prefs)).toBe(`${YT}/@x/${getPage(key).path}`);
  });

  it('ignora maiúsculas ao achar a preferência e mantém o handle da URL', () => {
    expect(resolveTarget(`${YT}/@X`, { '@x': 'streams' })).toBe(`${YT}/@X/streams`);
  });

  it('não deixa a preferência de um canal vazar para outro', () => {
    const prefs: Preferences = { '@x': 'streams' };
    expect(resolveTarget(`${YT}/@y`, prefs)).toBe(`${YT}/@y/videos`);
    expect(resolveTarget(`${YT}/@xy`, prefs)).toBe(`${YT}/@xy/videos`);
    expect(resolveTarget(`${YT}/@x`, prefs)).toBe(`${YT}/@x/streams`);
  });

  it('usa Vídeos quando o valor salvo é inválido', () => {
    const prefs = { '@x': 'nope' } as unknown as Preferences;
    expect(resolveTarget(`${YT}/@x`, prefs)).toBe(`${YT}/@x/videos`);
  });

  it.each([`${YT}/@x`, `${YT}/@x/`, `${YT}/@x/featured`, `${YT}/@x?si=abc`])(
    'preferência Início não redireciona %s',
    (url) => {
      expect(resolveTarget(url, { '@x': 'home' })).toBeNull();
    },
  );
});

describe('resolveTarget não mexe em outras páginas', () => {
  it.each([
    `${YT}/@x/videos`,
    `${YT}/@x/streams`,
    `${YT}/@x/playlists`,
    `${YT}/@x/posts`,
    `${YT}/@x/podcasts`,
    `${YT}/@x/about`,
    `${YT}/@x/community`,
    `${YT}/@x/shorts`,
    `${YT}/@x/search?query=a`,
    `${YT}/@x/featured/extra`,
    `${YT}/watch?v=abc`,
    `${YT}/shorts/abc`,
    `${YT}/`,
    `${YT}/channel/UCabc`,
    'https://example.com/@x',
    'não é uma url',
  ])('%s fica como está', (url) => {
    expect(resolveTarget(url, {})).toBeNull();
  });

  it('não entra em loop: a aba escolhida não é redirecionada de novo', () => {
    const key: PageKey = 'streams';
    const prefs: Preferences = { '@x': key };
    const target = resolveTarget(`${YT}/@x`, prefs);
    expect(target).toBe(`${YT}/@x/streams`);
    expect(resolveTarget(target ?? '', prefs)).toBeNull();
  });

  it('deixa o usuário abrir outra aba mesmo com preferência diferente', () => {
    expect(resolveTarget(`${YT}/@x/videos`, { '@x': 'streams' })).toBeNull();
    expect(resolveTarget(`${YT}/@x/streams`, { '@x': 'posts' })).toBeNull();
  });
});

describe('resolveTarget com o canal anterior da aba', () => {
  it('não redireciona quando o usuário clica em Início dentro do mesmo canal', () => {
    expect(resolveTarget(`${YT}/@x`, {}, '@x')).toBeNull();
  });

  it('compara o canal anterior ignorando maiúsculas e codificação', () => {
    expect(resolveTarget(`${YT}/@x`, {}, '@X')).toBeNull();
    expect(resolveTarget(`${YT}/@caf%C3%A9`, {}, '@CAF%C3%89')).toBeNull();
  });

  it('redireciona quando veio de outro canal', () => {
    expect(resolveTarget(`${YT}/@x`, {}, '@y')).toBe(`${YT}/@x/videos`);
  });

  it.each([undefined, null, ''])('redireciona quando o canal anterior é %j', (previous) => {
    expect(resolveTarget(`${YT}/@x`, {}, previous)).toBe(`${YT}/@x/videos`);
  });
});
