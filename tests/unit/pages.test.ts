import { describe, expect, it } from 'vitest';
import { getPage, isPageKey, pageKeyFromSegment } from '@/lib/pages';

describe('pageKeyFromSegment', () => {
  it.each([
    ['', 'home'],
    ['featured', 'home'],
    ['Videos', 'videos'],
    ['shorts', 'shorts'],
    ['shows', 'shows'],
    ['Programas-2', 'programas-2'],
  ])('%j é a página %s', (segment, key) => {
    expect(pageKeyFromSegment(segment)).toBe(key);
  });

  it.each(['search', 'SEARCH', 'a b', '-x', 'x/y', 'x?y', 'a'.repeat(41), '%E0%A4%A'])(
    '%j não é uma página',
    (segment) => {
      expect(pageKeyFromSegment(segment)).toBeNull();
    },
  );
});

describe('isPageKey', () => {
  it('aceita só o formato de endereço de aba', () => {
    expect(isPageKey('videos')).toBe(true);
    expect(isPageKey('shorts')).toBe(true);
    expect(isPageKey('Not Valid')).toBe(false);
    expect(isPageKey('')).toBe(false);
    expect(isPageKey(3)).toBe(false);
    expect(isPageKey('a/b')).toBe(false);
  });
});

describe('getPage', () => {
  it('páginas conhecidas devolvem a definição', () => {
    expect(getPage('home').path).toBe('');
    expect(getPage('videos').path).toBe('videos');
  });

  it('abas desconhecidas usam a própria chave como caminho', () => {
    expect(getPage('shorts')).toEqual({ key: 'shorts', path: 'shorts' });
  });
});
