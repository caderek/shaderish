/**
 * Solid color for testing
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment() {
  // fragColor[0] = 0.2;
  // fragColor[1] = 0.5;
  // fragColor[2] = 0.2;
  // fragColor[3] = 1.0;
  return 0xff448844;
}
