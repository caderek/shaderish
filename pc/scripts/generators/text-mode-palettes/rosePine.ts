import { swap32 } from "../../../util/colors.ts";

export const rosePine = new Uint32Array([
  swap32(0x232136ff), // 0 0000 bg0 | high contrast
  swap32(0x2a273fff), // 1 0001 bg1 | normal
  swap32(0x393552ff), // 2 0010 bg2 | mid contrast
  swap32(0x44415aff), // 3 0011 bg3 | low contrast
  swap32(0xf1f0faff), // 4 0100 fg0 | high contrast
  swap32(0xe0def4ff), // 5 0101 fg1 | normal
  swap32(0xb7b4ceff), // 6 0110 fg2 | mid contrast24
  swap32(0x908caaff), // 7 0111 fg3 | low contrast

  swap32(0x635a96ff), // F 1000 magenta | link / action
  swap32(0xeb6f92ff), // 9 1001 red     | error / bad / low
  swap32(0xebbcbaff), // 9 1010 orange  | accent / brand
  swap32(0xf6c177ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x31748fff), // B 1100 green   | ok / good / high
  swap32(0x9ccfd8ff), // C 1101 cyan    | string / file
  swap32(0xc4a7e7ff), // D 1110 blue    | info / command / folder
  swap32(0x6e6a86ff), // E 1111 gray    | comment / disabled / muted
]);
