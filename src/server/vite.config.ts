import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

import { outDir } from './build.consts.js';

// export themes

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.prod.json' })],
  resolve: {
    alias: {
      '@prospero/shared': resolve('../shared/index.ts'),
      '@prospero/web': resolve('../web/index.ts'),
    },
  },
  build: {
    ssr: true,
    outDir,
    minify: true,
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, './index.ts'),
      },
      // Output as modern ES Modules
      formats: ['es'],
      // Name files matching the keys above (e.g., components.js, types.js)
      fileName: (format, entryName) => `${entryName}.js`,
    },
  },
});
