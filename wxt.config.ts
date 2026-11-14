import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // Manifest V3 explícito: o redirecionamento por declarativeNetRequest depende dele.
  manifestVersion: 3,
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    // Arquivos em public/icon. A origem do desenho é docs/publicacao/icone.svg.
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },
    // storage: preferências. declarativeNetRequest: redirecionar carga de página.
    // webNavigation: navegação interna do YouTube. scripting: trocar a entrada do histórico.
    permissions: ['storage', 'declarativeNetRequest', 'webNavigation', 'scripting'],
    host_permissions: ['https://www.youtube.com/*'],
    browser_specific_settings: {
      gecko: {
        id: 'channel-landing@jonatas-melo-silva.github.io',
        // A extensão não coleta dado nenhum. O Firefox exige essa declaração em extensões novas.
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
});
