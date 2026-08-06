import { HTMLTokenizer } from '../html-tokenizer/index.js';
import { HTMLToken, TokenType } from '../html-tokens.js';

export class ParserContexts {
  contexts: Array<HTMLToken> = [];

  get currentContext(): HTMLToken | undefined {
    return this.contexts.at(-1);
  }

  getOpeningTag(): string | undefined {
    return this.currentContext?.openingTag;
  }

  getFullOpeningTagForNewPage(): string {
    return this.contexts.reduce(
      (tag, context) => (tag += context.openingTag ?? ''),
      '',
    );
  }

  getClosingTag(): string | undefined {
    return this.currentContext?.closingTag;
  }

  markAsFragmented() {
    for (const context of this.contexts) {
      context.element.classList.add('prospero--fragment');
    }
  }
}

const dash = '-';

const whitespace = ' ';

const newline = '\n';

export class HTMLParser {
  static async *generateParserStates(
    slate: HTMLElement,
    text: string,
  ): AsyncGenerator<string> {
    const contexts = new ParserContexts();

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

    let textAdded = false;

    function* handleChange(token: string) {
      let newPageContent = pageContent + token;

      textElement.innerHTML = newPageContent;

      if (textElement.clientHeight >= pageHeight) {
        textElement.innerHTML = pageContent;

        /*
         * TODO: This is problematic. Simply because text has not been added does not mean the _every_ tag is not
         * a fragment. This probably only works for simple trees that are maybe only 1 or 2 deep.
         * A more lasting solution is needed.
         */
        if (textAdded) {
          // Need to notify the client the current element is a fragment, cut off from a previous page.
          contexts.markAsFragmented();
        }

        const openingTag = contexts.getFullOpeningTagForNewPage();

        newPageContent = `${openingTag}${token}`;

        yield textElement.innerHTML;
      }

      pageContent = newPageContent;
    }

    for (const token of tokens) {
      if (token.type === TokenType.TEXT) {
        // Need to guarantee some text was used from a tag before appending the "fragment" class
        const textContent = token.content;

        const textTokens = textContent.matchAll(tokenExpression);

        for (const textToken of textTokens) {
          const [word] = textToken;

          yield* handleChange(word);

          textAdded = true;
        }

        textAdded = false;
      } else if (token.type === TokenType.HTML) {
        let newToken: string;

        if (token.closingTag) {
          contexts.contexts.push(token);

          newToken = contexts.getOpeningTag() ?? '';
        } else {
          newToken = token.openingTag;
        }
        yield* handleChange(newToken);
      } else if (token.type === TokenType.END_HTML) {
        if (contexts.currentContext?.name === token.tagName) {
          pageContent += contexts.getClosingTag();

          contexts.contexts.pop();
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
}
