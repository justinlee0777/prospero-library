import { createEffect, createSignal, onCleanup } from 'solid-js';
import {
  MediaQueryListenerFactory,
  MediaQueryPattern,
} from '../../utils/media-query';
import { Book, BookProps } from '../Book';

export interface Props {
  books: [
    BookProps,
    ...Array<{
      config: BookProps;
      media: MediaQueryPattern;
    }>,
  ];
}

export function Books({ books }: Props) {
  let booksElement: HTMLDivElement;

  const [bookIndex, setBookIndex] = createSignal<number>();

  const [, ...conditionalBooks] = books;

  createEffect(() => {
    const destroyListener = MediaQueryListenerFactory.create(
      booksElement!,
      {
        show: () => setBookIndex(0),
        hide: () => {},
      },
      ...conditionalBooks.map((book, i) => ({
        ...book.media,
        show: () => setBookIndex(i + 1),
        hide: () => {},
      })),
    );

    onCleanup(destroyListener);
  });

  return (
    <div ref={booksElement!}>
      {books.map((book, i) => {
        const bookConfig = 'config' in book ? book.config : book;

        const shownIndex = bookIndex();

        return <Book {...bookConfig} hide={shownIndex !== i} />;
      })}
    </div>
  );
}
