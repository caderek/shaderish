export class RAM {
  #totalPages: number;
  #usedPages: number = 0;

  constructor(totalPages: number) {
    this.#totalPages = totalPages;
  }

  reserve(initial: number, maximum: number, shared: boolean) {
    if (this.#usedPages + initial > this.#totalPages) {
      return null;
    }

    return new WebAssembly.Memory({
      initial,
      maximum,
      shared,
    });
  }
}
