declare module '*.css';

import type { ComponentProps } from 'solid-js';
import type {
  BookProps,
  BooksProps,
  FlexibleBookProps,
} from '@prospero-library/web/components';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      // Define your custom element and its custom property types
      'prospero-book': ComponentProps<'div'> & BookProps;
      'prospero-books': ComponentProps<'div'> & BooksProps;
      'prospero-flexible-book': ComponentProps<'div'> & FlexibleBookProps;
    }
  }
}
