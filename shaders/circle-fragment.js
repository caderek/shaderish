import { normalize } from "../lib/normalize";

export function circleFragment(x, y) {
	return Math.hypot(x, y) < 0.5 ? [0, 0, 0, 1] : [1, 1, 1, 1];
}

export function circleBouncingFragment(x, y, uniforms) {
	const offsetX = x - normalize(Math.sin(uniforms.t / 200)) + 0.5;
	const offsetY = y;

	return Math.hypot(offsetX, offsetY) < 0.5 ? [0, 0, 0, 1] : [1, 1, 1, 1];
}
