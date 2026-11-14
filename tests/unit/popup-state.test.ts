import { describe, expect, it } from 'vitest';
import type { ChannelInfo } from '@/lib/channel';
import { PAGE_KEYS, type PageKey } from '@/lib/pages';
import { activePage, toViewState, visiblePages } from '@/lib/popup-state';

const channel: ChannelInfo = {
  key: '@x',
  name: 'X',
  avatar: null,
  subscribers: null,
  videos: null,
  tabs: null,
};

const keys = (tabs: PageKey[] | null) => visiblePages(tabs).map((page) => page.key);

describe('toViewState', () => {
  it('canal lido vira ready', () => {
    expect(toViewState({ ok: true, channel })).toEqual({ status: 'ready', channel });
  });

  it('fora de canal vira not-channel e falha de leitura vira error', () => {
    expect(toViewState({ ok: false, reason: 'not-channel' })).toEqual({ status: 'not-channel' });
    expect(toViewState({ ok: false, reason: 'unavailable' })).toEqual({ status: 'error' });
  });
});

describe('visiblePages', () => {
  it('sem lista de abas mostra só as padrão, na ordem do popup', () => {
    expect(keys(null)).toEqual(['home', 'videos', 'streams', 'playlists', 'posts']);
  });

  it('as padrão aparecem mesmo que o canal não tenha a aba', () => {
    expect(keys(['home', 'videos'])).toEqual(['home', 'videos', 'streams', 'playlists', 'posts']);
  });

  it('as opcionais só aparecem quando o canal tem', () => {
    expect(keys(['home', 'videos', 'podcasts', 'store'])).toEqual([
      'home',
      'videos',
      'streams',
      'playlists',
      'posts',
      'podcasts',
      'store',
    ]);
  });

  it('com todas as abas mostra as oito', () => {
    expect(keys([...PAGE_KEYS])).toEqual([...PAGE_KEYS]);
  });
});

describe('activePage', () => {
  it('mantém a preferência quando a página está na lista', () => {
    expect(activePage('streams', null)).toBe('streams');
    expect(activePage('podcasts', ['home', 'videos', 'podcasts'])).toBe('podcasts');
  });

  it('cai em Vídeos quando a preferência é de uma página que o canal não tem', () => {
    expect(activePage('podcasts', ['home', 'videos'])).toBe('videos');
    expect(activePage('store', null)).toBe('videos');
  });

  it('sempre devolve uma página que está visível', () => {
    for (const tabs of [null, ['home', 'videos'], [...PAGE_KEYS]] as (PageKey[] | null)[]) {
      for (const preference of PAGE_KEYS) {
        expect(keys(tabs)).toContain(activePage(preference, tabs));
      }
    }
  });
});
