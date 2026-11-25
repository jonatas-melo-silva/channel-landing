import { describe, expect, it } from 'vitest';
import type { ChannelInfo, RawTab } from '@/lib/channel';
import { activePage, popupPages, toViewState } from '@/lib/popup-state';

const channel: ChannelInfo = {
  key: '@x',
  name: 'X',
  avatar: null,
  subscribers: null,
  videos: null,
  tabs: null,
};

const raw = (title: string, path: string): RawTab => ({
  title,
  url: `/@x${path}`,
  selected: false,
});

const keys = (rawTabs: RawTab[] | null) => popupPages({ rawTabs }).map((page) => page.key);

describe('toViewState', () => {
  it('canal lido vira ready', () => {
    expect(toViewState({ ok: true, channel })).toEqual({ status: 'ready', channel });
  });

  it('fora de canal vira not-channel e falha de leitura vira error', () => {
    expect(toViewState({ ok: false, reason: 'not-channel' })).toEqual({ status: 'not-channel' });
    expect(toViewState({ ok: false, reason: 'unavailable' })).toEqual({ status: 'error' });
  });
});

describe('popupPages', () => {
  it('sem lista de abas mostra só as páginas padrão, na ordem do popup', () => {
    expect(keys(null)).toEqual(['home', 'videos', 'streams', 'playlists', 'posts']);
    expect(keys([])).toEqual(['home', 'videos', 'streams', 'playlists', 'posts']);
  });

  it('mostra as abas do canal na ordem do YouTube, inclusive as que a extensão não conhece', () => {
    const pages = popupPages({
      rawTabs: [
        raw('Início', '/featured'),
        raw('Vídeos', '/videos'),
        raw('Shorts', '/shorts'),
        raw('Programas', '/shows'),
        raw('Playlists', '/playlists'),
      ],
    });
    expect(pages).toEqual([
      { key: 'home', title: 'Início' },
      { key: 'videos', title: 'Vídeos' },
      { key: 'shorts', title: 'Shorts' },
      { key: 'shows', title: 'Programas' },
      { key: 'playlists', title: 'Playlists' },
    ]);
  });

  it('não mostra a busca do canal nem repete abas', () => {
    expect(
      keys([
        raw('Início', '/featured'),
        raw('Vídeos', '/videos'),
        raw('Vídeos de novo', '/videos'),
        raw('Pesquisar', '/search'),
      ]),
    ).toEqual(['home', 'videos']);
  });

  it('ignora abas de outro endereço', () => {
    expect(keys([{ title: 'X', url: '/@x/videos/extra', selected: false }])).toEqual([
      'home',
      'videos',
      'streams',
      'playlists',
      'posts',
    ]);
  });
});

describe('activePage', () => {
  const pages = popupPages({
    rawTabs: [raw('Início', '/featured'), raw('Vídeos', '/videos'), raw('Shorts', '/shorts')],
  });

  it('mantém a preferência quando a página está na lista', () => {
    expect(activePage('shorts', pages)).toBe('shorts');
  });

  it('cai em Vídeos quando a preferência é de uma página que o canal não tem', () => {
    expect(activePage('podcasts', pages)).toBe('videos');
  });

  it('sem Vídeos na lista cai na primeira página', () => {
    const noVideos = popupPages({
      rawTabs: [raw('Início', '/featured'), raw('Shorts', '/shorts')],
    });
    expect(activePage('store', noVideos)).toBe('home');
  });
});
