export interface BookAnimation {
  /**
   * Animate changing the page.
   * The method needs to handle removing the pages from the DOM, as the module may need
   * that much power for its animations.
   * @param book element for adding/removing elements.
   * @param pageNumber being changed to.
   * @param oldPages elements that need to be deleted by the end of the method.
   */
  changePage(
    pageNumber: number,
    oldPages: Array<HTMLElement>,
    underPages: Array<HTMLElement>,
  ): Promise<void>;
}
