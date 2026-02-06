import fs from "node:fs";
import path from "node:path";
import { pbmToFont, printChar } from "./pbm_to_font.ts";

const SOURCE_DIR = path.join("public", "textures");

const ASCII_FONT_PATH = path.join(SOURCE_DIR, "ascii_core.pbm");

const asciiFont = pbmToFont(ASCII_FONT_PATH, 16, true);

const charCode = "$".charCodeAt(0);
printChar(charCode, asciiFont);

const emptyBootloader = Buffer.alloc(2 ** 12);
const romData = Buffer.concat([emptyBootloader, asciiFont]);

fs.writeFileSync(path.join("pc", "public", "data", "rom.bin"), romData);
