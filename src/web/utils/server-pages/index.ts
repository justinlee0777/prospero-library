import {
  IPages,
  PagesAsIndicesOutput,
  PagesOutput,
} from '@prospero-library/shared/models.js';

import type { BaseBookProps } from '../../components/Book/index.jsx';
import { fetchWithRetry } from './fetch-with-try.js';

export type BookStyles = Pick<BaseBookProps, 'containerStyles' | 'pageStyles'>;

export default interface PaginatedResponse {
  value: {
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
 */
export class ServerPages implements IPages {
  public bookStyles: Promise<BookStyles>;

  private readonly pageSize: number = 10;

  /** Load N pages before and after. */
  private readonly loadAhead = 2;

  /**
   * Cache of requests made to the backend so there are no duplicates.
   * The key is a string: "${beginning page number}-{ending page number"} ex. 11-20 for pages 11 to 20.
   * The value is a Promise for the HTTP response.
   */
  private readonly requests: Map<string, Promise<PaginatedResponse>> =
    new Map();

  private pagesMetadata: PaginatedResponse['page'] | undefined;

  constructor(private endpoint: string) {
    this.bookStyles = this.initialize();
  }

  /**
   * Fetch pages in batches rather than one at a time, for performance.
   * @param pageNumber
   */
  async get(pageNumber: number): Promise<string | null> {
    if (pageNumber < 0) {
      return null;
    }

    await this.bookStyles;

    const pageSize = this.pageSize;

    if (pageNumber >= this.pagesMetadata!.pages) {
      return null;
    }

    let page = await this.getPage(pageNumber);

    if (!page) {
      const batchPageNumber = this.getBatchPageNumber(pageNumber);

      await this.fetch(batchPageNumber, pageSize);

      page = await this.getPage(pageNumber);
    }

    return page;
  }

  /**
   * This algorithm makes the assumption that the array is populated using only the readonly 'pageSize'.
   * Thus 'pages' can be evenly cut up and we know when certain items have been fetched or not.
   */
  async getAll(): Promise<Array<string>> {
    await this.bookStyles;

    const { pageSize } = this;
    const fetches: Array<Promise<PaginatedResponse>> = [];

    for (let i = 0; i < this.pagesMetadata!.pages; i += this.pageSize) {
      const fetch = this.fetch(i, pageSize);

      fetches.push(fetch);
    }

    const paginatedResponses = await Promise.all(fetches);

    return paginatedResponses.reduce((acc, response) => {
      return acc.concat(response.value.content);
    }, [] as Array<string>);
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
    const requestId = this.getRequestId(pageNumber, pageSize);

    if (this.requests.has(requestId)) {
      return this.requests.get(requestId)!;
    } else {
      const request = fetchWithRetry(
        `${this.endpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      ).then((response) => response.json());

      this.requests.set(requestId, request);

      return request;
    }
  }

  private async getPage(pageNumber: number): Promise<string | null> {
    const batchPageNumber = this.getBatchPageNumber(pageNumber);
    const requestId = this.getRequestId(batchPageNumber);

    const request = this.requests.get(requestId);

    setTimeout(() => this.loadPagesAhead(batchPageNumber), 300);

    if (request) {
      const response = await request;

      return response.value.content[pageNumber % this.pageSize!];
    } else {
      return null;
    }
  }

  /**
   * Gets metadata on the pages.
   */
  private async initialize(): Promise<BookStyles> {
    const { value, page } = await this.fetch(1, 1);

    this.pagesMetadata = page;

    return value.bookStyles;
  }

  private getBatchPageNumber(
    pageNumber: number,
    pageSize = this.pageSize,
  ): number {
    const beginningIndex = Math.floor(pageNumber / pageSize);
    return beginningIndex + 1;
  }

  private getRequestId(pageNumber: number, pageSize = this.pageSize): string {
    return `${pageNumber}-${pageSize}`;
  }

  private async loadPagesAhead(pageNumber: number) {
    await this.bookStyles;

    const before = Math.max(pageNumber - this.loadAhead, 0),
      after = Math.min(
        pageNumber + this.loadAhead,
        this.pagesMetadata!.totalSize,
      );

    for (let i = before; i <= after; i++) {
      this.fetch(i, this.pageSize);
    }
  }
}
