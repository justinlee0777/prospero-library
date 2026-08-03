// import '../../src/web/public/themes/BookTheme.css';

import { render } from 'solid-js/web';
import { Books } from '@prospero/web/components';
import { ServerPages } from '@prospero/web/utils';
import {
  changeOnArrowKeys,
  turnPageOnClick,
} from '@prospero/web/add-ons/event-listeners';

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
