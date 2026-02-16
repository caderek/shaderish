import { ROM_MAPPING_BYTE_LENGTH, ROM_MAPPING_OFFSET } from "../ramLayout";
import {
  TEXTMODE_FONT_OFFSET,
  TEXTMODE_FONT_BYTE_LENGTH,
  FIRMWARE_OFFSET,
  FIRMWARE_MAX_BYTE_LENGTH,
  PALETTES_OFFSET,
  PALETTES_BYTE_LENGTH,
} from "../romLayout";

// @todo add NVRAM to store bios settings etc

export class ROM {
  #firmware: Uint8Array;
  #font: Uint8Array;
  #palettes: Uint32Array;

  constructor(data: ArrayBuffer, memory: WebAssembly.Memory) {
    this.#mapToMemory(data, memory);

    this.#firmware = new Uint8Array(
      memory.buffer,
      ROM_MAPPING_OFFSET + FIRMWARE_OFFSET,
      FIRMWARE_MAX_BYTE_LENGTH,
    );

    this.#font = new Uint8Array(
      memory.buffer,
      ROM_MAPPING_OFFSET + TEXTMODE_FONT_OFFSET,
      TEXTMODE_FONT_BYTE_LENGTH,
    );

    this.#palettes = new Uint32Array(
      memory.buffer,
      ROM_MAPPING_OFFSET + PALETTES_OFFSET,
      PALETTES_BYTE_LENGTH / 4,
    );
  }

  #mapToMemory(data: ArrayBuffer, memory: WebAssembly.Memory) {
    const sourceView = new Uint8Array(data);
    const targetView = new Uint8Array(
      memory.buffer,
      ROM_MAPPING_OFFSET,
      ROM_MAPPING_BYTE_LENGTH,
    );

    if (sourceView.length !== targetView.length) {
      throw new Error(
        "The size of rom data does not much the memory maping area.",
      );
    }

    targetView.set(sourceView);
  }

  get firmware() {
    return this.#firmware;
  }

  get font() {
    return this.#font;
  }

  get palettes() {
    return this.#palettes;
  }
}
