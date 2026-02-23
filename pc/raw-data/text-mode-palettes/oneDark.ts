import { swap32 } from "../../util/colors.ts";

export const oneDark = new Uint32Array([
  swap32(0x1d2025ff), // 0 0000 bg0 | high contrast
  swap32(0x252931ff), // 1 0001 bg1 | normal
  swap32(0x282c34ff), // 2 0010 bg2 | mid contrast
  swap32(0x31363fff), // 3 0011 bg3 | low contrast
  swap32(0xccccccff), // 4 0100 fg0 | high contrast
  swap32(0xabb2bfff), // 5 0101 fg1 | normal
  swap32(0x949dadff), // 6 0110 fg2 | mid contrast24
  swap32(0x7d889cff), // 7 0111 fg3 | low contrast

  swap32(0xc678ddff), // 8 1000 magenta | link / action
  swap32(0xe06c75ff), // 9 1001 red     | error / bad / low
  swap32(0xd19a66ff), // A 1010 orange  | accent / brand
  swap32(0xe5c07bff), // B 1011 yellow  | warning / meh / mid
  swap32(0x98c379ff), // C 1100 green   | ok / good / high
  swap32(0x56b6c2ff), // D 1101 cyan    | string / file
  swap32(0x61afefff), // E 1110 blue    | info / command / folder
  swap32(0x596273ff), // F 1111 gray    | comment / disabled / muted
]);
