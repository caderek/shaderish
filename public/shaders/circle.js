import { normalize } from "https://shaderish.pages.dev/lib/util.js";

/**
 * Simple circle shader
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(fragColor, x, y, uni) {
	const [t, w, h] = uni;
	x = Math.fround(x * (w / h));

	const dist = Math.fround(Math.hypot(x, y));

	fragColor[0] = dist > 0.5 ? 0 : normalize(Math.cos(t));
	fragColor[1] = dist > 0.5 ? 0 : 0.2;
	fragColor[2] = dist > 0.5 ? 0 : normalize(Math.sin(t));
	fragColor[3] = 1.0;
}
