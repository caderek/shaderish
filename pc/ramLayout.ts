export const MAX_SYSTEM_PAGES = 2 ** 10; // 64 MiB

export const ROM_MAPPING_BYTE_LENGTH = 2 ** 16; // 64 KiB (1 wasm page)
export const TEXT_BUFFER_BYTE_LENGTH = 2 ** 16; // 64 KiB (1 wasm page)
export const FRAMEBUFFER_BYTE_LENGTH = 640 * 360 * 4; // 900 KiB
// here we have 61440 bytes (60 KiB) for other related data?
export const FRAMEBUFFER_PADDED_BYTE_LENGTH = 2 ** 16 * 15; // 960 KiB (15 wasm pages)
export const GAMEPADS_MAPPING_BYTE_LENGTH = 0;

export const ROM_MAPPING_OFFSET = 0;
export const TEXT_BUFFER_OFFSET = ROM_MAPPING_BYTE_LENGTH;
export const FRAMEBUFFER_OFFSET = TEXT_BUFFER_OFFSET + TEXT_BUFFER_BYTE_LENGTH;
