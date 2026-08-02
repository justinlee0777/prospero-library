import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

import { outDir } from './build.consts.js';

// TODO: export themes

export default defineConfig({
  plugins: [solidPlugin(), dts({ tsconfigPath: './tsconfig.prod.json' })],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@prospero/shared': resolve('../shared/index.ts'),
    },
  },
  build: {
    outDir,
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, './index.ts'),
        'add-ons/animations': resolve(
          import.meta.dirname,
          './add-ons/animations/index.ts',
        ),
        'add-ons/event-listeners': resolve(
          import.meta.dirname,
          './add-ons/event-listeners/index.ts',
        ),
        components: resolve(import.meta.dirname, './components/index.ts'),
        utils: resolve(import.meta.dirname, './utils/index.ts'),
      },
      // Output as modern ES Modules
      formats: ['es'],
      // Name files matching the keys above (e.g., components.js, types.js)
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: '.',
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
