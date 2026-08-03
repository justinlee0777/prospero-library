import { copyFileSync, readFileSync, writeFileSync } from 'fs';

import { outDir } from './build.consts.js';

copyFileSync('../../LICENSE', `${outDir}/LICENSE`);

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

delete pkg['devDependencies'];
delete pkg['scripts'];

writeFileSync(`${outDir}/package.json`, JSON.stringify(pkg, null, 2));
