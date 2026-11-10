import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// Permissões e host_permissions entram na fase 2, junto com o redirecionamento.
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
    browser_specific_settings: {
      gecko: {
        id: 'channel-landing@jonatas-melo-silva.github.io',
        // A extensão não coleta dado nenhum. O Firefox exige essa declaração em extensões novas.
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
});
