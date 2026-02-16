import { swap32 } from "../../util/colors.ts";

export const sonokai = new Uint32Array([
  swap32(0x211f21ff), // 0 0000 bg0 | high contrast
  swap32(0x2d2a2eff), // 1 0001 bg1 | normal
  swap32(0x37343aff), // 2 0010 bg2 | mid contrast
  swap32(0x3b383eff), // 3 0011 bg3 | low contrast
  swap32(0xf2f2f3ff), // 4 0100 fg0 | high contrast
  swap32(0xe3e1e4ff), // 5 0101 fg1 | normal
  swap32(0xd4d1d6ff), // 6 0110 fg2 | mid contrast24
  swap32(0xc5c1c7c5), // 7 0111 fg3 | low contrast

  swap32(0xab9df2ff), // F 1000 magenta | link / action
  swap32(0xf75e84ff), // 9 1001 red     | error / bad / low
  swap32(0xee9062ff), // 9 1010 orange  | accent / brand
  swap32(0xe4c463ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x9ecd6fff), // B 1100 green   | ok / good / high
  swap32(0x7accd7ff), // C 1101 cyan    | string / file
  swap32(0x7999d2ff), // D 1110 blue    | info / command / folder
  swap32(0x848089ff), // E 1111 gray    | comment / disabled / muted
]);
