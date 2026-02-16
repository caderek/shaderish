import fs from "node:fs";
import path from "node:path";
import { pbmToFont, printChar } from "./generateFont.ts";

import {
  FIRMWARE_MAX_BYTE_LENGTH,
  RESERVED_FOR_FUTURE_USE,
} from "../../romLayout.ts";
import { generatePalettes } from "./generateTextmodePalettes.ts";

const SOURCE_DIR = path.join("raw-data", "fonts");
const OUT_DIR = path.join("public", "data");

const ASCII_FONT_PATH = path.join(SOURCE_DIR, "ascii_core.pbm");

const asciiFont = pbmToFont(ASCII_FONT_PATH, 16, true);

const charCode = "$".charCodeAt(0);
printChar(charCode, asciiFont);

const emptyFirmware = Buffer.alloc(FIRMWARE_MAX_BYTE_LENGTH);
const palettes = generatePalettes();
const reserved = Buffer.alloc(RESERVED_FOR_FUTURE_USE);
const romData = Buffer.concat([emptyFirmware, asciiFont, palettes, reserved]);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

fs.writeFileSync(path.join(OUT_DIR, "rom.bin"), romData);
