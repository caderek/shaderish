export function Vec2(a, b) {
	return new Float64Array([a, b]);
}

export function Vec3(a, b, c) {
	return new Float64Array([a, b, c]);
}

export function Vec4(a, b, c, d) {
	return new Float64Array([a, b, c, d]);
}

export function Color(r, g, b, a) {
	return new Uint8Array([r * 255, g * 255, b * 255, a * 255]);
}
