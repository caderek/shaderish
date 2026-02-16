import { swap32 } from "../../util/colors.ts";

export const solarizedLight = new Uint32Array([
  swap32(0xfefaf0ff), // 0 0000 bg0 | high contrast
  swap32(0xfdf6e3ff), // 1 0001 bg1 | normal
  swap32(0xeee8d5ff), // 2 0010 bg2 | mid contrast
  swap32(0xdbd4bdff), // 3 0011 bg3 | low contrast
  swap32(0x425257ff), // 4 0100 fg0 | high contrast
  swap32(0x586e75ff), // 5 0101 fg1 | normal
  swap32(0x657b83ff), // 6 0110 fg2 | mid contrast24
  swap32(0x6f8790ff), // 7 0111 fg3 | low contrast

  swap32(0xd33682ff), // F 1000 magenta | link / action
  swap32(0xdc322fff), // 9 1001 red     | error / bad / low
  swap32(0xcb4b16ff), // 9 1010 orange  | accent / brand
  swap32(0xb58900ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x859900ff), // B 1100 green   | ok / good / high
  swap32(0x2aa198ff), // C 1101 cyan    | string / file
  swap32(0x268bd2ff), // D 1110 blue    | info / command / folder
  swap32(0x6c71c4ff), // E 1111 gray    | comment / disabled / muted
]);
