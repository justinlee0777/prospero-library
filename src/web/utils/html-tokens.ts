/**
 * Text content with information on the HTML tag, if any.
 */
export type Token = TextToken | HTMLToken | EndHTMLToken;

export enum TokenType {
  TEXT,
  HTML,
  END_HTML,
}

export interface TextToken {
  content: string;
  type: TokenType.TEXT;
}

export class HTMLToken {
  type: TokenType.HTML = TokenType.HTML;

  get name(): string {
    return this.element.tagName.toLowerCase();
  }

  get openingTag(): string {
    const { element } = this;

    if (!element.innerHTML) {
      return element.outerHTML;
    }

    const clone = element.cloneNode(false) as HTMLElement;
    const emptyOuter = clone.outerHTML;

    const closingLen = this.closingTag!.length ?? 0;
    return emptyOuter.slice(0, -closingLen);
  }

  get closingTag(): string | undefined {
    const { element } = this;

    if (!element.innerHTML) {
      return;
    }

    const outer = element.outerHTML;
    const tagNameLen = element.tagName.length;

    // A closing tag is always: "</" (2) + tagNameLen + ">" (1) = tagNameLen + 3
    const closingTagLength = tagNameLen + 3;

    return outer.slice(-closingTagLength);
  }

  constructor(public element: HTMLElement) {}
}

/**
 * Denotes the end of an HTML tag.
 */
export interface EndHTMLToken {
  tagName: string;
  type: TokenType.END_HTML;
}
