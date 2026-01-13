export function Color(r, g, b, a) {
	return new Uint8Array([r * 255, g * 255, b * 255, a * 255]);
}

/**
 * Singularity" by @XorDev (JS Port)
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {object} uniforms - { t: number }
 * @returns {Float64Array} [r, g, b, a]
 */
export function fragment(x, y, uniforms) {
	const t = uniforms.t;

	// 1. Coordinates and Setup
	// GLSL: p = (F+F - r) / r.y / .7;
	// Since input x,y is already [-1, 1], we just divide by 0.7
	let px = x / 0.7;
	let py = y / 0.7;

	// Initial Iterator
	let i = 0.2;

	// Diagonal vector d = vec2(-1, 1)
	const dx = -1.0;
	const dy = 1.0;

	// Blackhole center b = p - i * d
	const bx = px - i * dx;
	const by = py - i * dy;
	const dot_b = bx * bx + by * by;

	// 2. Matrix Transformation 'c'
	// GLSL: mat2(1, 1, d/(.1 + i/dot(b,b)))
	// This creates a matrix where Col1=(1,1) and Col2=(dx/factor, dy/factor)
	const factor = 0.1 + i / (dot_b + 1e-9); // +epsilon to prevent div/0
	const m1_c2x = dx / factor;
	const m1_c2y = dy / factor;

	// c = p * mat2(...)
	// In GLSL, vec * mat uses the matrix columns for dot products.
	// cx = dot(p, col1)
	// cy = dot(p, col2)
	const cx = px * 1.0 + py * 1.0;
	const cy = px * m1_c2x + py * m1_c2y;

	// 3. Spiraling Coordinates 'v'
	// a = dot(c,c)
	const a = cx * cx + cy * cy;

	// Matrix construction angle
	// log(a) can be -Infinity if a is 0, so we clamp it.
	const theta = 0.5 * Math.log(Math.max(a, 1e-9)) + t * i;

	// GLSL: mat2(cos(theta + vec4(0,33,11,0)))
	// Col 1: cos(t+0), cos(t+33)
	// Col 2: cos(t+11), cos(t+0)
	const c00 = Math.cos(theta);
	const c01 = Math.cos(theta + 33.0);
	const c10 = Math.cos(theta + 11.0);
	const c11 = c00; // Same as first

	// v = c * mat2(...) / i
	// vx = dot(c, col1) / i
	// vy = dot(c, col2) / i
	let vx = (cx * c00 + cy * c01) / i;
	let vy = (cx * c10 + cy * c11) / i;

	// Accumulator for waves
	let wx = 0.0;
	let wy = 0.0;

	// 4. The Loop
	// GLSL: for(; i++<9.; w += 1.+sin(v) )
	// Note: 'i' starts at 0.2.
	// The check `i++ < 9` happens first.
	// Iterations: i becomes 1.2, 2.2, ... 9.2. Body runs 9 times.

	// We simulate the sequence exactly:
	// 1. Check if i < 9
	// 2. Increment i
	// 3. Run body (v update)
	// 4. Run incrementor (w update)

	while (i < 9.0) {
		i += 1.0; // Increment happens before body

		// Distort coordinates
		// v += .7 * sin(v.yx * i + iTime) / i + .5;
		const sin_arg_x = vy * i + t;
		const sin_arg_y = vx * i + t;

		vx += (0.7 * Math.sin(sin_arg_x)) / i + 0.5;
		vy += (0.7 * Math.sin(sin_arg_y)) / i + 0.5;

		// w += 1. + sin(v)
		wx += 1.0 + Math.sin(vx);
		wy += 1.0 + Math.sin(vy);
	}

	// 5. Post-Loop Calc
	// GLSL: i = length( sin(v/.3)*.4 + c*(3.+d) );
	// Note: 'i' is REASSIGNED here. It is no longer the loop counter.

	const sx = Math.sin(vx / 0.3) * 0.4;
	const sy = Math.sin(vy / 0.3) * 0.4;

	// c * (3. + d) -> c * (vec2(3,3) + vec2(-1,1)) -> c * vec2(2, 4)
	const term_cx = cx * 2.0;
	const term_cy = cy * 4.0;

	// i = length(...)
	const final_len_x = sx + term_cx;
	const final_len_y = sy + term_cy;
	const val_i = Math.sqrt(
		final_len_x * final_len_x + final_len_y * final_len_y,
	);

	// 6. Final Color Composition
	// O = 1. - exp( -exp( c.x * vec4(.6,-.4,-1,0) ) ... );

	// Calculate the base exponent factor
	// c.x * vec4(.6, -.4, -1, 0)
	const e_r = cx * 0.6;
	const e_g = cx * -0.4;
	const e_b = cx * -1.0;
	const e_a = 0.0;

	// Calculate Denominators

	// 1. w.xyyx
	const den1_r = wx;
	const den1_g = wy;
	const den1_b = wy;
	const den1_a = wx;

	// 2. Accretion disk brightness: ( 2. + i*i/4. - i )
	const den2 = 2.0 + (val_i * val_i) / 4.0 - val_i;

	// 3. Center darkness: ( .5 + 1. / a )
	// 'a' is from before the loop (dot(c,c))
	const den3 = 0.5 + 1.0 / (a + 1e-9);

	// 4. Rim highlight: ( .03 + abs( length(p)-.7 ) )
	const len_p = Math.sqrt(px * px + py * py);
	const den4 = 0.03 + Math.abs(len_p - 0.7);

	// Combine denominators
	const global_denom = den2 * den3 * den4;

	// Apply function: 1 - exp( -exp(val) / (w * global_denom) )
	// We add tiny epsilons to denominators to prevent NaN

	function computeChannel(exp_val, w_val) {
		const inner = -Math.exp(exp_val) / (w_val * global_denom + 1e-9);
		return 1.0 - Math.exp(inner);
	}

	return Color(
		computeChannel(e_r, den1_r),
		computeChannel(e_g, den1_g),
		computeChannel(e_b, den1_b),
		computeChannel(e_a, den1_a), // Usually 1.0 in this shader logic but we calc it
	);
}
