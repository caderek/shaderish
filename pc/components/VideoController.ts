import {
  FRAMEBUFFER_OFFSET,
  FRAMEBUFFER_SIZE,
  TEXT_BUFFER_OFFSET,
  TEXT_BUFFER_SIZE,
} from "../ramLayout";

class VideoController {
  #textBuffer: Uint8Array;
  #frameBuffer: Uint8ClampedArray;

  constructor(memory: WebAssembly.Memory) {
    this.#textBuffer = new Uint8Array(
      memory.buffer,
      TEXT_BUFFER_OFFSET,
      TEXT_BUFFER_SIZE,
    );

    this.#frameBuffer = new Uint8ClampedArray(
      memory.buffer,
      FRAMEBUFFER_OFFSET,
      FRAMEBUFFER_SIZE,
    );
  }
}
