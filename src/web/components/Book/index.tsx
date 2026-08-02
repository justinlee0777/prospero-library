import './Book.css';

import {
  createEffect,
  createResource,
  createSignal,
  JSX,
  lazy,
  Show,
} from 'solid-js';
import clsx from 'clsx';

import { Page, PageContent } from './Page';
import { Pages } from '../../utils/pages';
import type { BookEventListener } from '../../add-ons/event-listeners/models';
import type { BookAnimation } from '../../add-ons/animations/models';
import { Lamina } from '../Lamina';
import type { BookmarkStorage } from '../Bookmark';

const PagePicker = lazy(() => import('../PagePicker/lazy'));
const Bookmark = lazy(() => import('../Bookmark/lazy'));

export interface BaseBookProps {
  containerStyles: JSX.CSSProperties;
  pageStyles: JSX.CSSProperties;
  /** Number of pages to show. */
  pagesShown: number;

  /** Not removing the element, but hiding it from the UI with aria attributes */
  hide?: boolean;
  /** Page to initialize on. */
  currentPage?: number;
  /** Show an input that the user can use to change the page directly. */
  showPagePicker?: boolean;
  /** Use a bookmark by hooking it to a bookmark storage. */
  showBookmark?: {
    storage: BookmarkStorage;
  };
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
  currentPage: initialPage,
  pagesShown,
  pageStyles,
  containerStyles,
  events,
  animation,
  showPagePicker,
  showBookmark,
  hide,
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

  let laminaElement: HTMLDivElement;

  const bookAnimation = animation?.();

  const [bookmarkData, { mutate: mutateBookmarkData }] = createResource(() => {
    return showBookmark?.storage.get();
  });

  const [currentPage, setCurrentPage] = createSignal<number | undefined>();

  const activePage = (): number =>
    currentPage() ?? bookmarkData()?.pageNumber ?? initialPage ?? 0;

  const getPages = async (pageNumber: number) => {
    const pages: Array<{ number: number; content: string | null }> = [];

    for (let i = 0; i < pagesShown; i++) {
      const number = pageNumber + i;

      pages.push({
        number,
        content: await getPage(number),
      });
    }

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
    const page = Math.max(activePage() - pagesShown, 0);

    if (await getPages(page)) {
      setCurrentPage(page);
    }
  };

  const increment = async () => {
    const page = activePage() + pagesShown;
    if (await getPages(page)) {
      setCurrentPage(page);
    }
  };

  createEffect(() => {
    updatePages(activePage());
  });

  const stopPropagation = (event: Event) => event.stopPropagation();

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
      class={clsx('book', { bookHidden: hide })}
      ref={bookElement!}
      aria-hidden={hide}
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
      <Lamina ref={laminaElement!}>
        <Show when={showPagePicker}>
          <PagePicker
            className="bookPagePicker"
            onPageChange={(pageNumber) => setCurrentPage(pageNumber - 1)}
            onClick={stopPropagation}
          />
        </Show>
        <Show when={showBookmark}>
          {(bookmark) => (
            <Bookmark
              className="bookBookmark"
              savedNumber={() => bookmarkData()?.pageNumber}
              onClick={async (event) => {
                event.stopPropagation();

                bookmark().storage.save({
                  pageNumber: activePage(),
                });

                mutateBookmarkData({
                  ...bookmarkData(),
                  pageNumber: activePage(),
                });
              }}
            />
          )}
        </Show>
      </Lamina>
    </div>
  );
}
