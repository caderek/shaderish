export function normalize(val) {
	return (val + 1) / 2;
}

export function toClipspace(val, max = 1) {
	return (val / max) * 2 - 1;
}
