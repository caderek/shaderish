import { Color } from "../lib/vec";

/**
 * "Accretion" by @XorDev (JS Port)
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {object} uniforms - { t: number }
 * @returns {Float64Array} [r, g, b, a]
 */
export function accretionFragment(x, y, uniforms) {
	const t = uniforms.t;

	// Raymarch depth, Step distance, Iterator
	let z = 0;
	let d = 0;
	let i = 0;

	// Color Accumulators
	let or = 0,
		og = 0,
		ob = 0,
		oa = 0;

	// 1. Raymarch Loop (20 steps)
	while (i < 20.0) {
		i++;

		// Ray Direction (normalize(vec3(I+I,0)-res.xyx))
		// With x,y in [-1, 1], the vector is (x, y, -1)
		const dirX = x;
		const dirY = y;
		const dirZ = -1.0;
		const mag = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

		// Sample point p = z * normalize(...) + 0.1
		let px = (z * dirX) / mag + 0.1;
		let py = (z * dirY) / mag + 0.1;
		let pz = (z * dirZ) / mag + 0.1;

		// 2. Polar transformations
		// atan2 is used for atan(p.y, p.x)
		const angle = Math.atan2(py / 0.2, px) * 2.0;
		const distXY = Math.sqrt(px * px + py * py) - 5.0 - z * 0.2;

		px = angle;
		py = pz / 3.0;
		pz = distXY;

		// 3. Turbulence & Refraction Loop (7 steps)
		for (d = 1.0; d <= 7.0; d++) {
			// p += sin(p.yzx * d + t + 0.3 * i) / d
			const sx = Math.sin(py * d + t + 0.3 * i) / d;
			const sy = Math.sin(pz * d + t + 0.3 * i) / d;
			const sz = Math.sin(px * d + t + 0.3 * i) / d;
			px += sx;
			py += sy;
			pz += sz;
		}

		// 4. Distance Calculation
		// d = length(vec4(0.4 * cos(p) - 0.4, p.z))
		// Note: vec4 length for (a, b, c, d) is sqrt(a²+b²+c²+d²)
		const c_px = 0.4 * Math.cos(px) - 0.4;
		const c_py = 0.4 * Math.cos(py) - 0.4;
		const c_pz = 0.4 * Math.cos(pz) - 0.4;
		const c_pw = pz; // The p.z component is the 4th element in the GLSL length call

		d = Math.sqrt(c_px * c_px + c_py * c_py + c_pz * c_pz + c_pw * c_pw);

		// Advance Ray
		z += d;

		// 5. Coloring (1 + cos(p.x + i*0.4 + z + offsets)) / d
		const colorBase = px + i * 0.4 + z;
		const intensity = 1.0 / (d + 0.001); // Epsilon for stability

		or += (1.0 + Math.cos(colorBase + 6.0)) * intensity;
		og += (1.0 + Math.cos(colorBase + 1.0)) * intensity;
		ob += (1.0 + Math.cos(colorBase + 2.0)) * intensity;
		oa += (1.0 + Math.cos(colorBase + 0.0)) * intensity;
	}

	// 6. Final Tanh Tonemap (O * O / 400)
	const exposure = 400.0;
	return Color(
		Math.tanh((or * or) / exposure),
		Math.tanh((og * og) / exposure),
		Math.tanh((ob * ob) / exposure),
		Math.tanh((oa * oa) / exposure),
	);
}
