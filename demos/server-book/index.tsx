import '../../src/web/styles/themes/BookTheme.css';

import { render } from 'solid-js/web';
import { Books } from '@prospero-library/web/components.js';
import { ServerPages } from '@prospero-library/web/utils.js';
import {
  changeOnArrowKeys,
  turnPageOnClick,
} from '@prospero-library/web/add-ons/event-listeners.js';

import { mobileStyles, desktopStyles } from './book-styles.const';

const endpointBase = `http://localhost:8080/api/prospero/ulysses/pages`;

const mobilePages = new ServerPages(`${endpointBase}/mobile`);

const desktopPages = new ServerPages(`${endpointBase}/desktop`);

render(
  () => (
    <Books
      books={[
        {
          getPage: (pageNumber) => mobilePages.get(pageNumber),
          pagesShown: 1,
          events: { onClick: turnPageOnClick },
          ...mobileStyles,
        },
        {
          config: {
            getPage: (pageNumber) => desktopPages.get(pageNumber),
            pagesShown: 2,
            events: { onClick: turnPageOnClick, onKeyDown: changeOnArrowKeys },
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
