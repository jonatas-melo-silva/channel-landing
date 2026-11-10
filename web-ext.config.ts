import { defineWebExtConfig } from 'wxt';

// Navegadores usados em `pnpm dev` e `pnpm dev:firefox`.
// Se o Brave estiver em outro caminho, defina BRAVE_PATH antes de rodar.
export default defineWebExtConfig({
  binaries: {
    chrome: process.env.BRAVE_PATH ?? '/usr/bin/brave-browser',
    firefox: process.env.FIREFOX_PATH ?? 'firefox',
  },
});
