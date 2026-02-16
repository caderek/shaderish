import { swap32 } from "../../util/colors.ts";

export const nord = new Uint32Array([
  swap32(0x20242cff), // 0 0000 bg0 | high contrast
  swap32(0x2e3440ff), // 1 0001 bg1 | normal
  swap32(0x3b4252ff), // 2 0010 bg2 | mid contrast
  swap32(0x434c5eff), // 3 0011 bg3 | low contrast
  swap32(0xf5f7f9ff), // 4 0100 fg0 | high contrast
  swap32(0xeceff4ff), // 5 0101 fg1 | normal
  swap32(0xe5e9f0ff), // 6 0110 fg2 | mid contrast24
  swap32(0xd8dee9ff), // 7 0111 fg3 | low contrast

  swap32(0xb48eadff), // F 1000 magenta | link / action
  swap32(0xbf616aff), // 9 1001 red     | error / bad / low
  swap32(0xd08770ff), // 9 1010 orange  | accent / brand
  swap32(0xebcb8bff), // A 1011 yellow  | warning / meh / mid
  swap32(0xa3be8cff), // B 1100 green   | ok / good / high
  swap32(0x8fbcbbff), // C 1101 cyan    | string / file
  swap32(0x81a1c1ff), // D 1110 blue    | info / command / folder
  swap32(0x5e81acff), // E 1111 gray    | comment / disabled / muted
]);
