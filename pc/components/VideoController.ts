import {
  FRAMEBUFFER_OFFSET,
  FRAMEBUFFER_BYTE_LENGTH,
  TEXT_BUFFER_OFFSET,
  TEXT_BUFFER_BYTE_LENGTH,
  ROM_MAPPING_OFFSET,
} from "../ramLayout";
import {
  PALETTES_BYTE_LENGTH,
  PALETTES_OFFSET,
  TEXTMODE_FONT_BYTE_LENGTH,
  TEXTMODE_FONT_OFFSET,
} from "../romLayout";

const TEXTMODE_COLS = 106;
const TEXTMODE_ROWS = 24;
const TEXTMODE_CELLS = TEXTMODE_COLS * TEXTMODE_ROWS;
const FONT_TEXTURE_HEIGHT = 16;
const FONT_WIDTH = 6;
const FONT_HEIGHT = 15;
const FONT_STRIDE = FONT_WIDTH * FONT_HEIGHT;
const PAD_X = 2;
const PAD_Y = 0;
const TEXT_PIXEL_WIDTH = TEXTMODE_COLS * FONT_WIDTH;
const FRAME_STRIDE = TEXT_PIXEL_WIDTH + PAD_X * 2;

export class VideoController {
  mode: "text" | "graphics" = "text";

  #textBuffer: Uint8Array;
  #frameBufferView: Uint32Array;
  #font: Uint32Array;
  #palettes: Uint32Array;
  #paletteId = 11;

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

    this.#palettes = new Uint32Array(
      memory.buffer,
      PALETTES_OFFSET,
      PALETTES_BYTE_LENGTH / 4,
    );

    // Fill the screen with the main background color
    this.#frameBufferView.fill(this.#palettes[this.#paletteId * 16 + 0]);

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
    const font = this.#font;
    const text = this.#textBuffer;
    const frame = this.#frameBufferView;
    const paletteOffset = this.#paletteId * 16;

    let cell = 0;

    for (let i = 0; i < TEXTMODE_CELLS * 2; i += 2, cell++) {
      const char = text[i];
      const style = text[i + 1];

      const fg = style & 0b1111;
      const bg = (style >> 4) & 0b1111;

      const glyphBase = char * FONT_STRIDE;

      const tileX = cell % TEXTMODE_COLS;
      const tileY = (cell / TEXTMODE_COLS) | 0;

      const frameBaseX = PAD_X + tileX * FONT_WIDTH;
      const frameBaseY = PAD_Y + tileY * FONT_HEIGHT;

      const fgg = (cell % 12) + 4;
      const bgg = cell % 4;
      const fgColor = this.#palettes[paletteOffset + fg];
      const bgColor = this.#palettes[paletteOffset + bg];

      for (let row = 0; row < FONT_HEIGHT; row++) {
        const fontRowBase = glyphBase + row * FONT_WIDTH;
        const frameRowBase = (frameBaseY + row) * FRAME_STRIDE + frameBaseX;

        for (let col = 0; col < FONT_WIDTH; col++) {
          const mask = font[fontRowBase + col];
          frame[frameRowBase + col] = (mask & fgColor) | (~mask & bgColor);
        }
      }
    }
  }
}
