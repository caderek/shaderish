import {
  FRAMEBUFFER_OFFSET,
  FRAMEBUFFER_BYTE_LENGTH,
  TEXT_BUFFER_OFFSET,
  TEXT_BUFFER_BYTE_LENGTH,
  ROM_MAPPING_OFFSET,
} from "../ramLayout";
import { TEXTMODE_FONT_BYTE_LENGTH, TEXTMODE_FONT_OFFSET } from "../romLayout";

export class VideoController {
  mode: "text" | "graphics" = "text";
  #textBuffer: Uint8Array;
  #frameBuffer: Uint8ClampedArray;
  #font: Uint8Array;

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

    const memoryFontOffset = ROM_MAPPING_OFFSET + TEXTMODE_FONT_OFFSET;

    this.#font = new Uint8Array(
      memory.buffer,
      memoryFontOffset,
      TEXTMODE_FONT_BYTE_LENGTH,
    );
  }

  draw() {
    for (let i = 0; i < 105 * 25 * 2; i += 2) {
      const char = this.#textBuffer[i];
      const style = this.#textBuffer[i + 1];
      const fg = style >> 4;
      const bg = (style >> 1) & 0b111;
      const alt = style & 0b1;

      console.log({ char, fg, bg, alt });
    }
  }
}
