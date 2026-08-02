import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@prospero/server': resolve('./src/server/index.ts'),
      '@prospero/shared': resolve('./src/shared/index.ts'),
      '@prospero/web': resolve('./src/web/index.ts'),
    },
  },
});
