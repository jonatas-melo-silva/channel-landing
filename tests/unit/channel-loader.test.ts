import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import {
  applyMissingTabFallback,
  clearChannelCache,
  loadChannel,
  loadCurrentChannel,
} from '@/lib/channel-loader';
import { channelData, pageHtml } from '../helpers/channel-data';

const YT = 'https://www.youtube.com';
const WITH_PODCASTS = channelData('@x', 'Canal X', ['home', 'videos', 'podcasts']);
const WITHOUT_PODCASTS = channelData('@x', 'Canal X', ['home', 'videos', 'streams']);

let fetchMock: ReturnType<typeof vi.fn>;

/** Coloca os dados num `<script>` da página, como numa carga completa do YouTube. */
function putInPage(data: unknown) {
  const script = document.createElement('script');
  script.textContent = `var ytInitialData = ${JSON.stringify(data)};`;
  document.head.append(script);
}

const respondWith = (data: unknown) =>
  fetchMock.mockResolvedValue({ ok: true, text: () => Promise.resolve(pageHtml(data)) });

beforeEach(() => {
  fakeBrowser.reset();
  clearChannelCache();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  document.head.innerHTML = '';
  vi.unstubAllGlobals();
});

const location = { key: '@x', rawHandle: '@x', page: 'videos', isLanding: false } as const;

describe('loadChannel', () => {
  it('lê os dados da própria página sem fazer requisição', async () => {
    putInPage(WITH_PODCASTS);

    const channel = await loadChannel(location);

    expect(channel?.name).toBe('Canal X');
    expect(channel?.tabs).toEqual(['home', 'videos', 'podcasts']);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('dados de outro canal na página (navegação interna) levam a baixar a página do canal', async () => {
    putInPage(channelData('@outro', 'Canal Outro', ['home', 'videos']));
    respondWith(WITH_PODCASTS);

    const channel = await loadChannel(location);

    expect(fetchMock).toHaveBeenCalledWith('/@x', { credentials: 'same-origin' });
    expect(channel?.name).toBe('Canal X');
  });

  it('a página baixada de outro canal é descartada', async () => {
    respondWith(channelData('@outro', 'Canal Outro', ['home', 'videos']));
    expect(await loadChannel(location)).toBeNull();
  });

  it('devolve null quando a requisição falha ou volta com erro', async () => {
    fetchMock.mockRejectedValueOnce(new Error('sem rede'));
    expect(await loadChannel(location)).toBeNull();

    fetchMock.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') });
    expect(await loadChannel(location)).toBeNull();
  });

  it('guarda o canal lido e não repete a leitura', async () => {
    putInPage(WITH_PODCASTS);

    await loadChannel(location);
    document.head.innerHTML = '';
    const again = await loadChannel(location);

    expect(again?.name).toBe('Canal X');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('loadCurrentChannel', () => {
  it('fora de um canal responde not-channel', async () => {
    expect(await loadCurrentChannel(`${YT}/watch?v=abc`)).toEqual({
      ok: false,
      reason: 'not-channel',
    });
  });

  it('canal sem dados legíveis responde unavailable', async () => {
    fetchMock.mockRejectedValue(new Error('sem rede'));
    expect(await loadCurrentChannel(`${YT}/@x/videos`)).toEqual({
      ok: false,
      reason: 'unavailable',
    });
  });

  it('canal lido responde ok com os dados', async () => {
    putInPage(WITH_PODCASTS);
    const response = await loadCurrentChannel(`${YT}/@x/videos`);
    expect(response).toMatchObject({ ok: true, channel: { key: '@x', name: 'Canal X' } });
  });
});

describe('applyMissingTabFallback', () => {
  const run = async (href: string) => {
    const navigate = vi.fn();
    await applyMissingTabFallback({ href, navigate });
    return navigate;
  };

  it('leva para Vídeos quando a página escolhida não existe no canal', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'podcasts' } });
    putInPage(WITHOUT_PODCASTS);

    const navigate = await run(`${YT}/@x/podcasts`);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/@x/videos');
  });

  it('não faz nada quando o canal tem a página', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'podcasts' } });
    putInPage(WITH_PODCASTS);

    expect(await run(`${YT}/@x/podcasts`)).not.toHaveBeenCalled();
  });

  it('não desvia quem está em outra página que não é a escolhida', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'podcasts' } });
    putInPage(WITHOUT_PODCASTS);

    expect(await run(`${YT}/@x/streams`)).not.toHaveBeenCalled();
  });

  it('não faz nada sem preferência, em Vídeos ou fora de um canal', async () => {
    putInPage(WITHOUT_PODCASTS);

    expect(await run(`${YT}/@x/videos`)).not.toHaveBeenCalled();
    expect(await run(`${YT}/watch?v=abc`)).not.toHaveBeenCalled();
  });

  it('não faz nada quando os dados do canal não puderam ser lidos', async () => {
    await fakeBrowser.storage.local.set({ preferences: { '@x': 'podcasts' } });
    fetchMock.mockRejectedValue(new Error('sem rede'));

    expect(await run(`${YT}/@x/podcasts`)).not.toHaveBeenCalled();
  });
});
