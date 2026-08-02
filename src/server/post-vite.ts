import { readFileSync, writeFileSync } from 'fs';

import { outDir } from './build.consts.js';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

writeFileSync(`${outDir}/package.json`, JSON.stringify(pkg, null, 2));
