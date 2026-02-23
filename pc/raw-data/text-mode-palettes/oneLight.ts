import { swap32 } from "../../util/colors.ts";

export const oneLight = new Uint32Array([
  swap32(0xd0d1d2ff), // 0 0011 bg0 | low contrast
  swap32(0xdbdbdcff), // 1 0010 bg1 | mid contrast
  swap32(0xe5e5e6ff), // 2 0001 bg2 | normal
  swap32(0xefeff0ff), // 3 0000 bg3 | high contrast
  swap32(0x383a42ff), // 4 0100 fg0 | high contrast
  swap32(0x444650ff), // 5 0101 fg1 | normal
  swap32(0x50525eff), // 6 0110 fg2 | mid contrast24
  swap32(0x5b5f6cff), // 7 0111 fg3 | low contrast

  swap32(0xa626a4ff), // 8 1000 magenta | link / action
  swap32(0xca1243ff), // 9 1001 red     | error / bad / low
  swap32(0xe45649ff), // A 1010 orange  | accent / brand
  swap32(0x986801ff), // B 1011 yellow  | warning / meh / mid
  swap32(0x50a14fff), // C 1100 green   | ok / good / high
  swap32(0x0184bcff), // D 1101 cyan    | string / file
  swap32(0x4078f2ff), // E 1110 blue    | info / command / folder
  swap32(0x878787ff), // F 1111 gray    | comment / disabled / muted
]);
