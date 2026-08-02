import { copyFileSync } from 'fs';

const outDir = './dist';
console.log('post-build called');
copyFileSync('LICENSE', `${outDir}/LICENSE`);
