import { swap32 } from "../../util/colors.ts";

export const catppuccinMocha = new Uint32Array([
  swap32(0x181825ff), // 0 0000 bg0 | high contrast
  swap32(0x1e1e2eff), // 1 0001 bg1 | normal
  swap32(0x313244ff), // 2 0010 bg2 | mid contrast
  swap32(0x45475aff), // 3 0011 bg3 | low contrast
  swap32(0xcdd6f4ff), // 4 0100 fg0 | high contrast
  swap32(0xbac2deff), // 5 0101 fg1 | normal
  swap32(0xa6adc8ff), // 6 0110 fg2 | mid contrast24
  swap32(0x9399b2ff), // 7 0111 fg3 | low contrast

  swap32(0xcba6f7ff), // F 1000 magenta | link / action
  swap32(0xf38ba8ff), // 9 1001 red     | error / bad / low
  swap32(0xfab387ff), // 9 1010 orange  | accent / brand
  swap32(0xf9e2afff), // A 1011 yellow  | warning / meh / mid
  swap32(0xa6e3a1ff), // B 1100 green   | ok / good / high
  swap32(0x94e2d5ff), // C 1101 cyan    | string / file
  swap32(0x8aadf4ff), // D 1110 blue    | info / command / folder
  swap32(0x6c7086ff), // E 1111 gray    | comment / disabled / muted
]);
