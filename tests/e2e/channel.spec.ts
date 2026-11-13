import type { Page } from '@playwright/test';
import type { GetChannelResponse } from '../../lib/messages';
import { expect, test } from './fixtures';

const YT = 'https://www.youtube.com';

interface TabsApi {
  tabs: {
    query(filter: { url: string }): Promise<{ id?: number; url?: string }[]>;
    sendMessage(tabId: number, message: unknown): Promise<unknown>;
  };
}

test.beforeEach(async ({ setPreferences }) => {
  await setPreferences({});
});

// Falhas de página e erros de console de cada página aberta no teste.
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

// Faz a pergunta que o popup faz ao content script, mas a partir do service worker.
async function askChannel(
  serviceWorker: { evaluate<R, A>(fn: (arg: A) => Promise<R>, arg: A): Promise<R> },
  page: Page,
): Promise<GetChannelResponse> {
  return serviceWorker.evaluate(async (url) => {
    const { tabs } = (globalThis as unknown as { chrome: TabsApi }).chrome;
    const [tab] = await tabs.query({ url });
    if (tab?.id === undefined) throw new Error('aba não encontrada');
    return (await tabs.sendMessage(tab.id, {
      type: 'channel-landing:get-channel',
    })) as GetChannelResponse;
  }, page.url());
}

const spaGo = (page: Page, path: string) =>
  page.evaluate(
    (target) => (window as unknown as { spaGo(path: string): void }).spaGo(target),
    path,
  );

test.describe('leitura dos dados do canal', () => {
  test('devolve nome, avatar, números e abas', async ({ context, serviceWorker }) => {
    const page = await context.newPage();
    const errors = collectErrors(page);
    await page.goto(`${YT}/@basico`);
    await expect(page).toHaveURL(`${YT}/@basico/videos`);

    await expect
      .poll(() => askChannel(serviceWorker, page))
      .toEqual({
        ok: true,
        channel: {
          key: '@basico',
          name: 'Canal Básico',
          avatar: 'https://yt3.example/avatar-176',
          subscribers: '12 mil inscritos',
          videos: '48 vídeos',
          tabs: ['home', 'videos', 'streams', 'playlists', 'posts'],
        },
      });
    expect(errors).toEqual([]);
  });

  test('lista as abas opcionais quando o canal tem', async ({ context, serviceWorker }) => {
    const page = await context.newPage();
    await page.goto(`${YT}/@completo/videos`);

    await expect
      .poll(async () => {
        const answer = await askChannel(serviceWorker, page);
        return answer.ok ? answer.channel.tabs : null;
      })
      .toEqual(['home', 'videos', 'streams', 'playlists', 'posts', 'podcasts', 'courses', 'store']);
  });

  test('navegação interna para outro canal mostra os dados do novo canal', async ({
    context,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    await page.goto(`${YT}/@completo/videos`);
    await expect.poll(() => askChannel(serviceWorker, page)).toMatchObject({ ok: true });

    // Os scripts da página continuam sendo os de @completo.
    await spaGo(page, '/@basico/videos');
    await expect
      .poll(async () => {
        const answer = await askChannel(serviceWorker, page);
        return answer.ok ? answer.channel.name : answer.reason;
      })
      .toBe('Canal Básico');
  });

  test('fora de um canal a resposta é controlada', async ({ context, serviceWorker }) => {
    const page = await context.newPage();
    const errors = collectErrors(page);
    await page.goto(`${YT}/watch?v=abc`);
    await page.waitForLoadState('load');

    // Sem canal, o popup nem chega a perguntar, mas o content script também responde bem.
    await expect
      .poll(() => askChannel(serviceWorker, page))
      .toEqual({ ok: false, reason: 'not-channel' });
    expect(errors).toEqual([]);
  });

  test('canal sem dados legíveis responde indisponível e não redireciona', async ({
    context,
    serviceWorker,
    setPreferences,
  }) => {
    await setPreferences({ '@fantasma': 'podcasts' });
    const page = await context.newPage();
    const errors = collectErrors(page);
    await page.goto(`${YT}/@fantasma`);
    await expect(page).toHaveURL(`${YT}/@fantasma/podcasts`);

    await expect
      .poll(() => askChannel(serviceWorker, page))
      .toEqual({ ok: false, reason: 'unavailable' });
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(`${YT}/@fantasma/podcasts`);
    expect(errors).toEqual([]);
  });
});

test.describe('página escolhida que o canal não tem', () => {
  test('vai para Vídeos', async ({ context, setPreferences }) => {
    await setPreferences({ '@basico': 'podcasts' });
    const page = await context.newPage();
    const errors = collectErrors(page);

    await page.goto(`${YT}/@basico`);
    await expect(page).toHaveURL(`${YT}/@basico/videos`);
    expect(errors).toEqual([]);
  });

  test('fica quando o canal tem a página', async ({ context, setPreferences }) => {
    await setPreferences({ '@completo': 'podcasts' });
    const page = await context.newPage();

    await page.goto(`${YT}/@completo`);
    await expect(page).toHaveURL(`${YT}/@completo/podcasts`);
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(`${YT}/@completo/podcasts`);
  });

  test('não entra em loop: poucas navegações e a URL termina estável', async ({
    context,
    setPreferences,
  }) => {
    await setPreferences({ '@basico': 'store' });
    const page = await context.newPage();
    let navigations = 0;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });

    await page.goto(`${YT}/@basico`);
    await expect(page).toHaveURL(`${YT}/@basico/videos`);
    await page.waitForTimeout(1000);

    expect(page.url()).toBe(`${YT}/@basico/videos`);
    expect(navigations).toBeLessThanOrEqual(3);
  });

  test('não desvia quem abre outra aba de propósito', async ({ context, setPreferences }) => {
    await setPreferences({ '@basico': 'podcasts' });
    const page = await context.newPage();

    await page.goto(`${YT}/@basico/streams`);
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(`${YT}/@basico/streams`);
  });

  test('funciona também na navegação interna', async ({ context, setPreferences }) => {
    await setPreferences({ '@basico': 'courses' });
    const page = await context.newPage();
    await page.goto(`${YT}/watch?v=abc`);

    await spaGo(page, '/@basico/courses');
    await expect(page).toHaveURL(`${YT}/@basico/videos`);
  });
});
