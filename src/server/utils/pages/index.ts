import { access, readFile } from 'fs/promises';
import http from 'http';
import path from 'path';
import playwright from 'playwright';
import {
  IPages,
  PagesAsIndicesOutput,
  PagesOutput,
} from '@prospero-library/shared/models.js';
import type { BookProps } from '@prospero-library/web/components';

export type BookStyles = Pick<BookProps, 'containerStyles' | 'pageStyles'>;

/**
 * This is like the most fragile file in the whole library, huh.
 * Mostly because of the lack of type-guarantees. If any of its other Prospero dependencies change, this breaks.
 * I am so tired right now I don't even want to touch the topic of proofing this though.
 */
export class Pages implements IPages {
  private readonly port = 3000;
  private readonly prod = import.meta.env?.PROD ?? false;

  private readonly mimeTypes: Map<string, string> = new Map([
    ['.html', 'text/html'],
    ['.css', 'text/css'],
    ['.js', 'text/javascript'],
  ]);

  private readonly webDir: string;

  constructor(
    private text: string,
    private bookStyles: BookStyles,
  ) {
    const webPath = this.prod
      ? path.join(import.meta.dirname, '../web')
      : '../../../../dist/web';

    this.webDir = path.join(import.meta.dirname, webPath);
  }

  get(pageNumber: number): Promise<string | null> {
    return this.fetchData<[number], string | null>('get', [pageNumber]);
  }

  getAll(): Promise<Array<string>> {
    return this.fetchData<[], Array<string>>('getAll', []);
  }

  getData(): Promise<PagesOutput> {
    return this.fetchData<[], PagesOutput>('getData', []);
  }

  getDataAsIndices(): Promise<PagesAsIndicesOutput> {
    return this.fetchData<[], PagesAsIndicesOutput>('getDataAsIndices', []);
  }

  private async fetchData<Params extends Array<any>, ReturnType>(
    method: string,
    params: Params,
  ): Promise<ReturnType> {
    const server = http.createServer(
      async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const reqUrl = req.url || '/';
        const filePath: string = path.join(
          this.webDir,
          reqUrl === '/' ? 'index.html' : reqUrl,
        );

        const ext: string = path.extname(filePath).toLowerCase();
        const contentType = this.mimeTypes.get(ext);

        if (!(filePath.startsWith(this.webDir) && contentType)) {
          res.statusCode = 403;
          return res.end('Forbidden');
        }

        try {
          await access(filePath);
        } catch {
          res.statusCode = 404;
          res.end('404 Not Found');
          return;
        }

        try {
          const content = await readFile(filePath);

          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } catch {
          res.statusCode = 500;
          res.end(`Server Error`);
        }
      },
    );

    const codeUrl = `http://localhost:${this.port}`;

    server.listen(this.port, () => {
      console.log(`TypeScript asset server running at ${codeUrl}`);
    });

    type Browser = 'chromium' | 'webkit' | 'firefox';

    const browserType: Browser = 'chromium';

    const browser = await playwright[browserType].launch();

    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto(`${codeUrl}/components.js`);

    interface PageData {
      codeUrl: string;
      bookStyles: BookStyles;
      text: string;
      method: string;
      params: Params;
    }

    const pageData: PageData = {
      codeUrl,
      bookStyles: this.bookStyles,
      text: this.text,
      method,
      params,
    };

    const result = await page.evaluate(
      async ({ codeUrl, bookStyles, text, method, params }) => {
        const bookCSSUrl = `${codeUrl}/components/Book/Book.css`;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = bookCSSUrl;
        document.head.appendChild(link);

        const utilsUrl = `${codeUrl}/utils.js`;

        const utilsModule = await import(utilsUrl);

        const Pages = utilsModule.Pages;

        const book = document.createElement('div');

        book.className = 'book';

        Object.assign(book.style, bookStyles.containerStyles);

        const slate = document.createElement('div');

        slate.className = 'slate';

        Object.assign(slate.style, bookStyles.pageStyles);

        book.appendChild(slate);

        document.body.append(book);

        const pages = new Pages(slate, text);

        const data = pages[method](...params);

        return data;
      },
      pageData,
    );

    await page.close();

    await browser.close();

    server.close();

    return result;
  }
}
