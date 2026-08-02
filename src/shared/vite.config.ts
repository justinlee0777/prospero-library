import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

import { outDir } from './build.consts.js';

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.prod.json' })],
  build: {
    outDir,
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, './index.ts'),
        models: resolve(import.meta.dirname, './models.ts'),
      },
    },
  },
});
