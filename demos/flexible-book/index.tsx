import '../../src/web/public/themes/BookTheme.css';

import { render } from 'solid-js/web';

import {
  DoublePageBookAnimation,
  FlexibleBook,
  SinglePageBookAnimation,
  turnPageOnClick,
} from '@prospero/web';

const fileUrl = new URL('../text-samples/tempest.txt', import.meta.url);

const response = await fetch(fileUrl);
const text = await response.text();

render(
  () => (
    <FlexibleBook
      /*
      pages={[
        'Foo',
        'Bar',
        'Baz',
      ]}
        */
      text={text}
      mediaQueryList={[
        {
          animation: () => new SinglePageBookAnimation(),
          pagesShown: 1,
          pageStyles: {
            'font-family': 'Arial',
            'font-size': '16px',
            'line-height': '2',
            padding: '2em 1em',
          },
          containerStyles: {
            width: '80vw',
            height: '90vh',
            'max-width': '1200px',
            margin: 'auto',
          },
          events: {
            onClick: turnPageOnClick,
          },
        },
        {
          pattern: { minWidth: 800 },
          config: {
            animation: () => new DoublePageBookAnimation(),
            pagesShown: 2,
            showPagePicker: true,
            showBookmark: {
              storage: {
                get: () =>
                  JSON.parse(localStorage.getItem('tempest-bookmark')!),
                save: (bookmarkData) =>
                  localStorage.setItem(
                    'tempest-bookmark',
                    JSON.stringify(bookmarkData),
                  ),
              },
            },
            pageStyles: {
              'font-family': 'Arial',
              'font-size': '16px',
              'line-height': '2',
              padding: '2em 1em',
            },
            containerStyles: {
              width: '80vw',
              height: '90vh',
              'max-width': '1200px',
              margin: 'auto',
            },
            events: {
              onClick: turnPageOnClick,
            },
          },
        },
      ]}
    />
  ),
  document.body.querySelector('main')!,
);
