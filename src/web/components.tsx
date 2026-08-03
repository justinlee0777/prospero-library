export * from './components/Book/index.jsx';

export * from './components/Books/index.jsx';

export * from './components/FlexibleBook/index.jsx';

import { customElement, noShadowDOM } from 'solid-element';

import { Book, BookProps } from './components/Book/index.jsx';
import { Books, BooksProps } from './components/Books/index.jsx';
import {
  FlexibleBook,
  FlexibleBookProps,
} from './components/FlexibleBook/index.jsx';

function checkEnvironment(tagName: string): boolean {
  return !(typeof window === 'undefined' && customElements.get(tagName));
}

const defaultBookProps: BookProps = {
  text: '',
  pages: undefined,
  getPage: undefined,
  events: {},
  showBookmark: undefined,
  currentPage: undefined,
  showPagePicker: undefined,
  hide: undefined,
  animation: undefined,
  pagesShown: 1,
  containerStyles: {},
  pageStyles: {},
};

export function registerBookComponent() {
  const tagName = 'prospero-book';

  if (checkEnvironment(tagName)) {
    customElement(tagName, defaultBookProps, (props: BookProps) => {
      noShadowDOM();
      return <Book {...props} />;
    });
  }
}

type FlattenUnion<T> = {
  [K in T extends any ? keyof T : never]: T extends any
    ? K extends keyof T
      ? T[K]
      : undefined
    : never;
};

export interface ProsperoBookElement
  extends HTMLElement, FlattenUnion<BookProps> {}

export function registerBooksComponent() {
  const tagName = 'prospero-books';

  if (checkEnvironment(tagName)) {
    const props: BooksProps = { books: [structuredClone(defaultBookProps)] };

    customElement(tagName, props, (props) => {
      noShadowDOM();
      return <Books {...props} />;
    });
  }
}

export interface ProsperoBooksElement
  extends HTMLElement, FlattenUnion<BooksProps> {}

export function registerFlexibleBookComponent() {
  const tagName = 'prospero-flexible-book';

  if (checkEnvironment(tagName)) {
    const props: FlexibleBookProps = {
      text: '',
      config: undefined,
      mediaQueryList: [{ pagesShown: 1, containerStyles: {}, pageStyles: {} }],
    };

    customElement(tagName, props, (props: FlexibleBookProps) => {
      noShadowDOM();
      return <FlexibleBook {...props} />;
    });
  }
}

export interface ProsperoFlexibleBookElement
  extends HTMLElement, FlattenUnion<FlexibleBookProps> {}

import type { ComponentProps } from 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'prospero-book': ComponentProps<'div'> & BookProps;
      'prospero-books': ComponentProps<'div'> & BooksProps;
      'prospero-flexible-book': ComponentProps<'div'> & FlexibleBookProps;
    }
  }
}

// ==========================================
// 2. REACT JSX INJECTION (React 19+)
// ==========================================
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'prospero-book': BookProps;
      'prospero-books': BooksProps;
      'prospero-flexible-book': FlexibleBookProps;
    }
  }
}
