import { describe, expect, it } from 'vitest';
import type { Preferences } from '@/lib/preferences';
import { resolveTarget } from '@/lib/redirect';
import { BASE_RULE_ID, buildRules } from '@/lib/rules';
import { applyRules } from '@/tests/helpers/dnr';

const YT = 'https://www.youtube.com';

describe('buildRules', () => {
  it('sem preferências gera só a regra base, que leva para Vídeos', () => {
    const rules = buildRules({});
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      id: BASE_RULE_ID,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { regexSubstitution: 'https://www.youtube.com/\\1/videos\\2' },
      },
      condition: { resourceTypes: ['main_frame'], isUrlFilterCaseSensitive: false },
    });
  });

  it('canal em Vídeos não ganha regra própria', () => {
    expect(buildRules({ '@x': 'videos' })).toHaveLength(1);
  });

  it('canal com outra aba ganha uma regra de prioridade maior que a base', () => {
    const rules = buildRules({ '@kipperdev': 'streams' });
    expect(rules).toHaveLength(2);
    const [base, channel] = rules;
    expect(channel?.priority).toBeGreaterThan(base?.priority ?? Infinity);
    expect(channel?.action).toEqual({
      type: 'redirect',
      redirect: { regexSubstitution: 'https://www.youtube.com/\\1/streams\\2' },
    });
    expect(channel?.condition.regexFilter).toContain('@kipperdev');
  });

  it('canal com Início ganha uma regra que só permite', () => {
    const rules = buildRules({ '@x': 'home' });
    expect(rules).toHaveLength(2);
    expect(rules[1]?.action).toEqual({ type: 'allow' });
  });

  it('gera ids únicos a partir de 1', () => {
    const rules = buildRules({ '@a': 'streams', '@b': 'home', '@c': 'posts', '@d': 'store' });
    const ids = rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Math.min(...ids)).toBe(1);
  });

  it('gera o mesmo resultado qualquer que seja a ordem das preferências', () => {
    const one: Preferences = { '@a': 'streams', '@b': 'home', '@c': 'posts' };
    const other: Preferences = { '@c': 'posts', '@a': 'streams', '@b': 'home' };
    expect(buildRules(one)).toEqual(buildRules(other));
  });

  it('ignora chaves que não estão normalizadas', () => {
    expect(buildRules({ '@KipperDev': 'streams' })).toHaveLength(1);
    expect(buildRules({ kipperdev: 'streams' })).toHaveLength(1);
  });

  it('ignora valores inválidos', () => {
    expect(buildRules({ '@x': 'nope' } as unknown as Preferences)).toHaveLength(1);
  });

  it('trata o ponto do handle como ponto, não como curinga', () => {
    const rules = buildRules({ '@a.b': 'courses' });
    expect(applyRules(rules, `${YT}/@a.b`)).toBe(`${YT}/@a.b/courses`);
    expect(applyRules(rules, `${YT}/@axb`)).toBe(`${YT}/@axb/videos`);
  });
});

describe('regras e resolveTarget concordam', () => {
  const prefs: Preferences = {
    '@x': 'streams',
    '@y': 'home',
    '@café': 'posts',
    '@a.b': 'courses',
    '@ab': 'store',
  };
  const rules = buildRules(prefs);

  const urls = [
    `${YT}/@x`,
    `${YT}/@x/`,
    `${YT}/@x/featured`,
    `${YT}/@x/featured/`,
    `${YT}/@X`,
    `${YT}/@x?si=abc`,
    `${YT}/@x/?si=abc`,
    `${YT}/@x/featured?si=abc&view=0`,
    `${YT}/@x#topo`,
    `${YT}/@x/videos`,
    `${YT}/@x/streams`,
    `${YT}/@x/about`,
    `${YT}/@x/featured/extra`,
    `${YT}/@xy`,
    `${YT}/@y`,
    `${YT}/@Y/featured`,
    `${YT}/@y/videos`,
    `${YT}/@z`,
    `${YT}/@z/featured?si=abc`,
    `${YT}/@z/videos`,
    `${YT}/@caf%C3%A9`,
    `${YT}/@caf%c3%a9`,
    `${YT}/@CAF%C3%89/featured`,
    `${YT}/@a.b`,
    `${YT}/@axb`,
    `${YT}/@ab`,
    `${YT}/@abc`,
    `${YT}/watch?v=abc`,
    `${YT}/shorts/abc`,
    `${YT}/`,
    `${YT}/channel/UCabc`,
    'https://m.youtube.com/@x',
    'https://example.com/@x',
  ];

  it.each(urls)('%s', (url) => {
    expect(applyRules(rules, url)).toBe(resolveTarget(url, prefs));
  });

  it('confere resultados conhecidos, para as duas camadas não errarem juntas', () => {
    expect(applyRules(rules, `${YT}/@x`)).toBe(`${YT}/@x/streams`);
    expect(applyRules(rules, `${YT}/@x?si=abc`)).toBe(`${YT}/@x/streams?si=abc`);
    expect(applyRules(rules, `${YT}/@y`)).toBeNull();
    expect(applyRules(rules, `${YT}/@z`)).toBe(`${YT}/@z/videos`);
    expect(applyRules(rules, `${YT}/@caf%c3%a9`)).toBe(`${YT}/@caf%c3%a9/posts`);
    expect(applyRules(rules, `${YT}/@CAF%C3%89`)).toBe(`${YT}/@CAF%C3%89/posts`);
    expect(applyRules(rules, `${YT}/@ab`)).toBe(`${YT}/@ab/store`);
    expect(applyRules(rules, `${YT}/@abc`)).toBe(`${YT}/@abc/videos`);
    expect(applyRules(rules, `${YT}/@x/videos`)).toBeNull();
  });
});
