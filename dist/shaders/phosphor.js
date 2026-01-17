/**
 * "Phosphor 3" (JS Port)
 * Original authour: @Xor -> https://www.shadertoy.com/user/Xor
 * Source: https://www.shadertoy.com/view/3XtXzX
 * License: CC BY-NC-SA 3.0 -> https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(fragColor, x, y, uni) {
	const [t, w, h] = uni;
	// Correct aspect ratio for x
	x = Math.fround(x * (w / h));

	// Raymarching State
	let z = 0.0; // Ray depth
	let d = 0.0; // Step distance
	let s = 0.0; // Signed distance (temp)

	// Accumulator (O)
	let r = 0.0,
		g = 0.0,
		b = 0.0;

	// --- 1. Ray Setup ---
	// Ray Direction (p = z * normalize(vec3(I+I,0)-iResolution.xyy))
	// This maps to (x, y, -1.0) normalized
	let rd_x = x;
	let rd_y = y;
	let rd_z = -1.0;

	const rd_len = Math.fround(
		Math.sqrt(rd_x * rd_x + rd_y * rd_y + rd_z * rd_z),
	);
	rd_x /= rd_len;
	rd_y /= rd_len;
	rd_z /= rd_len;

	// --- 2. The 80-Step Raymarch Loop ---
	// GLSL: for(O*=i; i++<8e1; O+=(cos(s+vec4(0,1,8,0))+1.)/d)
	for (let i = 0; i < 80; i++) {
		// Point p = z * ray_dir
		let px = z * rd_x;
		let py = z * rd_y;
		let pz = z * rd_z;

		// Rotation Axis (a)
		// a = normalize(cos(vec3(5,0,1)+t-d*4.))
		const angle = t - d * 4.0;
		let ax = Math.cos(5.0 + angle);
		let ay = Math.cos(0.0 + angle);
		let az = Math.cos(1.0 + angle);

		const a_len = Math.fround(Math.sqrt(ax * ax + ay * ay + az * az));
		ax /= a_len;
		ay /= a_len;
		az /= a_len;

		// Move camera back 5 units
		pz += 5.0;

		// Rotated coordinates (Rodrigues-ish)
		// a = a*dot(a,p)-cross(a,p)
		const dotAP = ax * px + ay * py + az * pz;

		// Cross Product Temp Vars
		const cx = ay * pz - az * py;
		const cy = az * px - ax * pz;
		const cz = ax * py - ay * px;

		// Update 'a'
		ax = ax * dotAP - cx;
		ay = ay * dotAP - cy;
		az = az * dotAP - cz;

		// Turbulence Loop
		// GLSL: for(d=1.;d++<9.;) a-=sin(a*d+t).zxy/d;
		// Logic: runs for multipliers 2 through 9
		let turb_d = 1.0;
		while (turb_d < 9.0) {
			turb_d += 1.0;

			const sx = Math.sin(ax * turb_d + t);
			const sy = Math.sin(ay * turb_d + t);
			const sz = Math.sin(az * turb_d + t);

			// Swizzle .zxy and divide
			ax -= sz / turb_d;
			ay -= sx / turb_d;
			az -= sy / turb_d;
		}

		// Distance to ring (SDF)
		// z+=d=.1*abs(length(p)-3.)+.07*abs(cos(s=a.y));
		s = ay; // Save a.y to s
		const p_len = Math.sqrt(px * px + py * py + pz * pz);

		// Calculate step distance
		d = 0.1 * Math.abs(p_len - 3.0) + 0.07 * Math.abs(Math.cos(s));

		// Accumulate depth
		z += d;

		// Coloring and Brightness Accumulation
		// O+=(cos(s+vec4(0,1,8,0))+1.)/d
		const brightness = 1.0 / d;
		r += (Math.cos(s + 0.0) + 1.0) * brightness;
		g += (Math.cos(s + 1.0) + 1.0) * brightness;
		b += (Math.cos(s + 8.0) + 1.0) * brightness;
	}

	// --- 3. Final Tonemap ---
	// O = tanh(O/5e3)
	// 5e3 = 5000
	fragColor[0] = Math.tanh(r / 5000.0);
	fragColor[1] = Math.tanh(g / 5000.0);
	fragColor[2] = Math.tanh(b / 5000.0);
	fragColor[3] = 1.0; // Alpha
}
