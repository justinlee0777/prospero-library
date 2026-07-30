import {
  FlexibleBookComponent,
  IndentTransformer,
  listenToClickEvents,
  listenToKeyboardEvents,
  NewlineTransformer,
} from './index';

const fileUrl = new URL('./text-samples/tempest.txt', import.meta.url);

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(fileUrl);
  const text = await response.text();

  console.log('text', text);

  const container = document.body;

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
        new IndentTransformer(5),
        new NewlineTransformer({ beginningSections: 4, betweenParagraphs: 0 }),
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

  container.append(flexibleBook);
});
