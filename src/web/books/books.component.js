import div from '../../elements/div.function';
import MediaQueryListenerFactory from '../media-query/media-query-listener.factory';
/**
 * Sets up media query listener based on the BookComponent added to it on initialization.
 * BookComponents without media are considered fallback. If multiple components do not have media, the first one is
 * chosen as fallback and the rest are discarded.
 * @throws if there is no fallback
 */
const BooksComponent = (config) => {
    const children = config?.children ?? [];
    const books = children.filter((child) => 'prospero' in child &&
        typeof child.prospero === 'object' &&
        child.prospero !== null &&
        'type' in child.prospero &&
        child.prospero.type === 'book');
    const fallbacks = books.filter((book) => !Boolean(book.media));
    const [fallback, ...unusedFallbacks] = fallbacks;
    if (!fallback) {
        throw new Error(`BooksComponent could not be created. There must be one fallback Book (does not have a 'media' attribute defined).`);
    }
    // Hide unused books.
    unusedFallbacks.forEach((book) => {
        bookVisibilityState(book).hide();
    });
    const booksForSpecificMedia = books.filter((book) => Boolean(book.media));
    const renderedBooks = booksForSpecificMedia.map((book) => ({
        ...book.media,
        ...bookVisibilityState(book),
    }));
    const destroyMediaQueryListener = MediaQueryListenerFactory.create(bookVisibilityState(fallback), ...renderedBooks);
    const booksElement = div(config);
    booksElement.prospero = {
        type: 'books',
        destroy: () => {
            booksElement.remove();
            destroyMediaQueryListener();
            /** Destroy books for client. */
            books.forEach((book) => book.prospero.destroy());
        },
    };
    return booksElement;
};
function bookVisibilityState(book) {
    const fn = (state) => {
        book.style.display = state ? 'block' : 'none';
        book.ariaHidden = String(!state);
    };
    return {
        show: () => fn(true),
        hide: () => fn(false),
    };
}
export default BooksComponent;
