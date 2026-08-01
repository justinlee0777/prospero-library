import './Book.css';

import { createEffect, createSignal, JSX } from 'solid-js';

import { Page, PageContent } from './Page';
import { Pages } from '../../utils/pages';
import type { BookEventListener } from '../../add-ons/event-listeners/models';
import type { BookAnimation } from '../../add-ons/animations/models';

export interface BaseBookProps {
  containerStyles: JSX.CSSProperties;
  pageStyles: JSX.CSSProperties;
  pagesShown: number;

  animation?: () => BookAnimation;
  events?: {
    onClick?: BookEventListener<MouseEvent>;
  };
}

export interface BookPropsWithPages extends BaseBookProps {
  pages: Array<string>;
}

export interface BookPropsWithText extends BaseBookProps {
  text: string;
}

export type BookProps = BookPropsWithPages | BookPropsWithText;

export interface GetPage {
  (pageNumber: number): Promise<string | null> | string | null;
}

export function Book({
  pagesShown,
  pageStyles,
  containerStyles,
  events,
  animation,
  ...remainingProps
}: BookProps) {
  let resolveSlatePromise: (slate: HTMLDivElement) => void;

  const slatePromise = new Promise<HTMLDivElement>((resolve) => {
    resolveSlatePromise = resolve;
  });

  // Used specifically for animations.
  const [underPages, setUnderPages] = createSignal<Array<PageContent>>([]);

  const [renderedPages, setRenderedPages] = createSignal<Array<PageContent>>(
    [],
  );

  let resolveGetPagePromise: (getPage: GetPage) => void;

  const getPagePromise = new Promise<GetPage>((resolve) => {
    resolveGetPagePromise = resolve;
  });

  const getPage: GetPage = async (pageNumber: number) =>
    getPagePromise.then((getPageFn) => getPageFn(pageNumber));

  if ('pages' in remainingProps) {
    resolveGetPagePromise!((pageNumber) => {
      if (pageNumber < 0 || pageNumber >= remainingProps.pages.length) {
        return null;
      } else {
        return remainingProps.pages[pageNumber];
      }
    });
  } else {
    slatePromise.then((slateElement) => {
      const pages = new Pages(slateElement, remainingProps.text);

      resolveGetPagePromise(pages.get.bind(pages));
    });
  }

  let bookElement: HTMLDivElement;

  const bookAnimation = animation?.();

  const [currentPage, setCurrentPage] = createSignal(0);

  const getPages = async (pageNumber: number) => {
    const pages = await Promise.all(
      Array(pagesShown)
        .fill(undefined)
        .map((_, i) => pageNumber + i)
        .map(async (number) => ({
          number,
          content: await getPage(number),
        })),
    );

    if (pages.every((page) => page.content === null)) {
      return false;
    } else {
      return pages.map((page) => ({ ...page, content: page.content ?? '' }));
    }
  };

  const updatePages = async (pageNumber: number) => {
    const pages = await getPages(pageNumber);
    if (pages) {
      setUnderPages(pages);

      await bookAnimation?.changePage(
        pageNumber,
        [
          ...bookElement!.querySelectorAll('.page:not(.underPage)'),
        ] as Array<HTMLElement>,
        [
          ...bookElement!.querySelectorAll('.page.underPage'),
        ] as Array<HTMLElement>,
      );

      setRenderedPages(pages);
      setUnderPages([]);
    } else if (pageNumber !== 0) {
      await updatePages(0);
    } else {
      // Else ... show nothing. It's the client's fault.
    }
  };

  const decrement = async () => {
    const page = Math.max(currentPage() - pagesShown, 0);

    if (await getPages(page)) {
      setCurrentPage(page);
    }
  };

  const increment = async () => {
    const page = currentPage() + pagesShown;
    if (await getPages(page)) {
      setCurrentPage(page);
    }
  };

  createEffect(() => {
    updatePages(currentPage());
  });

  const portion = 100 / pagesShown;

  const renderPageFn =
    (className?: string) => (page: PageContent, i: number) => {
      return (
        <Page
          className={className}
          page={page}
          styles={{
            ...pageStyles,
            left: `${portion * i}%`,
            width: `${portion}%`,
          }}
        />
      );
    };

  const renderPage = renderPageFn();
  const renderUnderPage = renderPageFn('underPage');

  return (
    <div
      class="book"
      ref={bookElement!}
      style={{ ...containerStyles }}
      onClick={(event) =>
        events?.onClick?.({
          event,
          increment,
          decrement,
          bookElement: bookElement!,
        })
      }
    >
      {underPages().map(renderUnderPage)}
      {renderedPages().map(renderPage)}
      <div
        class="slate"
        ref={(element) => resolveSlatePromise(element)}
        style={{
          ...pageStyles,
          'box-sizing': 'border-box',
          position: 'absolute',
          left: '-99in',
          width: `${portion}%`,
        }}
      ></div>
    </div>
  );
}
