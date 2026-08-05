import { Token, TokenType } from '../html-tokens.js';

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

  constructor(text: string) {
    const loader = this.loadHTML(text);

    const element = this.getRoot(loader);

    this.generator = this.parseHTMLElement(element);
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

  private *parseHTMLElement(element: Element): Generator<Token> {
    for (const node of element.childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as unknown as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          const closing = !HTMLTokenizer.voidTags.includes(tagName)
            ? `</${tagName}>`
            : undefined;

          const openingPattern = /<[A-Za-z0-9]+.*?\/?>/;

          yield {
            tag: {
              name: tagName,
              opening:
                this.getOuterHTML(element).match(openingPattern)?.at(0) ?? '',
              closing,
            },
            type: TokenType.HTML,
          };

          yield* this.parseHTMLElement(element);

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
