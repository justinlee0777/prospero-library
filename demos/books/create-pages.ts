import { Pages } from '@prospero-library/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import { bookStyles } from './book-styles.const';

const jsonOutput = path.resolve(import.meta.dirname, './pages.json');

const text = await readFile(
  path.resolve(import.meta.dirname, '../text-samples/tempest.txt'),
  { encoding: 'utf-8' },
);

const pages = await new Pages(text, bookStyles).getAll();

await writeFile(jsonOutput, JSON.stringify(pages, null, 2));
