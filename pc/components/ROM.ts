import {
  TEXTMODE_FONT_OFFSET,
  TEXTMODE_FONT_BYTE_LENGTH,
  BOOTLOADER_OFFSET,
  BOOTLOADER_MAX_BYTE_LENGTH,
} from "../romLayout";

export class ROM {
  #data: ArrayBuffer;
  #bootloader: Uint8Array;
  #font: Uint8Array;

  constructor(data: ArrayBuffer) {
    this.#data = data;

    this.#bootloader = new Uint8Array(
      this.#data,
      BOOTLOADER_OFFSET,
      BOOTLOADER_MAX_BYTE_LENGTH,
    );

    this.#font = new Uint8Array(
      this.#data,
      TEXTMODE_FONT_OFFSET,
      TEXTMODE_FONT_BYTE_LENGTH,
    );
  }

  get bootloader() {
    return this.#bootloader;
  }

  get font() {
    return this.#font;
  }
}
