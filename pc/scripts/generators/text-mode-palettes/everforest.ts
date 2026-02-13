import { swap32 } from "../../../util/colors.ts";

export const everforest = new Uint32Array([
  swap32(0x1e2326ff), // 0 0000 bg0 | high contrast
  swap32(0x272e33ff), // 1 0001 bg1 | normal
  swap32(0x2e383cff), // 2 0010 bg2 | mid contrast
  swap32(0x374145ff), // 3 0011 bg3 | low contrast
  swap32(0xe5ddcdff), // 4 0100 fg0 | high contrast
  swap32(0xd3c6aaff), // 5 0101 fg1 | normal
  swap32(0xc1ae8bff), // 6 0110 fg2 | mid contrast24
  swap32(0xa99570ff), // 7 0111 fg3 | low contrast

  swap32(0xd699b6ff), // F 1000 magenta | link / action
  swap32(0xe57e80ff), // 9 1001 red     | error / bad / low
  swap32(0xe59875ff), // 9 1010 orange  | accent / brand
  swap32(0xdabc7fff), // A 1011 yellow  | warning / meh / mid
  swap32(0xa7c080ff), // B 1100 green   | ok / good / high
  swap32(0x83c092ff), // C 1101 cyan    | string / file
  swap32(0x7fbbb3ff), // D 1110 blue    | info / command / folder
  swap32(0x7a8478ff), // E 1111 gray    | comment / disabled / muted
]);
