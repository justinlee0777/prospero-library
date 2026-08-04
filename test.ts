import { BookStyles, Pages } from '@prospero-library/server/index';
import { readFile } from 'fs/promises';
import path from 'path';

export const bookStyles: BookStyles = {
  pageStyles: {
    'font-family': 'Arial',
    'font-size': '16px',
    'line-height': '2',
    padding: '2em 1em',
  },
  containerStyles: {
    width: '375px',
    height: '667px',
  },
};

const text = await readFile(
  path.resolve(import.meta.dirname, './demos/text-samples/tempest.txt'),
  { encoding: 'utf-8' },
);

const pages = await new Pages(text, bookStyles).getAll();

console.log(JSON.stringify(pages, null, 2));
