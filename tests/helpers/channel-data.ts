import type { PageKey } from '@/lib/pages';

/** Dados no formato de `ytInitialData`, só com os campos que a extensão lê. */
export function channelData(handle: string, name: string, tabs: readonly PageKey[]) {
  const tabUrl = (page: PageKey) => (page === 'home' ? `/${handle}` : `/${handle}/${page}`);
  return {
    metadata: {
      channelMetadataRenderer: {
        title: name,
        vanityChannelUrl: `http://www.youtube.com/${handle}`,
        avatar: { thumbnails: [{ url: `https://img.example/${name}.png` }] },
      },
    },
    contents: {
      twoColumnBrowseResultsRenderer: {
        tabs: tabs.map((page) => ({
          tabRenderer: {
            endpoint: { commandMetadata: { webCommandMetadata: { url: tabUrl(page) } } },
          },
        })),
      },
    },
  };
}

/** HTML com os dados no lugar em que o YouTube os coloca. */
export function pageHtml(data: unknown): string {
  return `<!doctype html><html><body><script>var ytInitialData = ${JSON.stringify(data)};</script></body></html>`;
}
