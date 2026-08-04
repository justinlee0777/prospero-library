import path from 'path';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const rootPath = path.join(import.meta.dirname, '../demos');

const baseUrl = 'http://localhost:3000';

/**
 * Used to fill in dynamic routes with good examples.
 */
export async function getFinalUrls(): Promise<Array<string>> {
  const finalPath = path.join(rootPath);

  const files = await readdir(finalPath, { withFileTypes: true });

  const bannedFolders = new Set(['text-samples']);

  return files
    .filter((file) => file.isDirectory())
    .map((file) => file.name)
    .filter((fileName) => !bannedFolders.has(fileName))
    .map((fileName) => `${baseUrl}/demos/${fileName}/index.html`);
}

console.log(import.meta.url);

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  getFinalUrls()
    .then(async (finalResult) => {
      console.log('result', finalResult);

      process.exit(0);
    })
    .catch((error) => {
      console.log('Error in populating DB:', error);
      process.exit(1);
    });
}
