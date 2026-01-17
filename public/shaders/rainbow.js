/**
 * "Rainbow Showoff" (JS Port)
 * Original authour: @akufishi -> https://www.shadertoy.com/user/akufishi
 * Source: https://www.shadertoy.com/view/lscBRf
 * License: CC BY-NC-SA 3.0 -> https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {object} uniforms - { t: number, w: number, h: number }
 */
export function fragment(fragColor, x, y, { t, w, h }) {
	// 1. Aspect correction (Height-based scaling)
	x = x * (w / h);

	// 2. Map normalized (-1 to 1) to virtual pixel space
	// We treat h as the reference height for coordinate scaling
	const fragCoordX = (x + w / h) * 0.5 * h;
	const fragCoordY = (y + 1.0) * 0.5 * h;

	// 3. Normalized UVs for gradients (0 to 1)
	const uvX = (x / (w / h) + 1.0) * 0.5;
	const uvY = (y + 1.0) * 0.5;

	const FALLING_SPEED = 0.25;
	const STRIPES_FACTOR = 5.0;

	// 4. Pixelize X coordinate for stripe grouping
	const clampedX =
		(Math.round(fragCoordX / STRIPES_FACTOR) * STRIPES_FACTOR) / h;

	// 5. Hash for randomness based on stripe column
	const valSeed = Math.sin(clampedX) * 43758.5453123;
	const value = valSeed - Math.floor(valSeed);

	// 6. Stripe Logic
	const travel = t * (FALLING_SPEED + value / 5.0) + value;
	const stripePattern = 1.0 - ((uvY * 0.5 + travel) % 0.5) / 0.5;

	// 7. Dynamic Coloring
	const rCol = Math.max(0, Math.min(1, Math.cos(t * 2.0 + uvX + 0)));
	const gCol = Math.max(0, Math.min(1, Math.cos(t * 2.0 + uvY + 2)));
	const bCol = Math.max(0, Math.min(1, Math.cos(t * 2.0 + uvX + 4)));

	let r = stripePattern * rCol;
	let g = stripePattern * gCol;
	let b = stripePattern * bCol;

	// 8. Glowing Head (Sphere)
	// Map the falling mod logic back to pixel space
	const sphereY = (1.0 - 2.0 * (travel % 0.5)) * h;
	const sphereX = clampedX * h;

	const dx = sphereX - fragCoordX;
	const dy = sphereY - fragCoordY;
	const distSq = dx * dx + dy * dy;
	const radius = 0.9;

	// Manual smoothstep: clamp((60 - dist) / 60, 0, 1)
	const glow =
		Math.max(0, Math.min(1, (60.0 - (distSq - radius * radius)) / 60.0)) / 2.0;

	r += glow;
	g += glow;
	b += glow;

	// 9. Screen Fade (Vertical Vignette)
	const fade = Math.exp(
		-Math.pow(Math.abs(uvY - 0.5), 6.0) / Math.pow(2.0 * 0.05, 2.0),
	);

	fragColor[0] = r * fade;
	fragColor[1] = g * fade;
	fragColor[2] = b * fade;
	fragColor[3] = 1.0;
}
