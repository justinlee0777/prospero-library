import type { JSX } from 'solid-js/jsx-runtime';
import type { BookAnimation } from '../../add-ons/animations.js';
import type { BookEventListener } from '../../add-ons/event-listeners.js';
import type { BookmarkStorage } from '../Bookmark/index.jsx';

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
    onKeyDown?: BookEventListener<KeyboardEvent>;
  };
}

export interface BookPropsWithPages extends BaseBookProps {
  pages: Array<string>;
}

export interface BookPropsWithText extends BaseBookProps {
  text: string;
}

export interface BookPropsWithGetPage extends BaseBookProps {
  getPage: (pageNumber: number) => Promise<string | null>;
}

export type BookProps =
  BookPropsWithPages | BookPropsWithText | BookPropsWithGetPage;

export interface GetPage {
  (pageNumber: number): Promise<string | null> | string | null;
}
