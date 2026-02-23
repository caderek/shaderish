import { swap32 } from "../../util/colors.ts";

export const study = new Uint32Array([
  swap32(0x1b1d32ff), // 0 0000 bg0 | high contrast
  swap32(0x1f2247ff), // 1 0001 bg1 | normal
  swap32(0x22275fff), // 2 0010 bg2 | mid contrast
  swap32(0x323a7bff), // 3 0011 bg3 | low contrast
  swap32(0xf4ffefff), // 4 0100 fg0 | high contrast
  swap32(0xe6fbdaff), // 5 0101 fg1 | normal
  swap32(0xdad1ccff), // 6 0110 fg2 | mid contrast24
  swap32(0xb0aba8ff), // 7 0111 fg3 | low contrast

  swap32(0xa885e0ff), // 8 1000 magenta | link / action
  swap32(0xe085a9ff), // 9 1001 red     | error / bad / low
  swap32(0xd6c35cff), // A 1010 orange  | accent / brand
  swap32(0xc4d65cff), // B 1011 yellow  | warning / meh / mid
  swap32(0x8dd65cff), // C 1100 green   | ok / good / high
  swap32(0x5cd6a6ff), // D 1101 cyan    | string / file
  swap32(0x7593f0ff), // E 1110 blue    | info / command / folder
  swap32(0x5e6bb4ff), // F 1111 gray    | comment / disabled / muted
]);
