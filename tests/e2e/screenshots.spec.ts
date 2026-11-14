import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';
import { test } from './fixtures';
import { openPopup } from './popup-page';

// Só roda com `pnpm screenshots`. Nos testes normais fica de fora.
test.skip(!process.env.SCREENSHOTS, 'Gera as capturas de tela das lojas, só com SCREENSHOTS=1');

const YT = 'https://www.youtube.com';
const OUT = resolve('docs/publicacao/capturas');

// Avatar desenhado na hora, porque o teste não acessa a internet.
const AVATAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 176 176"><rect width="176" height="176" fill="#6366f1"/><circle cx="88" cy="68" r="30" fill="#e0e7ff"/><ellipse cx="88" cy="150" rx="52" ry="42" fill="#e0e7ff"/></svg>`;

/** O popup tem 320 px de largura. A captura da loja é 1280x800, então ele é ampliado no centro. */
async function shoot(popup: Page, file: string) {
  await popup.setViewportSize({ width: 1280, height: 800 });
  await popup.addStyleTag({
    content: `
      html { background: linear-gradient(135deg, #eef2ff, #e0e7ff); }
      body { min-height: 100vh; display: grid; place-items: center; background: transparent; }
      main { zoom: 2.2; border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
             background: var(--background); box-shadow: 0 20px 50px rgb(79 70 229 / 0.25); }`,
  });
  await popup.waitForTimeout(300);
  mkdirSync(OUT, { recursive: true });
  // JPEG não tem canal alfa, que é o que a Chrome Web Store pede nas capturas.
  await popup.screenshot({ path: `${OUT}/${file}`, type: 'jpeg', quality: 95 });
}

test('capturas de tela para as lojas', async ({ context, serviceWorker, setPreferences }) => {
  await context.route('https://yt3.example/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: AVATAR }),
  );
  await setPreferences({ '@completo': 'streams' });

  const full = await context.newPage();
  await full.goto(`${YT}/@completo/streams`);
  await shoot(await openPopup(context, serviceWorker, full), '1-canal-completo.jpg');

  const basic = await context.newPage();
  await basic.goto(`${YT}/@basico/videos`);
  await shoot(await openPopup(context, serviceWorker, basic), '2-canal-basico.jpg');

  const watch = await context.newPage();
  await watch.goto(`${YT}/watch?v=abc`);
  await shoot(await openPopup(context, serviceWorker, watch), '3-fora-de-um-canal.jpg');
});
