import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const YT = 'https://www.youtube.com';

// Começa cada teste com as regras sincronizadas e sem preferências.
test.beforeEach(async ({ setPreferences }) => {
  await setPreferences({});
});

// Imita um clique interno do YouTube: troca a URL sem recarregar a página.
const spaGo = (page: Page, path: string) =>
  page.evaluate(
    (target) => (window as unknown as { spaGo(path: string): void }).spaGo(target),
    path,
  );

test.describe('carga completa da página (declarativeNetRequest)', () => {
  test('abrir um canal leva para Vídeos por padrão', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(`${YT}/@kipperdev`);
    await expect(page).toHaveURL(`${YT}/@kipperdev/videos`);
  });

  test('cada canal usa a sua preferência', async ({ context, setPreferences }) => {
    await setPreferences({ '@kipperdev': 'streams', '@outro': 'home' });
    const page = await context.newPage();

    await page.goto(`${YT}/@kipperdev`);
    await expect(page).toHaveURL(`${YT}/@kipperdev/streams`);

    await page.goto(`${YT}/@outro`);
    await expect(page).toHaveURL(`${YT}/@outro`);

    await page.goto(`${YT}/@terceiro`);
    await expect(page).toHaveURL(`${YT}/@terceiro/videos`);
  });

  test('mudar a preferência vale na hora e voltar para Vídeos remove a regra', async ({
    context,
    setPreferences,
  }) => {
    const page = await context.newPage();

    await setPreferences({ '@kipperdev': 'posts' });
    await page.goto(`${YT}/@kipperdev`);
    await expect(page).toHaveURL(`${YT}/@kipperdev/posts`);

    await setPreferences({});
    await page.goto(`${YT}/@kipperdev`);
    await expect(page).toHaveURL(`${YT}/@kipperdev/videos`);
  });

  test('as formas da entrada do canal e a query string são tratadas', async ({
    context,
    setPreferences,
  }) => {
    await setPreferences({ '@kipperdev': 'playlists' });
    const page = await context.newPage();

    for (const path of ['/@kipperdev/', '/@kipperdev/featured', '/@KipperDev']) {
      await page.goto(`${YT}${path}`);
      await expect(page).toHaveURL(/\/playlists$/);
    }

    await page.goto(`${YT}/@kipperdev?si=abc`);
    await expect(page).toHaveURL(`${YT}/@kipperdev/playlists?si=abc`);
  });

  test('handle com letra fora do ASCII em caixa diferente', async ({ context, setPreferences }) => {
    await setPreferences({ '@café': 'posts' });
    const page = await context.newPage();

    await page.goto(`${YT}/@CAF%C3%89`);
    await expect(page).toHaveURL(`${YT}/@CAF%C3%89/posts`);
  });

  test('não mexe em outras páginas', async ({ context, setPreferences }) => {
    await setPreferences({ '@kipperdev': 'streams' });
    const page = await context.newPage();

    for (const path of ['/@kipperdev/about', '/@kipperdev/videos', '/watch?v=abc', '/shorts/abc']) {
      await page.goto(`${YT}${path}`);
      await expect(page).toHaveURL(`${YT}${path}`);
    }
  });
});

test.describe('navegação interna do YouTube (webNavigation)', () => {
  test('entrar num canal por um clique interno leva para a aba escolhida', async ({
    context,
    setPreferences,
  }) => {
    await setPreferences({ '@kipperdev': 'streams' });
    const page = await context.newPage();

    await page.goto(`${YT}/watch?v=abc`);
    await spaGo(page, '/@kipperdev');
    await expect(page).toHaveURL(`${YT}/@kipperdev/streams`);
  });

  test('o botão Voltar não cai de novo na entrada do canal', async ({ context }) => {
    const page = await context.newPage();

    await page.goto(`${YT}/watch?v=abc`);
    await spaGo(page, '/@kipperdev');
    await expect(page).toHaveURL(`${YT}/@kipperdev/videos`);

    await page.goBack();
    await expect(page).toHaveURL(`${YT}/watch?v=abc`);
  });

  test('clicar em Início dentro do canal não é desfeito', async ({ context }) => {
    const page = await context.newPage();

    await page.goto(`${YT}/@kipperdev/videos`);
    await spaGo(page, '/@kipperdev');

    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(`${YT}/@kipperdev`);
  });

  test('canal com preferência Início não é redirecionado', async ({ context, setPreferences }) => {
    await setPreferences({ '@kipperdev': 'home' });
    const page = await context.newPage();

    await page.goto(`${YT}/watch?v=abc`);
    await spaGo(page, '/@kipperdev');

    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(`${YT}/@kipperdev`);
  });

  test('sair de um canal para outro aplica a preferência do segundo', async ({
    context,
    setPreferences,
  }) => {
    await setPreferences({ '@b': 'posts' });
    const page = await context.newPage();

    await page.goto(`${YT}/@a/videos`);
    await spaGo(page, '/@b');
    await expect(page).toHaveURL(`${YT}/@b/posts`);
  });
});
