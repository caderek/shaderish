export const MAX_SYSTEM_PAGES = 2 ** 10; // 64 MiB

export const ROM_MAPPING_BYTE_LENGTH = 2 ** 16; // 64 KiB (1 wasm page)
export const TEXT_BUFFER_BYTE_LENGTH = 2 ** 16; // 64 KiB (1 wasm page)
export const FRAMEBUFFER_BYTE_LENGTH = 640 * 360 * 4; // 900 KiB
export const FRAMEBUFFER_PADDED_BYTE_LENGTH = 2 ** 20; // 1 MiB, enough to store 640x360 frame with overdraw

export const ROM_MAPPING_OFFSET = 0;
export const TEXT_BUFFER_OFFSET = ROM_MAPPING_BYTE_LENGTH;
export const FRAMEBUFFER_OFFSET = TEXT_BUFFER_OFFSET + TEXT_BUFFER_BYTE_LENGTH;
