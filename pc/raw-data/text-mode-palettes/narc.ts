import { swap32 } from "../../util/colors.ts";

export const narc = new Uint32Array([
  swap32(0x1a1919ff), // 0 0000 bg0 | high contrast
  swap32(0x222020ff), // 1 0001 bg1 | normal
  swap32(0x2c2726ff), // 2 0010 bg2 | mid contrast
  swap32(0x342e2dff), // 3 0011 bg3 | low contrast
  swap32(0xeae5e3ff), // 4 0100 fg0 | high contrast
  swap32(0xdcd5d2ff), // 5 0101 fg1 | normal
  swap32(0xcfc5c0ff), // 6 0110 fg2 | mid contrast24
  swap32(0xc1b5afff), // 7 0111 fg3 | low contrast

  swap32(0x6e5e7dff), // F 1000 magenta | link / action
  swap32(0xa65959ff), // 9 1001 red     | error / bad / low
  swap32(0x9e6e5cff), // 9 1010 orange  | accent / brand
  swap32(0xa39067ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x93a56fff), // B 1100 green   | ok / good / high
  swap32(0x5ba48bff), // C 1101 cyan    | string / file
  swap32(0x5f729bff), // D 1110 blue    | info / command / folder
  swap32(0x7b716eff), // E 1111 gray    | comment / disabled / muted
]);
