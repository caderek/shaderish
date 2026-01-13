export function runShader(framebuffer, shader, uniforms, from, to) {
	const { w, h } = uniforms;
	for (let i = from; i < to; i += 4) {
		const pos = i / 4;
		const x = pos % w;
		const y = Math.trunc(pos / w);
		const clipSpaceX = (x + 0.5) / (w / 2) - 1;
		const clipSpaceY = 1 - (y + 0.5) / (h / 2);

		framebuffer.set(shader(clipSpaceX, clipSpaceY, uniforms), i);
	}
}
