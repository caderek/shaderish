const DEFAULT_INITIAL_SIZE = 128; // Two typical cache lines
const DEFAULT_MAXIMUM_SIZE = 2 ** 16; // 64KiB (one wasm page)
const DEFAULT_ALIGNMENT = 8; // 64 bit

class MemoryBlock {
  #base;
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
