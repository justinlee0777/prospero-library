import { HTMLToken, Token, TokenType } from '../html-tokens.js';

const allowedVoidTags = ['br'];

/**
 * Creates tokens out of an HTML string that the HTMLParser consumes.
 */
export class HTMLTokenizer {
  private static allowedVoidTags = allowedVoidTags;

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

  private getText(element: HTMLElement): string {
    return element.textContent ?? '';
  }

  private *parseHTMLElement(element: Element): Generator<Token> {
    for (const node of element.childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as unknown as HTMLElement;

          yield new HTMLToken(element);

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
