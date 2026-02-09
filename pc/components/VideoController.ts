import {
  FRAMEBUFFER_OFFSET,
  FRAMEBUFFER_BYTE_LENGTH,
  TEXT_BUFFER_OFFSET,
  TEXT_BUFFER_BYTE_LENGTH,
  ROM_MAPPING_OFFSET,
} from "../ramLayout";
import { TEXTMODE_FONT_BYTE_LENGTH, TEXTMODE_FONT_OFFSET } from "../romLayout";

const TEXTMODE_COLS = 105;
const TEXTMODE_ROWS = 25;
const TEXTMODE_CELLS = TEXTMODE_COLS * TEXTMODE_ROWS;

const FONT_TEXTURE_HEIGHT = 16;

const FONT_WIDTH = 6;
const FONT_HEIGHT = 14;
const FONT_STRIDE = FONT_WIDTH * FONT_HEIGHT;

const PAD_X = 5;
const PAD_Y = 5;

const TEXT_PIXEL_WIDTH = TEXTMODE_COLS * FONT_WIDTH;

const FRAME_STRIDE = TEXT_PIXEL_WIDTH + PAD_X * 2;

export class VideoController {
  mode: "text" | "graphics" = "text";

  #textBuffer: Uint8Array;
  #frameBufferView: Uint32Array;
  #tempView = new Uint32Array(TEXTMODE_CELLS * FONT_STRIDE);
  #font: Uint32Array;
  #scratchpad = new Uint32Array(FONT_STRIDE);

  constructor(memory: WebAssembly.Memory) {
    this.#textBuffer = new Uint8Array(
      memory.buffer,
      TEXT_BUFFER_OFFSET,
      TEXT_BUFFER_BYTE_LENGTH,
    );

    this.#frameBufferView = new Uint32Array(
      memory.buffer,
      FRAMEBUFFER_OFFSET,
      FRAMEBUFFER_BYTE_LENGTH / 4,
    );

    const memoryFontOffset = ROM_MAPPING_OFFSET + TEXTMODE_FONT_OFFSET;

    this.#font = this.#rasterizeFont(
      new Uint8Array(
        memory.buffer,
        memoryFontOffset,
        TEXTMODE_FONT_BYTE_LENGTH,
      ),
    );
  }

  #rasterizeFont(rawFont: Uint8Array) {
    const font = new Uint32Array(256 * FONT_STRIDE);

    for (let step = 0; step < rawFont.length / FONT_TEXTURE_HEIGHT; step++) {
      for (let row = 0; row < FONT_HEIGHT; row++) {
        const i = step * FONT_TEXTURE_HEIGHT + row;
        const j = step * FONT_STRIDE + row * FONT_WIDTH;
        const val = rawFont[i];

        font[j + 0] = ((val >> 7) & 1) * 0xffffffff;
        font[j + 1] = ((val >> 6) & 1) * 0xffffffff;
        font[j + 2] = ((val >> 5) & 1) * 0xffffffff;
        font[j + 3] = ((val >> 4) & 1) * 0xffffffff;
        font[j + 4] = ((val >> 3) & 1) * 0xffffffff;
        font[j + 5] = ((val >> 2) & 1) * 0xffffffff;
      }
    }

    return font;
  }

  draw() {
    for (let i = 0, cell = 0; i < TEXTMODE_CELLS * 2; i += 2, cell++) {
      const char = this.#textBuffer[i];
      const style = this.#textBuffer[i + 1];
      const fg = style >> 4;
      const bg = (style >> 1) & 0b111;
      const alt = style & 0b1;
      const glyphPos = char + 128 * alt;
      const glyphOffset = glyphPos * FONT_STRIDE;

      // @todo optimize it to not create any objects, jsut write directly
      const source = new Uint32Array(
        this.#font.buffer,
        glyphOffset * 4,
        FONT_STRIDE,
      );

      const fgColor = 0xffb2dbeb;
      const bgColor = 0xff282828;

      for (let x = 0; x < source.length; x++) {
        const mask = source[x];
        this.#scratchpad[x] = (mask & fgColor) | (~mask & bgColor);
      }

      this.#tempView.set(this.#scratchpad, cell * FONT_STRIDE);
    }

    for (let tile = 0; tile < TEXTMODE_CELLS; tile++) {
      const tileX = tile % TEXTMODE_COLS;
      const tileY = (tile / TEXTMODE_COLS) | 0;

      for (let row = 0; row < FONT_HEIGHT; row++) {
        const srcBase = tile * FONT_STRIDE + row * FONT_WIDTH;

        const source = this.#tempView.subarray(srcBase, srcBase + FONT_WIDTH);
        const framePixelX = PAD_X + tileX * FONT_WIDTH;
        const framePixelY = PAD_Y + tileY * FONT_HEIGHT + row;
        const offset = framePixelY * FRAME_STRIDE + framePixelX;

        this.#frameBufferView.set(source, offset);
      }
    }
  }
}
