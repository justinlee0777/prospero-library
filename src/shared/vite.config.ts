import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

import { outDir } from './build.consts.js';

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.prod.json' })],
  build: {
    outDir,
    minify: true,
    sourcemap: true,
    lib: {
      entry: {
        models: resolve(import.meta.dirname, './models.ts'),
      },
      formats: ['es'],
    },
  },
});
