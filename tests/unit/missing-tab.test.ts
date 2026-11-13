import { describe, expect, it } from 'vitest';
import { missingTabTarget } from '@/lib/missing-tab';
import type { PageKey } from '@/lib/pages';

const tabs: PageKey[] = ['home', 'videos', 'streams', 'playlists', 'posts'];

describe('missingTabTarget', () => {
  it('manda para Vídeos quando a página escolhida não existe', () => {
    expect(missingTabTarget('podcasts', tabs, '@Kipper')).toBe('/@Kipper/videos');
    expect(missingTabTarget('store', tabs, '@x')).toBe('/@x/videos');
  });

  it('fica quando a página existe', () => {
    expect(missingTabTarget('streams', tabs, '@x')).toBeNull();
  });

  it.each<PageKey | null>(['home', 'videos', null])('nunca redireciona %s', (page) => {
    expect(missingTabTarget(page, ['home', 'videos'], '@x')).toBeNull();
  });

  it('não age com a lista de abas desconhecida ou incompleta', () => {
    expect(missingTabTarget('podcasts', null, '@x')).toBeNull();
    expect(missingTabTarget('podcasts', ['home'], '@x')).toBeNull();
    expect(missingTabTarget('podcasts', ['home', 'streams'], '@x')).toBeNull();
  });

  it('o destino é uma página que não se redireciona de novo', () => {
    const target = missingTabTarget('podcasts', tabs, '@x');
    expect(target).toBe('/@x/videos');
    expect(missingTabTarget('videos', tabs, '@x')).toBeNull();
  });
});
