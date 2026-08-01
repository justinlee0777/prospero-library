import { HTMLParser } from '../html-parser';

export class Pages {
  private parser: HTMLParser;
  private cachedPages: Array<string> = [];
  private generator: AsyncGenerator<string> | undefined;
  private lastGeneratorResult: IteratorResult<string> | undefined;

  constructor(
    slate: HTMLElement,
    private text: string,
  ) {
    this.parser = new HTMLParser(slate);
  }

  async get(pageNumber: number) {
    const difference = pageNumber - (this.cachedPages.length - 1);

    if (difference < 0) {
      return this.cachedPages[pageNumber];
    } else if (this.lastGeneratorResult?.done) {
      return this.cachedPages[pageNumber] || null;
    } else {
      const newPages: Array<string> = [];
      let i = 0;
      while (i < difference) {
        if (!this.generator) {
          this.generator = this.parser.generatePages(this.text);
        }

        this.lastGeneratorResult = await this.generator.next();

        if (this.lastGeneratorResult.done) {
          break;
        } else {
          newPages.push(this.lastGeneratorResult.value);
          i++;
        }
      }

      this.cachedPages.push(...newPages);

      return this.cachedPages[pageNumber] || null;
    }
  }
}
