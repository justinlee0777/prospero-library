import { Token, TokenType } from '../html-tokens.js';

interface Config {
  footnotes?: string;
}

const allowedVoidTags = ['br'];

const voidTags = [
  ...allowedVoidTags,
  'area',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
];

/**
 * Creates tokens out of an HTML string that the HTMLParser consumes.
 */
export class HTMLTokenizer {
  private static allowedVoidTags = allowedVoidTags;
  private static voidTags = voidTags;

  private generator: Generator<Token>;

  private footnotes: Array<Element> = [];

  constructor(text: string, config: Config) {
    const loader = this.loadHTML(text);

    const element = this.getRoot(loader);

    if (config.footnotes) {
      const footnotes = (this.footnotes = [
        ...element.querySelectorAll(config.footnotes),
      ]);

      footnotes.forEach((element) => element.remove());
    }

    this.generator = this.parseHTMLElement(element, config);
  }

  *getTokens(): Generator<Token> {
    yield* this.generator;
  }

  private loadHTML(text: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
  }

  private getRoot(document: Document): HTMLElement {
    return document.body;
  }

  private getOuterHTML(element: HTMLElement): string {
    return element.outerHTML;
  }

  private getText(element: HTMLElement): string {
    return element.textContent ?? '';
  }

  private *parseHTMLElement(
    element: Element,
    config: Config,
  ): Generator<Token> {
    for (const node of element.childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as unknown as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          const closing = !HTMLTokenizer.voidTags.includes(tagName)
            ? `</${tagName}>`
            : undefined;

          const openingPattern = /<[A-Za-z0-9]+.*?\/?>/;

          let footnote: Element | undefined;

          if (this.footnotes.length > 0) {
            const footnoteIdentifier = (element as HTMLAnchorElement).href
              ?.split('#')
              .at(-1);

            if (footnoteIdentifier) {
              footnote = this.footnotes.find((element) =>
                element.matches(`#${footnoteIdentifier}`),
              );
            }
          }

          yield {
            tag: {
              name: tagName,
              opening:
                this.getOuterHTML(element).match(openingPattern)?.at(0) ?? '',
              closing,
            },
            type: TokenType.HTML,
            footnote,
          };

          yield* this.parseHTMLElement(element, config);

          break;
        case 3:
          yield {
            content: this.getText(node as HTMLElement),
            type: TokenType.TEXT,
          };
          break;
      }
    }

    const tagName = element.tagName.toLowerCase();

    if (!HTMLTokenizer.allowedVoidTags.includes(tagName)) {
      yield {
        tagName,
        type: TokenType.END_HTML,
      };
    }
  }
}
