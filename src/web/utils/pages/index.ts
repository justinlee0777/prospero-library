import type {
  IPages,
  PagesOutput,
  PagesAsIndicesOutput,
} from '@prospero-library/shared/models.js';

import { HTMLParser } from '../html-parser/index.js';

export class Pages implements IPages {
  /**
   * @returns undefined when not done yet.
   */
  get pagesLength(): number | undefined {
    if (this.done) {
      return this.cachedPages.length;
    } else {
      return;
    }
  }

  private cachedPages: Array<string> = [];

  private done = false;

  constructor(
    slate: HTMLElement,
    private text: string,
  ) {
    (async () => {
      const parser = new HTMLParser(slate);

      const generator = parser.generatePages(this.text);

      let generatorResult = await generator.next();

      let i = 0;

      while (!generatorResult.done) {
        this.cachedPages.push(generatorResult.value);

        await this.cedeToMainThread();

        generatorResult = await generator.next();
        i++;
      }

      this.done = true;
    })();
  }

  async get(pageNumber: number): Promise<string | null> {
    let page = this.cachedPages.at(pageNumber);

    while (!(page || this.done)) {
      await this.cedeToMainThread();

      page = this.cachedPages.at(pageNumber);
    }

    return page ?? null;
  }

  async getAll(): Promise<Array<string>> {
    const pages: Array<string> = [];

    let page = await this.get(0);

    let i = 0;

    while (page) {
      pages.push(page);

      page = await this.get(++i);
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

  private async cedeToMainThread() {
    if ('scheduler' in window) {
      await scheduler.yield();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
