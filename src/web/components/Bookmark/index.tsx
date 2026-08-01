import { Accessor, createSignal, Show } from 'solid-js';
import './Bookmark.css';

import clsx from 'clsx';

/**
 * Describes a stored bookmark.
 */
export interface BookmarkData {
  pageNumber: number;
}

/**
 * Retrieve and save bookmarks synchronously or asynchronously.
 */
export interface BookmarkStorage {
  get(): BookmarkData | Promise<BookmarkData | undefined> | undefined;
  save(bookmark: BookmarkData): void | Promise<void>;
}

interface Props {
  savedNumber?: Accessor<number | undefined>;
  className?: string;
  onClick?: (event: MouseEvent) => Promise<void>;
}

export function Bookmark({ savedNumber, className, onClick }: Props) {
  const [bookmarkActivated, setBookmarkActivated] = createSignal(false);

  return (
    <button
      class={clsx('bookmark', className, {
        bookmarkActivated: bookmarkActivated(),
      })}
      aria-label="Bookmark; click to save page for future viewing"
      onClick={async (event) => {
        await onClick?.(event);

        setBookmarkActivated(true);

        await new Promise((resolve) => setTimeout(resolve, 300));

        setBookmarkActivated(false);
      }}
    >
      <div class="bookmarkContent">
        <Show when={savedNumber?.()}>
          {(pageNumber) => <>{pageNumber() + 1}</>}
        </Show>
      </div>
    </button>
  );
}
