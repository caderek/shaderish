import { Vec2, Vec4 } from "./vec.js";
import { pack } from "./fast-util.js";

const DEFAULT_MIN_SIZE = 64; // typical cache line size
const DEFAULT_MAX_SIZE = 1048576; // 1 MB

export class Arena {
  #ptr = 0;
  #locked = false;
  #maxSize;

  #buffer;
  #bytes;

  #resetBytes;

  constructor({ initialSize, maxSize } = {}) {
    const len = initialSize ?? DEFAULT_MIN_SIZE;
    this.#maxSize = maxSize ?? DEFAULT_MAX_SIZE;
    this.#buffer = new ArrayBuffer(len, { maxByteLength: this.#maxSize });
    this.#bytes = new Uint8Array(this.#buffer, 0); // test it if it actually trackes the length of uderlying buffer
  }

  #directAlloc(byteSize) {
    if (this.#locked) {
      throw new Error(
        "Arena is already locked, you can't allocate new values, declare all your vectors/matrices upfront.",
      );
    }
    const requiredBytes = this.#ptr + byteSize;

    if (requiredBytes > this.#buffer.byteLength) {
      this.#resizeBuffer(requiredBytes);
    }

    const ptr = this.#ptr;
    this.#ptr += byteSize;
    return ptr;
  }

  #resizeBuffer(requiredBytes) {
    const newLen = 2 ** Math.ceil(Math.log2(requiredBytes));

    if (newLen <= this.#buffer.maxByteLength) {
      this.#buffer.resize(newLen);
    } else {
      throw new Error(
        `Maximum size (${this.#maxSize} bytes) for the shader vectors and matrices exceeded!`,
      );
    }
  }

  lock() {
    if (this.#locked) {
      throw new Error(
        "Arena is already locked, lock it once, before the shader function, after initial declarations. Do not use `.lock` method inside the shader function.",
      );
    }

    this.#resetBytes = this.#bytes.slice(0, this.#ptr);
    this.#locked = true;
  }

  flush(vec) {
    // @todo Commented out for performance, consider dev version of the lib with this enebled
    // if (!this.#locked) {
    //   throw new Error(
    //     "You have to lock the arena with `.lock()` method before using the `flush` method. Do it once, outside the shader function, after declaring your vectors/matrices.",
    //   );
    // }

    const col = pack(vec[0], vec[1], vec[2], vec[3]);
    this.#bytes.set(this.#resetBytes);
    return col;
  }

  vec2(...args) {
    return Vec2.create(this.#buffer, this.#directAlloc(Vec2.byteSize), ...args);
  }

  vec4(...args) {
    return Vec4.create(this.#buffer, this.#directAlloc(Vec4.byteSize), ...args);
  }

  get ptr() {
    return this.#ptr;
  }

  get size() {
    return this.#buffer.byteLength;
  }

  get buffer() {
    return this.#buffer;
  }
}
