import { pack } from "http://localhost:5173/lib/fast-util.js";

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
export function fragment(pos, res, t, mouse) {
  let w = res[0];
  let h = res[1];
  let x = (2 * pos[0] - w) / h;
  let y = -(2 * pos[1] - h) / h;
  let mx = mouse[0];
  let my = mouse[1];

  const d = Math.sqrt((x - mx) ** 2 + (y + my) ** 2);

  const c = Math.sin(d * 10 - t * 5) * 0.5 + 0.5;
  const r = c;
  const g = c * x;
  const b = y;
  const a = 1.0;

  return pack(r, g, b, a);
}
