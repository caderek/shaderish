import fs from "node:fs";
import path from "node:path";
import { generateTextBufferData } from "./generateTextBufferData.ts";

const IN = path.join("raw-data", "texts", "splash.txt");
const OUT = path.join("public", "data", "splash.bin");

const content = fs
  .readFileSync(IN, { encoding: "ascii" })
  .replaceAll("\n", " ");

//const content = "Hell\\eb:Bg0;o";

const textBuffer = generateTextBufferData(content);

//console.log(textBuffer);

fs.writeFileSync(OUT, textBuffer);
