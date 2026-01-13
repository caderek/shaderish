export function Color(r, g, b, a) {
	return new Uint8Array([r * 255, g * 255, b * 255, a * 255]);
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
	x = x * (w / h);
	// 1. Z-Depth / Vignette
	const dotUV = x * x + y * y;
	const zVal = 4.0 - 4.0 * Math.abs(0.7 - dotUV);

	// 2. Initial Fluid Coordinates
	let f_x = x * zVal;
	let f_y = y * zVal;

	let r = 0,
		g = 0,
		b = 0,
		a = 0;

	// 3. The 8-Step Iteration Loop
	for (let iter = 1.0; iter <= 8.0; iter++) {
		// Domain Warping Step
		// Note the axis swap (f_y used for new f_x)
		const arg_x = f_y * iter + t;
		const arg_y = f_x * iter + iter + t;

		f_x += Math.cos(arg_x) / iter + 0.7;
		f_y += Math.cos(arg_y) / iter + 0.7;

		// Cumulative Color Calculation
		const intensity = Math.abs(f_x - f_y);
		const sin_fx = Math.sin(f_x) + 1.0;
		const sin_fy = Math.sin(f_y) + 1.0;

		// Map sin results to RGBA channels (xyyx swizzle)
		r += sin_fx * intensity;
		g += sin_fy * intensity;
		b += sin_fy * intensity;
		a += sin_fx * intensity;
	}

	// 4. Final Gradient and Tonemapping
	// We use Math.exp for the vertical color shift and Math.tanh to clamp the glow
	const commonExp = zVal - 4.0;

	return Color(
		Math.tanh((7.0 * Math.exp(commonExp + y)) / r), // Red (y * -1.0)
		Math.tanh((7.0 * Math.exp(commonExp - y)) / g), // Green (y * 1.0)
		Math.tanh((7.0 * Math.exp(commonExp - 2.0 * y)) / b), // Blue (y * 2.0)
		Math.tanh((7.0 * Math.exp(commonExp)) / a), // Alpha (y * 0.0)
	);
}
