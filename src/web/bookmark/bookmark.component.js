import styles from './bookmark.module.css';
import div from '../../elements/div.function';
import merge from '../../utils/merge.function';
const BookmarkComponent = (storage, elementConfig = {}) => {
    const bookmarkContent = div({
        classnames: [styles.bookmarkContent],
    });
    const bookmark = div(merge({
        classnames: [styles.bookmark],
        children: [bookmarkContent],
    }, elementConfig));
    bookmark.tabIndex = 0;
    async function saveBookmark(event) {
        event.stopPropagation();
        const pageNumber = bookmark.pagenumber;
        if (pageNumber) {
            storage.save({
                pageNumber,
            });
            updatePageNumber();
            bookmark.classList.add(styles.bookmarkActivated);
            await new Promise((resolve) => setTimeout(resolve, 300));
            bookmark.classList.remove(styles.bookmarkActivated);
        }
    }
    bookmark.addEventListener('click', saveBookmark);
    function updatePageNumber() {
        // Page number is 0th based but the client is 1-based. Therefore offset by 1.
        bookmarkContent.textContent = (bookmark.pagenumber + 1).toString();
    }
    let onbookmarkretrieval;
    Object.defineProperty(bookmark, 'onbookmarkretrieval', {
        get() {
            return onbookmarkretrieval;
        },
        set(callback) {
            onbookmarkretrieval = callback;
            if (bookmark.pagenumber) {
                onbookmarkretrieval?.({ pageNumber: bookmark.pagenumber });
            }
        },
    });
    bookmark.prospero = {
        type: 'bookmark',
        destroy: () => {
            bookmark.removeEventListener('click', saveBookmark);
            bookmark.remove();
        },
    };
    Promise.resolve(storage.get()).then((bookmarkData) => {
        if (bookmarkData) {
            const { pageNumber } = bookmarkData;
            bookmark.pagenumber = pageNumber;
            updatePageNumber();
            onbookmarkretrieval?.(bookmarkData);
        }
    });
    return bookmark;
};
export default BookmarkComponent;
