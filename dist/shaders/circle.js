const fragColor = new Float32Array(4);

export function normalize(val) {
	return Math.fround((val + 1) / 2);
}

/**
 * Deobfuscated Plasma Shader (JS Port) by @XorDev
 * Source: x.com/XorDev/status/1894123951401378051
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {object} uniforms - { t: number, w: number, h: number }
 * @returns {Uint8Array} [r, g, b, a]
 */
export function fragment(x, y, { t, w, h }) {
	x = Math.fround(x * (w / h));

	const dist = Math.hypot(x, y);

	fragColor[0] = dist > 0.5 ? 0 : normalize(Math.cos(t));
	fragColor[1] = dist > 0.5 ? 0 : 0.2;
	fragColor[2] = dist > 0.5 ? 0 : normalize(Math.sin(t));
	fragColor[3] = 1.0;

	return fragColor;
}
