/**
 * Example of what happens if the fragColor is not overriden, just modified
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(fragColor) {
	fragColor[0] += 0.00001;
	fragColor[1] += 0.000015;
	fragColor[2] += 0.000005;
	fragColor[3] = 1.0;
}
