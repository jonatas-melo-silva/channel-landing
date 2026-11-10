import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

// O WXT usa Vite 8 e o Vitest 3 usa Vite 7, então os tipos de plugin não batem.
// Em execução funciona (os testes passam); o cast só cala o erro de tipo.
// Remover quando o Vitest for atualizado para uma versão que use Vite 8.
const wxtVitest = WxtVitest() as never;

export default defineConfig({
  plugins: [wxtVitest],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
