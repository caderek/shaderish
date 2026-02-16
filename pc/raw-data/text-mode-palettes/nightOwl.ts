import { swap32 } from "../../util/colors.ts";

export const nightOwl = new Uint32Array([
  swap32(0x010b14ff), // 0 0000 bg0 | high contrast
  swap32(0x011627ff), // 1 0001 bg1 | normal
  swap32(0x102c40ff), // 2 0010 bg2 | mid contrast
  swap32(0x1d4058ff), // 3 0011 bg3 | low contrast
  swap32(0xeaeef5ff), // 4 0100 fg0 | high contrast
  swap32(0xd6deebff), // 5 0101 fg1 | normal
  swap32(0xc1cde1ff), // 6 0110 fg2 | mid contrast24
  swap32(0xadbdd7ff), // 7 0111 fg3 | low contrast

  swap32(0xc792eaff), // F 1000 magenta | link / action
  swap32(0xef5350ff), // 9 1001 red     | error / bad / low
  swap32(0xf2c98fff), // 9 1010 orange  | accent / brand
  swap32(0xc5e478ff), // A 1011 yellow  | warning / meh / mid
  swap32(0x22da6eff), // B 1100 green   | ok / good / high
  swap32(0x21c7a8ff), // C 1101 cyan    | string / file
  swap32(0x82aaffff), // D 1110 blue    | info / command / folder
  swap32(0x637777ff), // E 1111 gray    | comment / disabled / muted
]);
