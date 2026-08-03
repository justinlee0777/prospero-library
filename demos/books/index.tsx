import '../../src/web/styles/themes/BookTheme.css';

import { render } from 'solid-js/web';
import { Books } from '@prospero/web/components';
import {
  changeOnArrowKeys,
  turnPageOnClick,
} from '@prospero/web/add-ons/event-listeners';

import { bookStyles, desktopStyles } from './book-styles.const';

const fileUrl = new URL('./pages.json', import.meta.url);

const response = await fetch(fileUrl);
const json: Array<string> = await response.json();

render(
  () => (
    <Books
      books={[
        {
          pages: json,
          pagesShown: 1,
          events: { onClick: turnPageOnClick },
          ...bookStyles,
        },
        {
          config: {
            pages: json,
            pagesShown: 2,
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
