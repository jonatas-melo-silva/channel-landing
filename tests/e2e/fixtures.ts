import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import https from 'node:https';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium, expect, test as base, type BrowserContext, type Worker } from '@playwright/test';
import type { Preferences } from '../../lib/preferences';
import { buildRules } from '../../lib/rules';
import { renderPage } from './fake-youtube';

// Certificado temporário só para este teste, gerado na hora para não guardar chave no Git.
function createCertificate(dir: string) {
  const keyFile = join(dir, 'key.pem');
  const certFile = join(dir, 'cert.pem');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-keyout',
      keyFile,
      '-out',
      certFile,
      '-days',
      '2',
      '-subj',
      '/CN=www.youtube.com',
      '-addext',
      'subjectAltName=DNS:www.youtube.com',
    ],
    { stdio: 'ignore' },
  );
  return { key: readFileSync(keyFile), cert: readFileSync(certFile) };
}

async function startFakeYoutube(dir: string) {
  const server = https.createServer(createCertificate(dir), (request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderPage(new URL(request.url ?? '/', 'https://www.youtube.com').pathname));
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));

  return {
    port: (server.address() as AddressInfo).port,
    close: () =>
      new Promise<void>((done) => {
        server.closeAllConnections();
        server.close(() => done());
      }),
  };
}

// Só o que os testes usam do objeto `chrome` dentro do service worker.
interface ChromeApi {
  storage: { local: { set(items: Record<string, unknown>): Promise<void> } };
  declarativeNetRequest: {
    getDynamicRules(): Promise<
      {
        id: number;
        action: { type: string; redirect?: { regexSubstitution?: string } };
        condition: { regexFilter?: string };
      }[]
    >;
  };
}

interface RuleShape {
  id: number;
  action: { type: string; redirect?: { regexSubstitution?: string } };
  condition: { regexFilter?: string };
}

const signature = (rules: readonly RuleShape[]) =>
  JSON.stringify(
    [...rules]
      .sort((a, b) => a.id - b.id)
      .map((rule) => [
        rule.id,
        rule.action.type,
        rule.action.redirect?.regexSubstitution ?? '',
        rule.condition.regexFilter ?? '',
      ]),
  );

interface Fixtures {
  context: BrowserContext;
  serviceWorker: Worker;
  /** Grava as preferências e espera o navegador aplicar as regras correspondentes. */
  setPreferences: (prefs: Preferences) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const dir = mkdtempSync(join(tmpdir(), 'channel-landing-e2e-'));
    const youtube = await startFakeYoutube(dir);
    const extensionPath = resolve(process.env.EXTENSION_PATH ?? '.output/chrome-mv3');

    const context = await chromium.launchPersistentContext(join(dir, 'profile'), {
      channel: 'chromium',
      ignoreHTTPSErrors: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        `--host-resolver-rules=MAP www.youtube.com 127.0.0.1:${youtube.port}`,
        // O teste só fala com o servidor local. Com proxy do sistema, quem resolveria o nome
        // seria o proxy e o mapeamento acima seria ignorado.
        '--no-proxy-server',
      ],
    });

    await use(context);

    await context.close();
    await youtube.close();
    rmSync(dir, { recursive: true, force: true });
  },

  serviceWorker: async ({ context }, use) => {
    await use(context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker')));
  },

  setPreferences: async ({ serviceWorker }, use) => {
    await use(async (prefs) => {
      await serviceWorker.evaluate(
        (value) =>
          (globalThis as unknown as { chrome: ChromeApi }).chrome.storage.local.set({
            preferences: value,
          }),
        prefs,
      );

      const expected = signature(buildRules(prefs));
      await expect
        .poll(async () =>
          signature(
            await serviceWorker.evaluate(() =>
              (
                globalThis as unknown as { chrome: ChromeApi }
              ).chrome.declarativeNetRequest.getDynamicRules(),
            ),
          ),
        )
        .toBe(expected);
    });
  },
});

export { expect };
