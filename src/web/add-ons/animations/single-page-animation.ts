import { BookAnimation } from './models.js';

interface Config {
  milliseconds: number;
}

/**
 * Animation for single-paged books.
 */
export class SinglePageBookAnimation implements BookAnimation {
  private milliseconds: number;
  private pageNumber = 0;

  constructor({ milliseconds }: Config = { milliseconds: 500 }) {
    this.milliseconds = milliseconds;
  }

  async changePage(
    pageNumber: number,
    oldPages: Array<HTMLElement>,
  ): Promise<void> {
    const animatingClass = 'singlePageAnimating';

    // Initial state of the animated page.
    const transform = ['skewY(0) translateX(0) scaleX(1)'];

    if (this.pageNumber < pageNumber) {
      // If the page number is greater, slant and animate the page left as if someone were pulling it.
      transform.push('skewY(-30deg) translateX(-100%) scaleX(.5)');
    } else {
      // If the page number is greater, slant and animate the page right as if someone were pulling it.
      transform.push('skewY(30deg) translateX(100%) scaleX(.5)');
    }

    // Updating the page number before the animation has pages can be rapidly flipped.
    this.pageNumber = pageNumber;

    for (const page of oldPages) {
      page.style.transformOrigin = 'top left';
    }

    // Do not animate pages that are currently animating.
    oldPages = oldPages.filter(
      (page) => !page.classList.contains(animatingClass),
    );

    await Promise.all(
      oldPages.map((page) => {
        page.classList.add(animatingClass);
        return page.animate({ transform }, this.milliseconds).finished;
      }),
    );
  }
}
