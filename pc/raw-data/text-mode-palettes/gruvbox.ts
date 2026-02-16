import { swap32 } from "../../util/colors.ts";

export const gruvbox = new Uint32Array([
  swap32(0x1d2021ff), // 0 0000 bg0 | high contrast
  swap32(0x282828ff), // 1 0001 bg1 | normal
  swap32(0x32302fff), // 2 0010 bg2 | mid contrast
  swap32(0x3c3836ff), // 3 0011 bg3 | low contrast
  swap32(0xfbf1c7ff), // 4 0100 fg0 | high contrast
  swap32(0xebdbb2ff), // 5 0101 fg1 | normal
  swap32(0xd5c4a1ff), // 6 0110 fg2 | mid contrast24
  swap32(0xbdae93ff), // 7 0111 fg3 | low contrast

  swap32(0xd3869bff), // F 1000 magenta | link / action
  swap32(0xfb4934ff), // 9 1001 red     | error / bad / low
  swap32(0xfe8019ff), // 9 1010 orange  | accent / brand
  swap32(0xfabd2fff), // A 1011 yellow  | warning / meh / mid
  swap32(0xb8bb26ff), // B 1100 green   | ok / good / high
  swap32(0x8ec07cff), // C 1101 cyan    | string / file
  swap32(0x83a598ff), // D 1110 blue    | info / command / folder
  swap32(0x7c6f64ff), // E 1111 gray    | comment / disabled / muted
]);
