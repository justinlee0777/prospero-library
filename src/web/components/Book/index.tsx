import './Book.css';

import {
  createEffect,
  createResource,
  createSignal,
  lazy,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import clsx from 'clsx';

import { Page, PageContent, Slate } from '../Page/index.jsx';
import { Pages } from '../../utils/pages/index.js';
import { Lamina } from '../Lamina/index.jsx';
import { LoadingIcon } from '../LoadingIcon/index.jsx';
import { BookProps, GetPage } from './models.js';

const PagePicker = lazy(() => import('../PagePicker/lazy.js'));
const Bookmark = lazy(() => import('../Bookmark/lazy.js'));
const TableOfContents = lazy(() => import('../TableOfContents/lazy.js'));

export * from './models.js';

export function Book(props: BookProps) {
  const {
    currentPage: initialPage,
    pagesShown,
    pageStyles,
    containerStyles,
    events,
    animation,
    showPagePicker,
    showBookmark,
    showTableOfContents,
    hide,
  } = props;

  // Used specifically for animations.
  const [underPages, setUnderPages] = createSignal<Array<PageContent>>([]);

  const [renderedPages, setRenderedPages] = createSignal<Array<PageContent>>(
    [],
  );

  let slateElement: HTMLDivElement | undefined;

  const [getPageFn, setGetPageFn] = createSignal<GetPage>();
  /*
  const getPage: GetPage = async (pageNumber: number) =>
    getPagePromise.then((getPageFn) => getPageFn(pageNumber));
  */

  if ('pages' in props) {
    setGetPageFn(() => (pageNumber) => {
      if (pageNumber < 0 || pageNumber >= props.pages.length) {
        return null;
      } else {
        return props.pages[pageNumber];
      }
    });
  } else if ('getPage' in props) {
    setGetPageFn(() => props.getPage);
  }

  onMount(() => {
    if ('text' in props && slateElement) {
      const pages = new Pages(slateElement, props.text);

      setGetPageFn(() => pages.get.bind(pages));

      onCleanup(() => pages.cleanup());
    }
  });

  let bookElement: HTMLDivElement;

  let laminaElement: HTMLDivElement;

  const bookAnimation = animation?.();

  const [bookmarkData, { mutate: mutateBookmarkData }] = createResource(() => {
    return showBookmark?.storage.get();
  });

  const [currentPage, setCurrentPage] = createSignal<number | undefined>();

  const activePage = (): number =>
    Math.max(
      currentPage() ?? bookmarkData()?.pageNumber ?? initialPage ?? 0,
      0,
    );

  const getPages = async (pageNumber: number, getPage: GetPage) => {
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

  const [pages] = createResource(
    () => ({ pageNumber: activePage(), getPage: getPageFn() }),
    async ({ pageNumber, getPage }) => {
      if (getPage) {
        return getPages(pageNumber, getPage);
      } else {
        return [];
      }
    },
  );

  createEffect(async () => {
    const pagesValue = pages();

    if (Array.isArray(pagesValue)) {
      setUnderPages(pagesValue);

      await new Promise((resolve) => setTimeout(resolve, 0));

      await bookAnimation?.changePage(
        activePage(),
        [
          ...bookElement!.querySelectorAll('.page:not(.underPage)'),
        ] as Array<HTMLElement>,
        [
          ...bookElement!.querySelectorAll('.page.underPage'),
        ] as Array<HTMLElement>,
      );

      setRenderedPages(pagesValue);
      setUnderPages([]);
    } else {
      // Else ... show nothing. It's the client's fault.
    }
  });

  const goToPage = async (page: number) => {
    const getPage = getPageFn();
    if (!getPage) {
      return;
    }
    if (await getPages(page, getPage)) {
      setCurrentPage(page);
    }
  };

  const decrement = async () => {
    const page = Math.max(activePage() - pagesShown, 0);

    await goToPage(page);
  };

  const increment = async () => {
    const page = activePage() + pagesShown;
    await goToPage(page);
  };

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
            position: 'absolute',
            left: `${portion * i}%`,
            width: `${portion}%`,
          }}
        />
      );
    };

  const renderPage = renderPageFn();
  const renderUnderPage = renderPageFn('underPage');

  const [tableOfContentsOpened, setTableOfContentsOpened] = createSignal(false);

  return (
    <div
      tabIndex={0}
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
      onKeyDown={(event) =>
        events?.onKeyDown?.({
          event,
          increment,
          decrement,
          bookElement: bookElement!,
        })
      }
    >
      {underPages().map(renderUnderPage)}
      {renderedPages().map(renderPage)}
      <Slate
        ref={slateElement!}
        styles={{
          ...pageStyles,
          width: `${portion}%`,
        }}
      />
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
        <Show when={pages.loading}>
          <LoadingIcon className="bookLoadingIcon" />
        </Show>
        <Show when={showTableOfContents}>
          {(tableOfContents) => (
            <TableOfContents
              {...tableOfContents()}
              classes={{
                trigger: 'bookTableOfContentsTrigger',
                list: 'bookTableOfContents',
              }}
              opened={tableOfContentsOpened}
              onOpen={() => setTableOfContentsOpened(true)}
              onClose={() => setTableOfContentsOpened(false)}
              onSectionSelected={({ pageNumber }) => {
                goToPage(pageNumber);

                setTableOfContentsOpened(false);
              }}
            />
          )}
        </Show>
      </Lamina>
    </div>
  );
}
