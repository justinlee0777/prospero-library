export interface NewlineTransformerOptions {
  /** The number of newlines that start a section. */
  beginningSections?: number;
  /** The number of newlines between paragraphs. Default is 1. */
  betweenParagraphs?: number;
}

/**
 * Add newlines between paragraphs if there are none.
 */
export class NewlineTransformer {
  constructor(private options: NewlineTransformerOptions = {}) {}

  transform(text: string): string {
    const sectionBeginning = this.createNewlines(
      this.options?.beginningSections ?? 0,
    );
    const betweenParagraphs = this.createNewlines(
      this.options?.betweenParagraphs ?? 1,
    );

    // Skip the first HTML tag encountered. We will use the "beginningSections" config instead.
    let sectionBegan = false;

    const parser = new DOMParser();

    const document = parser.parseFromString(text, 'text/html');

    const childNodes = document.body.childNodes;

    let newText = '';

    for (const node of childNodes) {
      const spaces = sectionBegan ? betweenParagraphs : sectionBeginning;

      switch (node.nodeType) {
        case 1:
          const element = node as HTMLElement;

          element.innerHTML = `${spaces}${element.innerHTML}`;

          newText += element.outerHTML;
          break;
        case 3:
          const paragraphs: Array<string> = [];

          for (const paragraph of (node.textContent ?? '').split('\n')) {
            if (!sectionBegan) {
              paragraphs.push(`${sectionBeginning}${paragraph}`);
              sectionBegan = true;
            } else {
              paragraphs.push(`${betweenParagraphs}${paragraph}`);
            }
          }

          newText += paragraphs.join('\n');
          break;
      }

      sectionBegan = true;
    }

    return newText;
  }

  eject(): ConstructorParameters<typeof NewlineTransformer> {
    return [this.options];
  }

  private createNewlines(number: number): string {
    return Array(number).fill('\n').join('');
  }
}
