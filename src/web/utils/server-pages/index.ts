import {
  IPages,
  PagesAsIndicesOutput,
  PagesOutput,
} from '@prospero/shared/models';

import { BaseBookProps } from '../../components/Book';

export type BookStyles = Pick<BaseBookProps, 'containerStyles' | 'pageStyles'>;

export default interface PaginatedResponse {
  value: {
    html: boolean;
    bookStyles: BookStyles;
    content: Array<string>;
  };
  page: {
    /** Current page. */
    pageNumber: number;
    /** Size of the page. */
    pageSize: number;
    /** Total pages. */
    pages: number;
    /** Total number of pages. */
    totalSize: number;
  };
}

/**
 * The server which the endpoint belongs to is expected to store the already-paginated data.
 * The code makes the assumption that the server changes its content infrequently, or rather, that the server will
 * not change while this code is ran.
 *
 * Endpoint must follow specification:
 * - Endpoint allows at least two query parameters: pageNumber (beginning at 1) and pageSize
 * - Request body must return PaginatedResponse (see src/components/book/pagined-response.interface.ts)
 *
 * Expected usage:
 * ```
 * const pages = new ServerPages('http://localhost:9292/book-text');
 * ```
 *
 * TODO: Queue up requests reasonably (ex. load up to 50 pages before and after the current page).
 */
export class ServerPages implements IPages {
  public bookStyles: Promise<BookStyles>;

  private readonly pageSize = 10;

  /**
   * Cache of requests made to the backend so there are no duplicates.
   * The key is a string: "${beginning page number}-{ending page number"} ex. 11-20 for pages 11 to 20.
   * The value is a Promise for the HTTP response.
   */
  private readonly requests: Map<string, Promise<PaginatedResponse>> =
    new Map();

  private pages: Array<string> | undefined;

  constructor(private endpoint: string) {
    this.bookStyles = this.initialize();
  }

  /**
   * Fetch pages in batches rather than one at a time, for performance.
   * @param pageNumber
   */
  async get(pageNumber: number) {
    if (pageNumber < 0) {
      return null;
    }

    await this.bookStyles;

    const pages = this.pages!;
    const pageSize = this.pageSize;

    if (pageNumber >= pages.length) {
      return null;
    } else if (!pages[pageNumber]) {
      const beginningIndex = Math.floor(pageNumber / pageSize);
      const batchPageNumber = beginningIndex + 1;

      const { value } = await this.fetch(batchPageNumber, pageSize);

      const pageIndex = beginningIndex * pageSize;
      const size = Math.min(pageSize, value.content.length);
      for (let i = 0; i < size; i++) {
        pages[pageIndex + i] = value.content[i];
      }
    }

    return pages[pageNumber];
  }

  /**
   * This algorithm makes the assumption that the array is populated using only the readonly 'pageSize'.
   * Thus 'pages' can be evenly cut up and we know when certain items have been fetched or not.
   */
  async getAll(): Promise<Array<string>> {
    await this.bookStyles;

    const { pageSize } = this;
    const pages = this.pages!;
    const fetches: Array<Promise<void>> = [];

    let i = 0;
    while (i < pages.length) {
      const beginningIndex = i * pageSize;

      if (!pages[beginningIndex]) {
        const fetch = this.fetch(i, pageSize).then(({ value }) => {
          value.content.forEach((page, j) => {
            pages[beginningIndex + j] = page;
          });
        });

        fetches.push(fetch);
      }
    }

    await Promise.all(fetches);

    return pages;
  }

  async getData(): Promise<PagesOutput> {
    const pages = await this.getAll();

    return { pages };
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

  private async fetch(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse> {
    const requestId = `${pageNumber}-${pageNumber + pageSize}`;

    if (this.requests.has(requestId)) {
      return this.requests.get(requestId)!;
    } else {
      const request = fetch(
        `${this.endpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      ).then((response) => response.json());

      this.requests.set(requestId, request);

      return request;
    }
  }

  /**
   * Gets metadata on the pages.
   */
  private async initialize(): Promise<BookStyles> {
    const { value, page } = await this.fetch(1, 1);

    this.pages = Array(page.totalSize);

    return value.bookStyles;
  }
}
