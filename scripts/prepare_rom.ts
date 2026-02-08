import fs from "node:fs";
import path from "node:path";
import { pbmToFont, printChar } from "./pbm_to_font.ts";
import { FIRMWARE_MAX_BYTE_LENGTH } from "../pc/romLayout.ts";

const SOURCE_DIR = path.join("public", "textures");

const ASCII_FONT_PATH = path.join(SOURCE_DIR, "ascii_core.pbm");

const asciiFont = pbmToFont(ASCII_FONT_PATH, 16, true);

const charCode = "$".charCodeAt(0);
printChar(charCode, asciiFont);

const emptyFirmware = Buffer.alloc(FIRMWARE_MAX_BYTE_LENGTH);
const romData = Buffer.concat([emptyFirmware, asciiFont]);

fs.writeFileSync(path.join("pc", "public", "data", "rom.bin"), romData);
