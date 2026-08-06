import './double-page-animation.css';

import { BookAnimation } from './models.js';

interface Config {
  milliseconds: number;
}

/**
 * Animation for double-paged books.
 */
export class DoublePageBookAnimation implements BookAnimation {
  private milliseconds: number;
  private pageNumber = 0;

  constructor({ milliseconds }: Config = { milliseconds: 500 }) {
    this.milliseconds = milliseconds;
  }

  async changePage(
    pageNumber: number,
    oldPages: Array<HTMLElement>,
    newPages: Array<HTMLElement>,
  ): Promise<void> {
    // Do not animate if there are no pages to delete.
    if (oldPages.length === 0) {
      return;
    }

    /*
     * We're only animating the last two pages
     * (we know this, as pages are prepended so the oldest pages are at the top of the queue).
     */
    const oldLeftPage = oldPages.at(0),
      oldRightPage = oldPages.at(1);

    const leftPage = newPages.at(0),
      rightPage = newPages.at(1);

    let overPage: HTMLElement | undefined; // Always a page to-be-removed. This starts visible then is flipped invisible.
    let underPage: HTMLElement | undefined; // Always a new page. Start invisible then is flipped visible.

    // Below classes describe whether the page is a right or left page.
    let overPageClass: string;
    let underPageClass: string;

    // The transformation for the over page. (Under page is always animated to its final position.)
    let overPageTransforming: string;

    if (this.pageNumber < pageNumber) {
      // If the page is incremented, we're flipping the right page.
      overPage = oldRightPage;
      underPage = leftPage;

      overPageClass = 'rightPage';
      underPageClass = 'leftPage';

      overPageTransforming = 'rotateY(180deg)';
    } else {
      // If the page is decremented, we're flipping the left page.
      overPage = oldLeftPage;
      underPage = rightPage;

      overPageClass = 'leftPage';
      underPageClass = 'rightPage';

      overPageTransforming = 'rotateY(-180deg)';
    }

    // If the over page is currently animated, do not send another command for animation.
    const isOverPageAnimating = overPage?.classList.contains(
      'doublePageAnimating',
    );

    // Add the classes to the pages so that they are initialized with their property transform properties.
    overPage?.classList.add('doublePageAnimating', overPageClass);
    underPage?.classList.add(
      'doublePageAnimating',
      underPageClass,
      'unveiling',
    );

    // Flip the under page.
    const animations = [
      underPage?.animate(
        {
          transform: ['rotateY(0)'],
          zIndex: String(oldPages.length * 10),
        },
        this.milliseconds,
      ).finished,
    ];

    if (!isOverPageAnimating) {
      // Flip the over page.
      animations.push(
        overPage?.animate(
          {
            transform: ['rotateY(180deg)'],
          },
          this.milliseconds,
        ).finished,
      );
    }

    // Update the page number for future animations, as pages can be rapidly flipped.
    this.pageNumber = pageNumber;

    await Promise.all(animations);

    // Reset the under page's state; work is done.
    underPage?.classList.remove(
      'doublePageAnimating',
      underPageClass,
      'unveiling',
    );
  }
}
