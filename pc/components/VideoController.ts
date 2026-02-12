import {
  FRAMEBUFFER_OFFSET,
  FRAMEBUFFER_BYTE_LENGTH,
  TEXT_BUFFER_OFFSET,
  TEXT_BUFFER_BYTE_LENGTH,
  ROM_MAPPING_OFFSET,
} from "../ramLayout";
import { TEXTMODE_FONT_BYTE_LENGTH, TEXTMODE_FONT_OFFSET } from "../romLayout";

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

function swap32(val: number) {
  return (
    ((val & 0xff) << 24) | // Move RR to AA position
    ((val & 0xff00) << 8) | // Move GG to BB position
    ((val >> 8) & 0xff00) | // Move BB to GG position
    ((val >> 24) & 0xff) // Move AA to RR position
  );
}

// 00xx: Backgrounds (Elevation/Depth)
// 01xx: Foregrounds (Legibility/Contrast)
// 1xxx: Accents (State/Type)

// | Index   | Binary      | Color           | Role                                 |
// | ------- | ----------- | --------------- | ------------------------------------ |
// | **8**   | `1000`      | **Magenta**     | The "Action" color. High visibility. |
// | **9-B** | `1001-1011` | **Red/Org/Yel** | The "Warning" gradient.              |
// | **C-E** | `1100-1110` | **Grn/Cyn/Blu** | The "Success/Info" gradient.         |
// | **F**   | `1111`      | **Muted Gray**  | The "Noise" suppressor.              |

// Basic
// const palette = new Uint32Array([
//   swap32(0x0a0a0aff), // 0 0000 bg0 | high contrast
//   swap32(0x141414ff), // 1 0001 bg1 | normal
//   swap32(0x1f1f1fff), // 2 0010 bg2 | mid contrast
//   swap32(0x292929ff), // 3 0011 bg3 | low contrast
//   swap32(0xfafafaff), // 4 0100 fg0 | high contrast
//   swap32(0xeaeaeaff), // 5 0101 fg1 | normal
//   swap32(0xdbdbdbff), // 6 0110 fg2 | mid contrast24
//   swap32(0xccccccff), // 7 0111 fg3 | low contrast
//
//   swap32(0xe830e8ff), // F 1000 magenta | link / action
//   swap32(0xff3333ff), // 9 1001 red     | error / bad / low
//   swap32(0xffa500ff), // 9 1010 orange  | accent / brand
//   swap32(0xffd400ff), // A 1011 yellow  | warning / meh / mid
//   swap32(0x4de500ff), // B 1100 green   | ok / good / high
//   swap32(0x00e5bfff), // C 1101 cyan    | string / file
//   swap32(0x00a5ffff), // D 1110 blue    | info / command / folder
//   swap32(0x808080ff), // E 1111 gray    | comment / disabled / muted
// ]);

// Gruvbox
// const palette = new Uint32Array([
//   swap32(0x1d2021ff), // 0 0000 bg0 | high contrast
//   swap32(0x282828ff), // 1 0001 bg1 | normal
//   swap32(0x32302fff), // 2 0010 bg2 | mid contrast
//   swap32(0x3c3836ff), // 3 0011 bg3 | low contrast
//   swap32(0xfbf1c7ff), // 4 0100 fg0 | high contrast
//   swap32(0xebdbb2ff), // 5 0101 fg1 | normal
//   swap32(0xd5c4a1ff), // 6 0110 fg2 | mid contrast24
//   swap32(0xbdae93ff), // 7 0111 fg3 | low contrast
//
//   swap32(0xd3869bff), // F 1000 magenta | link / action
//   swap32(0xfb4934ff), // 9 1001 red     | error / bad / low
//   swap32(0xfe8019ff), // 9 1010 orange  | accent / brand
//   swap32(0xfabd2fff), // A 1011 yellow  | warning / meh / mid
//   swap32(0xb8bb26ff), // B 1100 green   | ok / good / high
//   swap32(0x8ec07cff), // C 1101 cyan    | string / file
//   swap32(0x83a598ff), // D 1110 blue    | info / command / folder
//   swap32(0x7c6f64ff), // E 1111 gray    | comment / disabled / muted
// ]);

// Sonokai
// const palette = new Uint32Array([
//   swap32(0x222327ff), // 0 0000 bg0 | high contrast
//   swap32(0x2c2e34ff), // 1 0001 bg1 | normal
//   swap32(0x33353fff), // 2 0010 bg2 | mid contrast
//   swap32(0x363944ff), // 3 0011 bg3 | low contrast
//   swap32(0xf2f2f2ff), // 4 0100 fg0 | high contrast
//   swap32(0xe2e2e3ff), // 5 0101 fg1 | normal
//   swap32(0xd3d3d4ff), // 6 0110 fg2 | mid contrast24
//   swap32(0xffc3c3c5), // 7 0111 fg3 | low contrast
//
//   swap32(0xb39df3ff), // F 1000 magenta | link / action
//   swap32(0xfc5d7cff), // 9 1001 red     | error / bad / low
//   swap32(0xf39660ff), // 9 1010 orange  | accent / brand
//   swap32(0xe7c664ff), // A 1011 yellow  | warning / meh / mid
//   swap32(0x9ed072ff), // B 1100 green   | ok / good / high
//   swap32(0x76cce0ff), // C 1101 cyan    | string / file
//   swap32(0x7999d2ff), // D 1110 blue    | info / command / folder
//   swap32(0x7f8490ff), // E 1111 gray    | comment / disabled / muted
// ]);

