export interface PagesOutput {
  pages: Array<string>;
}

export interface PagesAsIndicesOutput {
  /**
   * This is the transformed text, not the the original.
   */
  text: string;
  pages: Array<{
    beginIndex: number;
    /** Exclusive. */
    endIndex: number;
  }>;
}

export interface IPages {
  get(pageNumber: number): Promise<string | null>;

  getAll(): Promise<Array<string>>;

  /**
   * @returns a JS object that is compatable with the structured clone algorithm. This behavior will be unit tested.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  getData(): Promise<PagesOutput>;

  /**
   * @returns a JS object that is compatable with the structured clone algorithm. This behavior will be unit tested.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  getDataAsIndices(): Promise<PagesAsIndicesOutput>;
}
