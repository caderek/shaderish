import { color, normalize } from "https://shaderish.pages.dev/lib/util.js";

/**
 * Simple circle shader
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(x, y, t, w, h) {
  const scaleX = 1.5;
  const scaleY = 1;
  x = Math.fround((x * (w / h)) / scaleX);
  y /= scaleY;
  t *= 4;
  x += Math.fround(0.25 - normalize(Math.sin(t)) * 0.5);

  const r = 0.5;

  return x * x + y * y > r * r
    ? color(0, 0, 0, 1.0)
    : color(0.7, 0.2, 0.2, 1.0);
}
