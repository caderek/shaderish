import { swap32 } from "../../../util/colors.ts";

export const catppuccinLate = new Uint32Array([
  swap32(0xe6e9efff), // 0 0000 bg0 | high contrast
  swap32(0xeff1f5ff), // 1 0001 bg1 | normal
  swap32(0xccd0daff), // 2 0010 bg2 | mid contrast
  swap32(0xbcc0ccff), // 3 0011 bg3 | low contrast
  swap32(0x4c4f69ff), // 4 0100 fg0 | high contrast
  swap32(0x5c5f77ff), // 5 0101 fg1 | normal
  swap32(0x6c6f85ff), // 6 0110 fg2 | mid contrast24
  swap32(0x7c7f93ff), // 7 0111 fg3 | low contrast

  swap32(0x8839efff), // F 1000 magenta | link / action
  swap32(0xd20f39ff), // 9 1001 red     | error / bad / low
  swap32(0xfe640bff), // 9 1010 orange  | accent / brand
  swap32(0xdf8e1dff), // A 1011 yellow  | warning / meh / mid
  swap32(0x40a02bff), // B 1100 green   | ok / good / high
  swap32(0x179299ff), // C 1101 cyan    | string / file
  swap32(0x1e66f5ff), // D 1110 blue    | info / command / folder
  swap32(0x9ca0b0ff), // E 1111 gray    | comment / disabled / muted
]);
