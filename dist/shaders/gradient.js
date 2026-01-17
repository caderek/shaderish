/**
 * Simple gradient for testing
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffer - { t: number, w: number, h: number }
 */
export function fragment(fragColor, x, y) {
	fragColor[0] = (x + 1) / 2;
	fragColor[1] = 0.5;
	fragColor[2] = (y + 1) / 2;
	fragColor[3] = 1.0;
}
