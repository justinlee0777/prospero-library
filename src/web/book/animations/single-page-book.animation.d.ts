import PageElement from '../../page/page-element.interface';
import BookAnimation, { BookAnimationInit } from '../book-animation.interface';
import BookElement from '../book-element.interface';
interface Config {
    milliseconds: number;
}
/**
 * Animation for single-paged books.
 */
export default class SinglePageBookAnimation implements BookAnimation {
    private milliseconds;
    private pageNumber;
    constructor({ milliseconds }?: Config);
    initialize({ pageNumber }: BookAnimationInit): void;
    changePage(book: BookElement, pageNumber: number, oldPages: Array<PageElement>, [page]: [PageElement]): Promise<void>;
}
export {};
//# sourceMappingURL=single-page-book.animation.d.ts.map