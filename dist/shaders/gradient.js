import { pack } from "http://localhost:5173/lib/fast-util.js";

/**
 * Simple gradient for testing
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffer - { t: number, w: number, h: number }
 */
export function fragment(pos, res) {
  let w = res[0];
  let h = res[1];
  let x = (2 * pos[0] - w) / h;
  let y = -(2 * pos[1] - h) / h;
  const r = (x + 1) / 2;
  const g = 0.5;
  const b = (y + 1) / 2;
  const a = 1.0;
  return pack(r, g, b, a);
}
