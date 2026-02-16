// Firmware should store xbios code
// and any addtional data like precomputed math tables for sin, cos, etc.
// as well as info about motherboard slots?
export const FIRMWARE_MAX_BYTE_LENGTH = 2 ** 12 * 14; // 60 KiB
export const TEXTMODE_FONT_BYTE_LENGTH = 2 ** 12; // 4 KiB
export const PALETTES_BYTE_LENGTH = 2 ** 11; // 2 KiB
export const RESERVED_FOR_FUTURE_USE = 2 ** 11; // 2 KiB

export const FIRMWARE_OFFSET = 0;
export const TEXTMODE_FONT_OFFSET = FIRMWARE_MAX_BYTE_LENGTH;
export const PALETTES_OFFSET = TEXTMODE_FONT_OFFSET + TEXTMODE_FONT_BYTE_LENGTH;
