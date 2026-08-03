import { HTMLTokenizer } from '../html-tokenizer/index.js';
import { TokenType } from '../html-tokens.js';

export interface ParserContext {
  /**
   * Describes an HTML tag found in the text.
   */
  tag?: {
    opening: string;
    name: string;
  };
}

export const dash = '-';

export const whitespace = ' ';

export const newline = '\n';

export class HTMLParser {
  /**
   * Current HTML context to parse text with.
   * The 0th element is the root of the document, which has no enhancements.
   */
  private contexts: Array<ParserContext>;

  /**
   * The last context pushed, which is the current tag worked with.
   */
  private get context(): ParserContext {
    return this.contexts.at(-1)!;
  }

  private tokenExpression: RegExp;

  private currentPageFootnotes: Array<Element> = [];

  constructor(private slate: HTMLElement) {
    this.contexts = [{}];

    /**
     * <token> = <punctuatedWord> | <whitespace> | <newline>
     * <punctuatedWord> = <punctuation> <word> <punctuation>
     * <punctuation> = "!" | "?" ... | ""
     * <word> = alphabetic sequence with at least one character
     * <whitespace> = " -"
     * <newline> = "\n"
     */
    const whitespaceExpression = `${whitespace}|${dash}`;
    const newlineExpression = newline;
    /**
     * 1. As phrases with dashes can be cut by the dash, such that the
     * word preceding contains the dash, we look for "{word without dash}{dash, optionally}"
     */
    const characterExpression = `[^${whitespace}\\${dash}${newline}]+${dash}?`;
    const expressions = [
      `(?<word>${characterExpression})`,
      `(?<whitespace>${whitespaceExpression})`,
      `(?<newline>${newlineExpression})`,
    ];

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');
  }

  async *generateParserStates(text: string): AsyncGenerator<string> {
    const page = this.slate;

    const textElement = document.createElement('div');

    textElement.style.overflowY = 'hidden';

    this.slate.appendChild(textElement);

    const computedStyles = getComputedStyle(page);
    const pageHeight =
      page.clientHeight -
      parseFloat(computedStyles.paddingTop) -
      parseFloat(computedStyles.paddingBottom);

    let pageContent = '';

    const tokenizer = new HTMLTokenizer(text, {
      // footnotes: this.config.footnotes?.footnoteSelector,
    });

    const tokens = tokenizer.getTokens();

    for (const token of tokens) {
      if (token.type === TokenType.TEXT) {
        const textContent = token.content;

        const textTokens = textContent.matchAll(this.tokenExpression);

        for (const textToken of textTokens) {
          const [word] = textToken;

          let newPageContent = pageContent + word;

          const footnotesHTML = this.createFootnotes()?.outerHTML ?? '';
          textElement.innerHTML = newPageContent + footnotesHTML;

          if (textElement.clientHeight >= pageHeight) {
            textElement.innerHTML = pageContent;

            const openingTag = this.getOpeningTag(false);

            newPageContent = `${openingTag}${word}`;

            this.currentPageFootnotes = [];

            yield this.handlePageEnd(textElement.innerHTML + footnotesHTML);
          }

          pageContent = newPageContent;
        }
      } else if (token.type === TokenType.HTML) {
        let newToken: string;

        if (token.footnote) {
          this.currentPageFootnotes.push(token.footnote);
        }

        if (token.tag.closing) {
          const opening = token.tag.opening;
          const tagName = token.tag.name;

          const context = this.createParserContext(opening, tagName);

          this.contexts.push(context);

          // Create an opening tag.
          newToken = this.getOpeningTag();
        } else {
          newToken = token.tag.opening;
        }
        let newPageContent = pageContent + newToken;

        const footnotesHTML = this.createFootnotes()?.outerHTML ?? '';
        textElement.innerHTML = newPageContent + footnotesHTML;

        if (textElement.clientHeight >= pageHeight) {
          // Otherwise, just put everything together.
          textElement.innerHTML = pageContent + footnotesHTML;
          this.currentPageFootnotes = [];

          const openingTag = this.getOpeningTag(false);

          newPageContent = `${openingTag}${newToken}`;

          yield this.handlePageEnd(textElement.innerHTML);
        }

        pageContent = newPageContent;
      } else if (token.type === TokenType.END_HTML) {
        if (this.context.tag?.name === token.tagName) {
          pageContent += this.getClosingTag();

          this.contexts.pop();
        }
      }
    }

    yield pageContent;
  }

  async *generatePages(text: string): AsyncGenerator<string> {
    const parserStates = this.generateParserStates(text);

    for await (const newParserState of parserStates) {
      yield newParserState;
    }
  }

  /**
   * Create the context for a new HTMLParser, using the given tag opening and name.
   * Calculates font and block styles.
   * If the tag is not allowed by the parser i.e. too difficult to parse, it is ignored and the
   * context is treated as pure text content, using the current parser's context.
   */
  private createParserContext(
    tagOpening: string,
    tagName: string,
  ): ParserContext {
    return {
      tag: {
        opening: tagOpening,
        name: tagName,
      },
    };
  }

  /**
   * Gets the opening tag of the current HTML tag or the entire tree.
   * @param last denotes whether to get the current HTML tag or the entire chain.
   */
  private getOpeningTag(last = true): string {
    const contexts = last ? [this.context] : this.contexts.slice();

    return contexts.reduce(
      (tag, context) => (tag += context.tag?.opening ?? ''),
      '',
    );
  }

  /**
   * Gets the closing tag of the current HTML tag or the entire tree.
   * Gets the tags backwards, if the latter.
   * @param last denotes whether to get the current HTML tag or the entire chain.
   */
  private getClosingTag(last = true): string {
    const contexts = last ? [this.context] : this.contexts.slice().reverse();

    return contexts.reduce(
      (tag, context) => (tag += context.tag ? `</${context.tag.name}>` : ''),
      '',
    );
  }

  /**
   * This is a bit of a hack. There's no way currently to inform a child generator that the parent has changed
   * the parser state - for example, to add ending tags at the end of pages or starting tags at the start of new pages.
   * So we are just adding them to every parser state, which is computationally wasteful.
   * @param initialState describes where the parser began.
   * @param newParserState
   */
  private handlePageEnd(pageText: string): string {
    const closingTag = this.getClosingTag(false);

    return pageText + closingTag;
  }

  private createFootnotes(): HTMLElement | undefined {
    if (this.currentPageFootnotes.length === 0) {
      return;
    }

    const footnoteContainer = document.createElement('div');
    footnoteContainer.className = 'footnotes';

    this.currentPageFootnotes.forEach((footnote) => {
      footnoteContainer.appendChild(footnote);
    });

    return footnoteContainer;
  }

  protected convert({
    top = 0,
    right = 0,
    bottom = 0,
    left = 0,
  }: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } = {}): string {
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
}
