import { TEXTMODE_FONT_OFFSET, TEXTMODE_FONT_SIZE } from "../romLayout";

export class ROM {
  #data: ArrayBuffer;
  #font: Uint8Array;

  constructor(data: ArrayBuffer) {
    this.#data = data;
    this.#font = new Uint8Array(
      this.#data,
      TEXTMODE_FONT_OFFSET,
      TEXTMODE_FONT_SIZE,
    );
  }

  // @todo Probably temp solution, as having a getter makes no sense
  // for real hardware, it will probably have that info in the data
  get size() {
    return this.#data.byteLength;
  }

  get font() {
    return this.#font;
  }
}
