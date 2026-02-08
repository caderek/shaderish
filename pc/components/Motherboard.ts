// Initialization - load the ROM to memory (real mode  only 16bit address space, 64 KiB)
// 0x0000: bootloader (max 4KiB)
// 0x1000: font files (normal then bold, 2 KiB ascii each, 8 x 16 tiled)
// 0x2000: initial state (colors, splash screen, etc.)

import type { RAM } from "./RAM";
import type { ROM } from "./ROM";
import type { VideoController } from "./VideoController";

export class Motherboard {
  constructor(ram: RAM, rom: ROM, videoController: VideoController) {
    // initialize all the components classes, and devices (at least screen and keyboard)
    // load the rom to ram, and execute the bootloader
    // bootloader initializes stack and 32-bit memory address space
  }
}
