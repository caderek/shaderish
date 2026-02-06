export const FRAMEBUFFER_BYTE_LENGTH = 640 * 360 * 4; // w * h * bytes per pixel
export const TEXT_BUFFER_BYTE_LENGTH = 2 ** 16; // 64 KiB (1 wasm page)

export const FRAMEBUFFER_OFFSET = 0;
export const TEXT_BUFFER_OFFSET = FRAMEBUFFER_BYTE_LENGTH;
