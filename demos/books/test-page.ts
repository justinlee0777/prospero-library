import { Pages } from '@prospero/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import { bookStyles } from './book-styles.const';

const text = await readFile(
  path.resolve(import.meta.dirname, '../text-samples/tempest.txt'),
  { encoding: 'utf-8' },
);

const page = await new Pages(text, bookStyles).get(0);

console.log('page', page);
