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
  static async *generateParserStates(
    slate: HTMLElement,
    text: string,
  ): AsyncGenerator<string> {
    /**
     * Current HTML context to parse text with.
     * The 0th element is the root of the document, which has no enhancements.
     */
    const contexts: Array<ParserContext> = [{}];

    /**
     * The last context pushed, which is the current tag worked with.
     */

    const context: () => ParserContext = () => contexts.at(-1)!;

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

    const tokenExpression = new RegExp(expressions.join('|'), 'g');

    /**
     * Gets the opening tag of the current HTML tag or the entire tree.
     * @param last denotes whether to get the current HTML tag or the entire chain.
     */
    function getOpeningTag(last = true): string {
      const newContexts = last ? [context()] : contexts.slice();

      return newContexts.reduce(
        (tag, context) => (tag += context.tag?.opening ?? ''),
        '',
      );
    }

    /**
     * Gets the closing tag of the current HTML tag or the entire tree.
     * Gets the tags backwards, if the latter.
     * @param last denotes whether to get the current HTML tag or the entire chain.
     */
    function getClosingTag(last = true): string {
      const newContexts = last ? [context()] : contexts.slice().reverse();

      return newContexts.reduce(
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
    function handlePageEnd(pageText: string): string {
      const closingTag = getClosingTag(false);

      return pageText + closingTag;
    }

    const page = slate;

    const textElement = document.createElement('div');

    textElement.style.overflowY = 'hidden';

    slate.appendChild(textElement);

    const computedStyles = getComputedStyle(page);
    const pageHeight =
      page.clientHeight -
      parseFloat(computedStyles.paddingTop) -
      parseFloat(computedStyles.paddingBottom);

    let pageContent = '';

    const tokenizer = new HTMLTokenizer(text);

    const tokens = tokenizer.getTokens();

    for (const token of tokens) {
      if (token.type === TokenType.TEXT) {
        const textContent = token.content;

        const textTokens = textContent.matchAll(tokenExpression);

        for (const textToken of textTokens) {
          const [word] = textToken;

          let newPageContent = pageContent + word;

          textElement.innerHTML = newPageContent;

          if (textElement.clientHeight >= pageHeight) {
            textElement.innerHTML = pageContent;

            const openingTag = getOpeningTag(false);

            newPageContent = `${openingTag}${word}`;

            yield handlePageEnd(textElement.innerHTML);
          }

          pageContent = newPageContent;
        }
      } else if (token.type === TokenType.HTML) {
        let newToken: string;

        if (token.tag.closing) {
          const opening = token.tag.opening;
          const tagName = token.tag.name;

          const context = this.createParserContext(opening, tagName);

          contexts.push(context);

          // Create an opening tag.
          newToken = getOpeningTag();
        } else {
          newToken = token.tag.opening;
        }
        let newPageContent = pageContent + newToken;

        textElement.innerHTML = newPageContent;

        if (textElement.clientHeight >= pageHeight) {
          // Otherwise, just put everything together.
          textElement.innerHTML = pageContent;

          const openingTag = getOpeningTag(false);

          newPageContent = `${openingTag}${newToken}`;

          yield handlePageEnd(textElement.innerHTML);
        }

        pageContent = newPageContent;
      } else if (token.type === TokenType.END_HTML) {
        if (context().tag?.name === token.tagName) {
          pageContent += getClosingTag();

          contexts.pop();
        }
      }
    }

    yield pageContent;
  }

  static async *generatePages(
    slate: HTMLElement,
    text: string,
  ): AsyncGenerator<string> {
    const parserStates = this.generateParserStates(slate, text);

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
  private static createParserContext(
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
}
