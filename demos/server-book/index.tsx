import '../../src/web/styles/themes/BookTheme.css';

import { render } from 'solid-js/web';
import { Books } from '../../src/web/components.js';
import { ServerPages } from '../../src/web/utils.js';
import {
  changeOnArrowKeys,
  turnPageOnClick,
} from '../../src/web/add-ons/event-listeners.js';

import { mobileStyles, desktopStyles } from './book-styles.const.js';

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
            showPagePicker: true,
            showBookmark: {
              storage: {
                get: () => {
                  const savedData = localStorage.getItem('ulysses-desktop');
                  if (savedData) {
                    return JSON.parse(savedData);
                  }
                },
                save: (data) =>
                  localStorage.setItem('ulysses-desktop', JSON.stringify(data)),
              },
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
