import { swap32 } from "../../../util/colors.ts";

export const basic = new Uint32Array([
  swap32(0x0d0d0dff), // 0 0000 bg0 | high contrast
  swap32(0x1a1a1aff), // 1 0001 bg1 | normal
  swap32(0x262626ff), // 2 0010 bg2 | mid contrast
  swap32(0x333333ff), // 3 0011 bg3 | low contrast
  swap32(0xf2f2f2ff), // 4 0100 fg0 | high contrast
  swap32(0xd9d9d9ff), // 5 0101 fg1 | normal
  swap32(0xbfbfbfff), // 6 0110 fg2 | mid contrast24
  swap32(0xa6a6a6ff), // 7 0111 fg3 | low contrast

  swap32(0xdd3cddff), // F 1000 magenta | link / action
  swap32(0xf53d3dff), // 9 1001 red     | error / bad / low
  swap32(0xff8000ff), // 9 1010 orange  | accent / brand
  swap32(0xe5bf00ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x78d818ff), // B 1100 green   | ok / good / high
  swap32(0x00e5bfff), // C 1101 cyan    | string / file
  swap32(0x00a5ffff), // D 1110 blue    | info / command / folder
  swap32(0x808080ff), // E 1111 gray    | comment / disabled / muted
]);
