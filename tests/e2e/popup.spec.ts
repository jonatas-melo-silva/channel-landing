import type { Page, Worker } from '@playwright/test';
import { expect, test } from './fixtures';
import { openPopup, type ChromeStorageApi } from './popup-page';

const YT = 'https://www.youtube.com';

test.beforeEach(async ({ setPreferences }) => {
  await setPreferences({});
});

const switches = (popup: Page) => popup.getByRole('switch');
const active = async (popup: Page) =>
  popup
    .getByRole('switch', { checked: true })
    .evaluateAll((nodes) => nodes.map((node) => node.parentElement?.textContent?.trim() ?? ''));

async function storedPreferences(serviceWorker: Worker) {
  return serviceWorker.evaluate(async () => {
    const { storage } = (globalThis as unknown as { chrome: ChromeStorageApi }).chrome;
    return (await storage.local.get('preferences')).preferences;
  });
}

test.describe('popup de um canal', () => {
  test('mostra header, switches e rodapé separados por duas linhas', async ({
    context,
    serviceWorker,
  }) => {
    const youtube = await context.newPage();
    await youtube.goto(`${YT}/@basico/videos`);
    const popup = await openPopup(context, serviceWorker, youtube);

    await expect(popup.getByRole('heading', { name: 'Canal Básico' })).toBeVisible();
    await expect(popup.getByTestId('badge-subscribers')).toHaveText('12 mil inscritos');
    await expect(popup.getByTestId('badge-videos')).toHaveText('48 vídeos');

    await expect(switches(popup)).toHaveCount(5);
    expect(await active(popup)).toEqual(['Videos']);

    const link = popup.getByRole('link', { name: 'Jonatas Melo Silva' });
    await expect(link).toHaveAttribute(
      'href',
      'https://github.com/jonatas-melo-silva/channel-landing',
    );
    await expect(popup.locator('[data-slot="separator"]')).toHaveCount(2);
  });

  test('abas opcionais só aparecem quando o canal tem', async ({ context, serviceWorker }) => {
    const full = await context.newPage();
    await full.goto(`${YT}/@completo/videos`);
    const fullPopup = await openPopup(context, serviceWorker, full);
    await expect(switches(fullPopup)).toHaveCount(8);

    const basic = await context.newPage();
    await basic.goto(`${YT}/@basico/videos`);
    const basicPopup = await openPopup(context, serviceWorker, basic);
    await expect(switches(basicPopup)).toHaveCount(5);
    await expect(basicPopup.getByRole('switch', { name: 'Podcasts' })).toHaveCount(0);
  });

  test('só um switch fica ligado e desligar o ligado não faz nada', async ({
    context,
    serviceWorker,
  }) => {
    const youtube = await context.newPage();
    await youtube.goto(`${YT}/@basico/videos`);
    const popup = await openPopup(context, serviceWorker, youtube);

    await popup.getByRole('switch', { name: 'Live' }).click();
    await expect.poll(() => active(popup)).toEqual(['Live']);

    await popup.getByRole('switch', { name: 'Live' }).click();
    await expect.poll(() => active(popup)).toEqual(['Live']);
    expect(await storedPreferences(serviceWorker)).toEqual({ '@basico': 'streams' });
  });

  test('a escolha continua depois de fechar e reabrir o popup', async ({
    context,
    serviceWorker,
  }) => {
    const youtube = await context.newPage();
    await youtube.goto(`${YT}/@completo/videos`);
    const popup = await openPopup(context, serviceWorker, youtube);
    await popup.getByRole('switch', { name: 'Podcasts' }).click();
    await expect.poll(() => storedPreferences(serviceWorker)).toEqual({ '@completo': 'podcasts' });
    await popup.close();

    const reopened = await openPopup(context, serviceWorker, youtube);
    await expect.poll(() => active(reopened)).toEqual(['Podcasts']);

    // Voltar para Vídeos remove a entrada do canal.
    await reopened.getByRole('switch', { name: 'Videos' }).click();
    await expect.poll(() => storedPreferences(serviceWorker)).toEqual({});
  });

  test('cada canal tem a sua escolha', async ({ context, serviceWorker, setPreferences }) => {
    await setPreferences({ '@basico': 'posts' });
    const basic = await context.newPage();
    await basic.goto(`${YT}/@basico/videos`);
    const full = await context.newPage();
    await full.goto(`${YT}/@completo/videos`);

    expect(await active(await openPopup(context, serviceWorker, basic))).toEqual(['Posts']);
    expect(await active(await openPopup(context, serviceWorker, full))).toEqual(['Videos']);
  });

  test('preferência por uma aba que o canal não tem aparece como Vídeos', async ({
    context,
    serviceWorker,
    setPreferences,
  }) => {
    await setPreferences({ '@basico': 'podcasts' });
    const youtube = await context.newPage();
    // Na aba de Posts a extensão não desvia, então a página fica aberta para o popup ler.
    await youtube.goto(`${YT}/@basico/posts`);
    const popup = await openPopup(context, serviceWorker, youtube);

    await expect.poll(() => active(popup)).toEqual(['Videos']);
  });

  test('dá para escolher só com o teclado', async ({ context, serviceWorker }) => {
    const youtube = await context.newPage();
    await youtube.goto(`${YT}/@basico/videos`);
    const popup = await openPopup(context, serviceWorker, youtube);
    await expect(switches(popup)).toHaveCount(5);

    await popup.getByRole('switch', { name: 'Home' }).focus();
    await popup.keyboard.press('Tab'); // Videos
    await popup.keyboard.press('Tab'); // Live
    await popup.keyboard.press('Tab'); // Playlists
    await expect(popup.getByRole('switch', { name: 'Playlists' })).toBeFocused();
    await popup.keyboard.press('Space');

    await expect.poll(() => active(popup)).toEqual(['Playlists']);
  });
});

test.describe('estados sem canal', () => {
  test('fora de um canal explica o que fazer e mantém o rodapé', async ({
    context,
    serviceWorker,
  }) => {
    const youtube = await context.newPage();
    await youtube.goto(`${YT}/watch?v=abc`);
    const popup = await openPopup(context, serviceWorker, youtube);

    await expect(
      popup.getByText('Open a YouTube channel to choose which tab it opens on.'),
    ).toBeVisible();
    await expect(switches(popup)).toHaveCount(0);
    await expect(popup.getByRole('link', { name: 'Jonatas Melo Silva' })).toBeVisible();
  });

  test('canal que não dá para ler mostra o erro', async ({ context, serviceWorker }) => {
    const youtube = await context.newPage();
    await youtube.goto(`${YT}/@fantasma/videos`);
    const popup = await openPopup(context, serviceWorker, youtube);

    await expect(popup.getByText(/Could not read this channel/)).toBeVisible();
    await expect(switches(popup)).toHaveCount(0);
  });
});
