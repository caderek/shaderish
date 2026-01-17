/**
 * Deobfuscated Plasma Shader (JS Port) by @XorDev
 * Source: x.com/XorDev/status/1894123951401378051
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {object} uniforms - { t: number, w: number, h: number }
 * @returns {Uint8Array} [r, g, b, a]
 */
export function fragment(fragColor, x, y, { t, w, h }) {
	fragColor[0] += 0.00001;
	fragColor[1] += 0.000015;
	fragColor[2] += 0.000005;
	fragColor[3] = 1.0;
}
