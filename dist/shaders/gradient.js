import { color } from "https://shaderish.pages.dev/lib/util.js";

/**
 * Simple gradient for testing
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffer - { t: number, w: number, h: number }
 */
export function fragment(x, y) {
  const r = (x + 1) / 2;
  const g = 0.5;
  const b = (y + 1) / 2;
  const a = 1.0;
  return color(r, g, b, a);
}
