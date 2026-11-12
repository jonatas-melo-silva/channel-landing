import { describe, expect, it } from 'vitest';
import { decideNavigation } from '@/lib/navigation';
import type { Preferences } from '@/lib/preferences';

const YT = 'https://www.youtube.com';

describe('decideNavigation', () => {
  it('redireciona a entrada do canal quando a aba vinha de fora de um canal', () => {
    expect(decideNavigation(`${YT}/@x`, {}, null)).toEqual({
      redirectTo: `${YT}/@x/videos`,
      channel: '@x',
    });
  });

  it('não redireciona quando a aba já estava no mesmo canal', () => {
    expect(decideNavigation(`${YT}/@x`, {}, '@x')).toEqual({ redirectTo: null, channel: '@x' });
  });

  it('redireciona quando a aba vinha de outro canal', () => {
    expect(decideNavigation(`${YT}/@x`, {}, '@y').redirectTo).toBe(`${YT}/@x/videos`);
  });

  it('usa a preferência do canal', () => {
    const prefs: Preferences = { '@x': 'streams' };
    expect(decideNavigation(`${YT}/@x`, prefs, null).redirectTo).toBe(`${YT}/@x/streams`);
  });

  it('guarda o canal normalizado', () => {
    expect(decideNavigation(`${YT}/@X/videos`, {}, null).channel).toBe('@x');
  });

  it.each([`${YT}/watch?v=abc`, `${YT}/`, 'https://example.com/@x'])(
    '%s não pertence a um canal',
    (url) => {
      expect(decideNavigation(url, {}, '@x')).toEqual({ redirectTo: null, channel: null });
    },
  );

  it('acompanha uma sequência de navegações de uma aba', () => {
    const steps = [
      `${YT}/watch?v=abc`,
      `${YT}/@x`,
      `${YT}/@x/videos`,
      `${YT}/@x`,
      `${YT}/@x/about`,
      `${YT}/@y`,
    ];
    let previous: string | null = null;
    const redirects: (string | null)[] = [];
    for (const url of steps) {
      const decision = decideNavigation(url, {}, previous);
      redirects.push(decision.redirectTo);
      previous = decision.channel;
    }
    expect(redirects).toEqual([null, `${YT}/@x/videos`, null, null, null, `${YT}/@y/videos`]);
  });
});
