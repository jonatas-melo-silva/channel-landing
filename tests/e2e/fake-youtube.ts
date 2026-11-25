import { getPage, type PageKey } from '../../lib/pages';

export interface FakeChannel {
  handle: string;
  name: string;
  subscribers: string;
  videos: string;
  /** Abas na ordem do YouTube, com o texto que o site mostra. */
  tabs: PageKey[];
}

const TITLES: Record<string, string> = {
  home: 'Home',
  videos: 'Videos',
  shorts: 'Shorts',
  streams: 'Live',
  shows: 'Shows',
  playlists: 'Playlists',
  posts: 'Posts',
  search: 'Search',
};

const CORE: PageKey[] = ['home', 'videos', 'streams', 'playlists', 'posts'];

/** Canais do YouTube de mentira, pela chave (handle em minúsculas). */
export const CHANNELS: Record<string, FakeChannel> = {
  '@completo': {
    handle: '@Completo',
    name: 'Canal Completo',
    subscribers: '1,2 mi de inscritos',
    videos: '350 vídeos',
    tabs: [...CORE, 'podcasts', 'courses', 'store'],
  },
  // Abas que a extensão não conhece (shorts, shows) e a busca do canal, que não é uma página.
  '@variado': {
    handle: '@Variado',
    name: 'Canal Variado',
    subscribers: '300 inscritos',
    videos: '12 vídeos',
    tabs: ['home', 'videos', 'shorts', 'shows', 'playlists', 'search'],
  },
  '@basico': {
    handle: '@Basico',
    name: 'Canal Básico',
    subscribers: '12 mil inscritos',
    videos: '48 vídeos',
    tabs: CORE,
  },
};

function tabRenderer(handle: string, page: PageKey) {
  // O YouTube usa /@handle/featured para o Início.
  const url = page === 'home' ? `/${handle}/featured` : `/${handle}/${getPage(page).path}`;
  return {
    tabRenderer: {
      title: TITLES[page] ?? page,
      endpoint: { commandMetadata: { webCommandMetadata: { url } } },
    },
  };
}

/** Dados no formato de `ytInitialData`, só com os campos que a extensão lê. */
function initialData(channel: FakeChannel) {
  return {
    metadata: {
      channelMetadataRenderer: {
        title: channel.name,
        vanityChannelUrl: `http://www.youtube.com/${channel.handle}`,
        avatar: {
          thumbnails: [
            { url: 'https://yt3.example/avatar-88' },
            { url: 'https://yt3.example/avatar-176' },
          ],
        },
      },
    },
    header: {
      pageHeaderRenderer: {
        content: {
          pageHeaderViewModel: {
            metadata: {
              contentMetadataViewModel: {
                metadataRows: [
                  { metadataParts: [{ text: { content: channel.handle } }] },
                  {
                    metadataParts: [
                      { text: { content: channel.subscribers } },
                      { text: { content: channel.videos } },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    contents: {
      twoColumnBrowseResultsRenderer: {
        tabs: channel.tabs.map((page) => tabRenderer(channel.handle, page)),
      },
    },
  };
}

/**
 * Página servida no lugar do YouTube. Canais conhecidos recebem `ytInitialData` como o site
 * de verdade. `spaGo` imita a navegação interna, que troca a URL sem recarregar a página.
 */
export function renderPage(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  // Endereço antigo (`/nome/videos`) leva ao mesmo canal, como acontece com @Adrenaline.
  const name = decodeURIComponent(segment).toLowerCase();
  const channel = CHANNELS[name] ?? CHANNELS[`@${name}`];
  // `<` escapado para o JSON nunca fechar o script antes da hora.
  const data = channel ? JSON.stringify(initialData(channel)).replace(/</g, '\\u003c') : null;

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>youtube de mentira</title></head>
<body>
<p id="path"></p>
${data ? `<script nonce="x">var ytInitialData = ${data};</script>` : ''}
<script>
  document.getElementById('path').textContent = location.pathname + location.search;
  window.spaGo = (path) => {
    history.pushState({}, '', path);
    document.dispatchEvent(new Event('yt-navigate-finish'));
  };
</script>
</body></html>`;
}
