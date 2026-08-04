import '../../src/web/styles/themes/BookTheme.css';

import { render } from 'solid-js/web';
import { Books, BookProps } from '../../src/web/components';
import {
  changeOnArrowKeys,
  turnPageOnClick,
} from '../../src/web/add-ons/event-listeners';

import { bookStyles, desktopStyles } from './book-styles.const';

const fileUrl = new URL('./pages.json', import.meta.url);

const response = await fetch(fileUrl);
const json: Array<string> = await response.json();

const tableOfContents: BookProps['showTableOfContents'] = {
  sections: Array(Math.ceil(json.length / 20))
    .fill(undefined)
    .map((_, i) => Math.min(i * 20, json.length))
    .map((pageNumber) => ({ pageNumber, title: pageNumber.toString() })),
};

render(
  () => (
    <Books
      books={[
        {
          pages: json,
          pagesShown: 1,
          showTableOfContents: tableOfContents,
          events: { onClick: turnPageOnClick },
          ...bookStyles,
        },
        {
          config: {
            pages: json,
            pagesShown: 2,
            showTableOfContents: tableOfContents,
            events: {
              onClick: turnPageOnClick,
              onKeyDown: changeOnArrowKeys,
            },
            ...desktopStyles,
          },
          media: {
            minWidth: 750,
          },
        },
      ]}
    />
  ),
  document.body.querySelector('main')!,
);
