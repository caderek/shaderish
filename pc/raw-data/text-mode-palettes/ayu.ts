import { swap32 } from "../../util/colors.ts";

export const ayu = new Uint32Array([
  swap32(0x171b24ff), // 0 0000 bg0 | high contrast
  swap32(0x1f2430ff), // 1 0001 bg1 | normal
  swap32(0x282e3bff), // 2 0010 bg2 | mid contrast
  swap32(0x323845ff), // 3 0011 bg3 | low contrast
  swap32(0xe3e6eaff), // 4 0100 fg0 | high contrast
  swap32(0xd2d6dcff), // 5 0101 fg1 | normal
  swap32(0xc0c6cfff), // 6 0110 fg2 | mid contrast24
  swap32(0xafb7c1ff), // 7 0111 fg3 | low contrast

  swap32(0xd09ffdff), // 8 1000 magenta | link / action
  swap32(0xf06b5cff), // 9 1001 red     | error / bad / low
  swap32(0xffa659ff), // A 1010 orange  | accent / brand
  swap32(0xe6b752ff), // B 1011 yellow  | warning / meh / mid
  swap32(0xbfe76dff), // C 1100 green   | ok / good / high
  swap32(0x84ceb5ff), // D 1101 cyan    | string / file
  swap32(0x3bbbf4ff), // E 1110 blue    | info / command / folder
  swap32(0x6e7c8fff), // F 1111 gray    | comment / disabled / muted
]);
