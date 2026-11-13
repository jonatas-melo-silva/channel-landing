import { getPage, type PageKey } from '../../lib/pages';

export interface FakeChannel {
  handle: string;
  name: string;
  subscribers: string;
  videos: string;
  tabs: PageKey[];
}

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
  '@basico': {
    handle: '@Basico',
    name: 'Canal Básico',
    subscribers: '12 mil inscritos',
    videos: '48 vídeos',
    tabs: CORE,
  },
};

function tabRenderer(handle: string, page: PageKey) {
  const path = getPage(page).path;
  const url = path === '' ? `/${handle}` : `/${handle}/${path}`;
  return { tabRenderer: { endpoint: { commandMetadata: { webCommandMetadata: { url } } } } };
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
  const channel = CHANNELS[decodeURIComponent(segment).toLowerCase()];
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
