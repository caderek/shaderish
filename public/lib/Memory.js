// One WASM page equals 64KiB
const DEFAULT_INITIAL_PAGES = 2 ** 10; // 64MiB
const DEFAULT_MAXIMUM_PAGES = 2 ** 14; // 1GiB
const DEFAULT_ALIGNMENT = 8; // 64 bit

class Memory {
  #pointer = 0;
  #memory;
  #alignment;

  cosntructor({ initial, maximum, shared, alignment } = {}) {
    initial ??= DEFAULT_INITIAL_PAGES;
    maximum ??= DEFAULT_MAXIMUM_PAGES;
    shared ??= false;
    alignment ??= 8;

    this.#memory = new WebAssembly.Memory({ initial, maximum, shared });
  }

  alloc(bytes) {
    const pointer = this.#pointer;
    this.#pointer += bytes;
    return pointer;
  }

  get buffer() {
    return this.#memory.buffer;
  }
}
