import type {
  IPages,
  PagesOutput,
  PagesAsIndicesOutput,
} from '@prospero-library/shared/models.js';

import { HTMLParser } from '../html-parser/index.js';

export class Pages implements IPages {
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

  async get(pageNumber: number): Promise<string | null> {
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

  async getAll(): Promise<Array<string>> {
    const pages: Array<string> = [];

    const generator = this.parser.generatePages(this.text);

    for await (const page of generator) {
      pages.push(page);
    }

    return pages;
  }

  async getData(): Promise<PagesOutput> {
    return {
      pages: await this.getAll(),
    };
  }

  async getDataAsIndices(): Promise<PagesAsIndicesOutput> {
    const stringPages = await this.getAll();

    let text = '';
    let pages: PagesAsIndicesOutput['pages'] = [];

    let index = 0;

    stringPages.forEach((page) => {
      text += page;
      pages.push({
        beginIndex: index,
        endIndex: (index += page.length),
      });
    });

    return {
      text,
      pages,
    };
  }
}
