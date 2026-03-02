import { normalize } from "http://localhost:5173/lib/util.js";
import { pack } from "http://localhost:5173/lib/fast-util.js";

/**
 * Simple circle shader
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(pos, res, t) {
  let w = res[0];
  let h = res[1];
  let x = (2 * pos[0] - w) / h;
  let y = -(2 * pos[1] - h) / h;

  const scaleX = 1;
  const scaleY = 1;

  x /= scaleX;
  y /= scaleY;
  t *= 4;
  x += Math.fround(0.25 - normalize(Math.sin(t)) * 0.5);

  const r = 0.5;

  return x * x + y * y > r * r ? pack(0, 0, 0, 1.0) : pack(0.7, 0.2, 0.2, 1.0);
}
