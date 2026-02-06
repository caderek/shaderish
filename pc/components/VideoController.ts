import {
  FRAMEBUFFER_OFFSET,
  FRAMEBUFFER_BYTE_LENGTH,
  TEXT_BUFFER_OFFSET,
  TEXT_BUFFER_BYTE_LENGTH,
} from "../ramLayout";

class VideoController {
  #textBuffer: Uint8Array;
  #frameBuffer: Uint8ClampedArray;
  #font: Uint8Array;
  #fontBold: Uint8Array;

  constructor(memory: WebAssembly.Memory) {
    this.#textBuffer = new Uint8Array(
      memory.buffer,
      TEXT_BUFFER_OFFSET,
      TEXT_BUFFER_BYTE_LENGTH,
    );

    this.#frameBuffer = new Uint8ClampedArray(
      memory.buffer,
      FRAMEBUFFER_OFFSET,
      FRAMEBUFFER_BYTE_LENGTH,
    );
  }
}
