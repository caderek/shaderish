import { swap32 } from "../../util/colors.ts";

export const tokyoNight = new Uint32Array([
  swap32(0x111118ff), // 0 0000 bg0 | high contrast
  swap32(0x1a1b26ff), // 1 0001 bg1 | normal
  swap32(0x24283bff), // 2 0010 bg2 | mid contrast
  swap32(0x2e344cff), // 3 0011 bg3 | low contrast
  swap32(0xc0caf5ff), // 4 0100 fg0 | high contrast
  swap32(0xa9b1d6ff), // 5 0101 fg1 | normal
  swap32(0x9aa5ceff), // 6 0110 fg2 | mid contrast24
  swap32(0x8794c5ff), // 7 0111 fg3 | low contrast

  swap32(0xbb9af7ff), // F 1000 magenta | link / action
  swap32(0xf7768eff), // 9 1001 red     | error / bad / low
  swap32(0xff9e64ff), // 9 1010 orange  | accent / brand
  swap32(0xe0af68ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x9ece6aff), // B 1100 green   | ok / good / high
  swap32(0x7dcfffff), // C 1101 cyan    | string / file
  swap32(0x7aa2f7ff), // D 1110 blue    | info / command / folder
  swap32(0x565f89ff), // E 1111 gray    | comment / disabled / muted
]);
