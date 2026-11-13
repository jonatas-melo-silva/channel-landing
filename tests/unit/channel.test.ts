import { describe, expect, it } from 'vitest';
import { dataHandle, extractChannel, extractTabs, parseInitialData } from '@/lib/channel';

const tab = (url: string) => ({
  tabRenderer: { endpoint: { commandMetadata: { webCommandMetadata: { url } } } },
});

function sample(overrides: { rows?: string[][]; tabs?: unknown[] } = {}) {
  return {
    metadata: {
      channelMetadataRenderer: {
        title: 'Kipper Dev',
        vanityChannelUrl: 'http://www.youtube.com/@KipperDev',
        avatar: { thumbnails: [{ url: 'https://img/small' }, { url: 'https://img/big' }] },
      },
    },
    header: {
      pageHeaderRenderer: {
        content: {
          pageHeaderViewModel: {
            metadata: {
              contentMetadataViewModel: {
                metadataRows: (
                  overrides.rows ?? [['@kipperdev'], ['12,3 mil inscritos', '245 vídeos']]
                ).map((parts) => ({
                  metadataParts: parts.map((content) => ({ text: { content } })),
                })),
              },
            },
          },
        },
      },
    },
    contents: {
      twoColumnBrowseResultsRenderer: {
        tabs: overrides.tabs ?? [
          tab('/@KipperDev'),
          tab('/@KipperDev/videos'),
          tab('/@KipperDev/streams'),
          tab('/@KipperDev/playlists'),
          tab('/@KipperDev/community'),
        ],
      },
    },
  };
}

describe('parseInitialData', () => {
  const json = JSON.stringify({ a: 'texto com } e " dentro', b: { c: 1 } });

  it.each([
    [`var ytInitialData = ${json};`],
    [`window["ytInitialData"] = ${json};`],
    [`<script>var x=1;var ytInitialData = ${json};</script><script>other()</script>`],
  ])('lê o objeto de %#', (source) => {
    expect(parseInitialData(source)).toEqual(JSON.parse(json));
  });

  it.each([
    '',
    'sem nada',
    'var ytInitialData = ;',
    'var ytInitialData = {"a": ',
    'ytInitialData.foo({a:1})',
  ])('devolve null para %j', (source) => {
    expect(parseInitialData(source)).toBeNull();
  });
});

describe('extractChannel', () => {
  it('lê nome, avatar, números e abas', () => {
    expect(extractChannel(sample(), '@kipperdev')).toEqual({
      key: '@kipperdev',
      name: 'Kipper Dev',
      avatar: 'https://img/big',
      subscribers: '12,3 mil inscritos',
      videos: '245 vídeos',
      tabs: ['home', 'videos', 'streams', 'playlists'],
    });
  });

  it('entende os textos em inglês', () => {
    const data = sample({ rows: [['@x'], ['1.2M subscribers', '3 videos']] });
    const channel = extractChannel(data, '@x');
    expect(channel.subscribers).toBe('1.2M subscribers');
    expect(channel.videos).toBe('3 videos');
  });

  it('deixa null o que não existe, sem falhar', () => {
    expect(extractChannel({}, '@x')).toEqual({
      key: '@x',
      name: null,
      avatar: null,
      subscribers: null,
      videos: null,
      tabs: null,
    });
    expect(extractChannel(null, '@x').name).toBeNull();
  });

  it('usa o cabeçalho antigo quando não há metadados novos', () => {
    const data = {
      header: {
        c4TabbedHeaderRenderer: {
          subscriberCountText: { simpleText: '5 inscritos' },
          videosCountText: { runs: [{ text: '7' }, { text: ' vídeos' }] },
        },
      },
    };
    const channel = extractChannel(data, '@x');
    expect(channel.subscribers).toBe('5 inscritos');
    expect(channel.videos).toBe('7');
  });
});

describe('extractTabs', () => {
  it('reconhece as abas opcionais', () => {
    const tabs = extractTabs(
      sample({
        tabs: [
          tab('/@a'),
          tab('/@a/videos'),
          tab('/@a/podcasts'),
          tab('/@a/courses'),
          tab('/@a/store'),
        ],
      }),
    );
    expect(tabs).toEqual(['home', 'videos', 'podcasts', 'courses', 'store']);
  });

  it('aceita expandableTabRenderer, featured como Início e ignora o que não é aba', () => {
    const data = {
      contents: {
        twoColumnBrowseResultsRenderer: {
          tabs: [
            {
              expandableTabRenderer: {
                endpoint: { commandMetadata: { webCommandMetadata: { url: '/@a/featured' } } },
              },
            },
            tab('/@a/videos/extra'),
            tab('/channel/UC123/videos'),
            { tabRenderer: {} },
            null,
          ],
        },
      },
    };
    expect(extractTabs(data)).toEqual(['home']);
  });

  it('devolve null sem abas', () => {
    expect(extractTabs({ contents: { twoColumnBrowseResultsRenderer: { tabs: [] } } })).toBeNull();
  });
});

describe('dataHandle', () => {
  it('normaliza o handle do canal', () => {
    expect(dataHandle(sample())).toBe('@kipperdev');
  });

  it('usa ownerUrls quando não há vanityChannelUrl', () => {
    const data = {
      metadata: { channelMetadataRenderer: { ownerUrls: ['http://www.youtube.com/@CAF%C3%89'] } },
    };
    expect(dataHandle(data)).toBe('@café');
  });

  it('devolve null quando não dá para saber', () => {
    expect(dataHandle({})).toBeNull();
  });
});
