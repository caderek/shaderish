import { swap32 } from "../../util/colors.ts";

export const solarizedDark = new Uint32Array([
  swap32(0x00181fff), // 0 0000 bg0 | high contrast
  swap32(0x002b36ff), // 1 0001 bg1 | normal
  swap32(0x073642ff), // 2 0010 bg2 | mid contrast
  swap32(0x0e414eff), // 3 0011 bg3 | low contrast
  swap32(0xadb8b8ff), // 4 0100 fg0 | high contrast
  swap32(0x93a1a1ff), // 5 0101 fg1 | normal
  swap32(0x839496ff), // 6 0110 fg2 | mid contrast24
  swap32(0x75888aff), // 7 0111 fg3 | low contrast

  swap32(0xd33682ff), // F 1000 magenta | link / action
  swap32(0xdc322fff), // 9 1001 red     | error / bad / low
  swap32(0xcb4b16ff), // 9 1010 orange  | accent / brand
  swap32(0xb58900ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x859900ff), // B 1100 green   | ok / good / high
  swap32(0x2aa198ff), // C 1101 cyan    | string / file
  swap32(0x268bd2ff), // D 1110 blue    | info / command / folder
  swap32(0x6c71c4ff), // E 1111 gray    | comment / disabled / muted
]);
