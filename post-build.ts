import { copyFileSync, readFileSync, writeFileSync } from 'fs';

const outDir = './dist';

copyFileSync('LICENSE', `${outDir}/LICENSE`);

const packageFile = 'package.json';

const contents = readFileSync(packageFile, { encoding: 'utf-8' });

const packageJSON = JSON.parse(contents);

delete packageJSON['devDependencies'];
delete packageJSON['scripts'];

writeFileSync(`${outDir}/${packageFile}`, JSON.stringify(packageJSON, null, 2));
