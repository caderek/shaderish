import { color } from "https://shaderish.pages.dev/lib/util.js";

/**
 * Waves shader
 *
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {number} t - time in seconds
 * @param {number} w - canvas width in pixels
 * @param {number} h - canvas height in pixels
 * @param {number} mx - Normalized mouse positon (-1 to 1)
 * @param {number} my - Normalized mouse positon (-1 to 1)
 * @returns {number}
 */
export function fragment(x, y, t, w, h, mx, my) {
  x = x * (w / h);
  const d = Math.sqrt((x - mx) ** 2 + (y + my) ** 2);

  const c = Math.sin(d * 10 - t * 5) * 0.5 + 0.5;
  const r = c;
  const g = c * x;
  const b = y;
  const a = 1.0;

  return color(r, g, b, a);
}
