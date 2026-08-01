import { render } from 'solid-js/web';

import { turnPageOnClick } from './add-ons/event-listeners/click';
import { FlexibleBook } from './components/FlexibleBook';

const fileUrl = new URL('./text-samples/tempest.txt', import.meta.url);

const response = await fetch(fileUrl);
const text = await response.text();

/*
  const flexibleBook = FlexibleBookComponent(

    {
      text,
      pageStyles: {
        computedFontFamily: 'Arial',
        computedFontSize: '16px',
        lineHeight: 32,
        padding: {
          top: 36,
          right: 18,
          bottom: 36,
          left: 18,
        },
      },
      mediaQueryList: [
        {
          pagesShown: 1,
          listeners: [listenToClickEvents],
          pictureInPicture: {
            affectedElements: 'iframe',
            autoLock: true,
          },
        },
        {
          pattern: {
            minWidth: 800,
          },
          config: {
            pagesShown: 2,
            listeners: [listenToClickEvents, listenToKeyboardEvents],
            showPagePicker: true,
            showBookmark: {
              storage: {
                get: () =>
                  JSON.parse(localStorage.getItem('proteus-bookmark')!),
                save: (bookmark) =>
                  localStorage.setItem(
                    'proteus-bookmark',
                    JSON.stringify(bookmark),
                  ),
              },
            },
            pictureInPicture: {
              affectedElements: 'iframe',
              autoLock: true,
            },
          },
        },
      ],
    },
    {
      transformers: [
        {
          transform(text) {
            return text.replaceAll('\n', '');
          },
        },
      ],
    },
    {
      styles: {
        width: '80vw',
        height: '90vh',
        maxWidth: '1200px',
        margin: 'auto',
      },
    },
  );
  */

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
            pagesShown: 2,
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
