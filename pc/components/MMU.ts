import { RAM } from "./RAM";

export class MMU {
  #ram: RAM;

  constructor(ram: RAM) {
    this.#ram = ram;
  }

  reserve(initial: number, maximum: number) {
    const memory = this.#ram.reserve(initial, maximum, false);

    if (memory === null) {
      throw new Error("Out of memory");
    }

    return memory;
  }

  reserveFixed(pages: number) {
    const memory = this.#ram.reserve(pages, pages, false);
  }

  reserveShared(pages: number) {
    const memory = this.#ram.reserve(pages, pages, true);
  }
}
