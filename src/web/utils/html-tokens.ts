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

export interface HTMLToken {
  /** Information on the tag if the text is nested in an HTML tag. */
  tag: {
    name: string;
    opening: string;
    closing?: string;
  };
  type: TokenType.HTML;
}

/**
 * Denotes the end of an HTML tag.
 */
export interface EndHTMLToken {
  tagName: string;
  type: TokenType.END_HTML;
}
