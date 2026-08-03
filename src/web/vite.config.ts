import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFile } from 'fs/promises';

import { outDir } from './build.consts.js';

const pkg = JSON.parse(await readFile('./package.json', { encoding: 'utf-8' }));

const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const external = [
  ...externalPackages.map(
    (packageName) => new RegExp(`^${packageName}(\/.*)?`),
  ),
];

export default defineConfig({
  plugins: [solidPlugin(), dts({ tsconfigPath: './tsconfig.prod.json' })],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@prospero-library/shared': resolve('../shared/index.ts'),
    },
  },
  build: {
    outDir,
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: {
        'add-ons/animations': resolve(
          import.meta.dirname,
          './add-ons/animations.ts',
        ),
        'add-ons/event-listeners': resolve(
          import.meta.dirname,
          './add-ons/event-listeners.ts',
        ),
        components: resolve(import.meta.dirname, './components.tsx'),
        utils: resolve(import.meta.dirname, './utils.ts'),
      },
      // Output as modern ES Modules
      formats: ['es'],
      // Name files matching the keys above (e.g., components.js, types.js)
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: '.',
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
