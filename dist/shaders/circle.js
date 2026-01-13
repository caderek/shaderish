export function Color(r, g, b, a) {
	return new Uint8Array([r * 255, g * 255, b * 255, a * 255]);
}

import { toClipspace, normalize } from "../lib/normalize";
import { Color } from "../lib/vec";

export function circleFragment(x, y) {
	return Math.hypot(x, y) < 0.5 ? Color(0, 0, 0, 1) : Color(1, 1, 1, 1);
}

export function circleBouncingFragment(x, y, uniforms) {
	const ts = normalize(Math.sin(uniforms.t / 500));
	const tc = normalize(Math.cos(uniforms.t / 300));
	const offsetX = x - uniforms.mouseX / 3;
	const offsetY = y + uniforms.mouseY / 3;
	const distance = Math.hypot(offsetX, offsetY);
	const fixedDistance = Math.hypot(x, y);

	return distance < 0.3
		? Color(0, 0, 0, 1)
		: distance < 0.6
			? Color(ts / 2, tc / 2, (ts + tc) / 4, 1)
			: fixedDistance < 1
				? Color(1, 1, 1, 1)
				: Color(0, 0, 0, 1);
}