// Sonokai Shushia
const palette = new Uint32Array([
  swap32(0x211f21ff), // 0 0000 bg0 | high contrast
  swap32(0x2d2a2eff), // 1 0001 bg1 | normal
  swap32(0x37343aff), // 2 0010 bg2 | mid contrast
  swap32(0x3b383eff), // 3 0011 bg3 | low contrast
  swap32(0xf2f2f3ff), // 4 0100 fg0 | high contrast
  swap32(0xe3e1e4ff), // 5 0101 fg1 | normal
  swap32(0xd4d1d6ff), // 6 0110 fg2 | mid contrast24
  swap32(0xc5c1c7c5), // 7 0111 fg3 | low contrast

  swap32(0xab9df2ff), // F 1000 magenta | link / action
  swap32(0xf75e84ff), // 9 1001 red     | error / bad / low
  swap32(0xee9062ff), // 9 1010 orange  | accent / brand
  swap32(0xe4c463ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x9ecd6fff), // B 1100 green   | ok / good / high
  swap32(0x7accd7ff), // C 1101 cyan    | string / file
  swap32(0x7999d2ff), // D 1110 blue    | info / command / folder
  swap32(0x848089ff), // E 1111 gray    | comment / disabled / muted
]);

// Catppuccin Mocha
// const palette = new Uint32Array([
//   swap32(0x181825ff), // 0 0000 bg0 | high contrast
//   swap32(0x1e1e2eff), // 1 0001 bg1 | normal
//   swap32(0x313244ff), // 2 0010 bg2 | mid contrast
//   swap32(0x45475aff), // 3 0011 bg3 | low contrast
//   swap32(0xcdd6f4ff), // 4 0100 fg0 | high contrast
//   swap32(0xbac2deff), // 5 0101 fg1 | normal
//   swap32(0xa6adc8ff), // 6 0110 fg2 | mid contrast24
//   swap32(0x9399b2ff), // 7 0111 fg3 | low contrast
//
//   swap32(0xcba6f7ff), // F 1000 magenta | link / action
//   swap32(0xf38ba8ff), // 9 1001 red     | error / bad / low
//   swap32(0xfab387ff), // 9 1010 orange  | accent / brand
//   swap32(0xf9e2afff), // A 1011 yellow  | warning / meh / mid
//   swap32(0xa6e3a1ff), // B 1100 green   | ok / good / high
//   swap32(0x94e2d5ff), // C 1101 cyan    | string / file
//   swap32(0x8aadf4ff), // D 1110 blue    | info / command / folder
//   swap32(0x6c7086ff), // E 1111 gray    | comment / disabled / muted
// ]);

// Catppuccin Latte
// const palette = new Uint32Array([
//   swap32(0xe6e9efff), // 0 0000 bg0 | high contrast
//   swap32(0xeff1f5ff), // 1 0001 bg1 | normal
//   swap32(0xccd0daff), // 2 0010 bg2 | mid contrast
//   swap32(0xbcc0ccff), // 3 0011 bg3 | low contrast
//   swap32(0x4c4f69ff), // 4 0100 fg0 | high contrast
//   swap32(0x5c5f77ff), // 5 0101 fg1 | normal
//   swap32(0x6c6f85ff), // 6 0110 fg2 | mid contrast24
//   swap32(0x7c7f93ff), // 7 0111 fg3 | low contrast
//
//   swap32(0x8839efff), // F 1000 magenta | link / action
//   swap32(0xd20f39ff), // 9 1001 red     | error / bad / low
//   swap32(0xfe640bff), // 9 1010 orange  | accent / brand
//   swap32(0xdf8e1dff), // A 1011 yellow  | warning / meh / mid
//   swap32(0x40a02bff), // B 1100 green   | ok / good / high
//   swap32(0x179299ff), // C 1101 cyan    | string / file
//   swap32(0x1e66f5ff), // D 1110 blue    | info / command / folder
//   swap32(0x9ca0b0ff), // E 1111 gray    | comment / disabled / muted
// ]);

export class VideoController {
  mode: "text" | "graphics" = "text";

  #textBuffer: Uint8Array;
  #frameBufferView: Uint32Array;
  #font: Uint32Array;

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
    const font = this.#font;
    const text = this.#textBuffer;
    const frame = this.#frameBufferView;

    let cell = 0;

    for (let i = 0; i < TEXTMODE_CELLS * 2; i += 2, cell++) {
      const char = text[i] + 128; // add 128 to switch to alt
      const style = text[i + 1];

      const fg = style & 0b1111;
      const bg = (style >> 4) & 0b1111;

      const glyphBase = char * FONT_STRIDE;

      const tileX = cell % TEXTMODE_COLS;
      const tileY = (cell / TEXTMODE_COLS) | 0;

      const frameBaseX = PAD_X + tileX * FONT_WIDTH;
      const frameBaseY = PAD_Y + tileY * FONT_HEIGHT;

      // const fgg = Math.floor(Math.random() * 12) + 4;
      // const bgg = Math.floor(Math.random() * 4);
      const fgg = (cell % 12) + 4;
      const bgg = cell & 4;
      const fgColor = palette[fgg];
      const bgColor = palette[bg];

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
