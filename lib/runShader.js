export function runShader(framebuffer, size, shader, uniforms, from, to) {
	for (let i = from; i < to; i += 4) {
		const pos = i / 4;
		const x = pos % size;
		const y = Math.trunc(pos / size);
		const clipSpaceX = (x + 0.5) / (size / 2) - 1;
		const clipSpaceY = 1 - (y + 0.5) / (size / 2);

		framebuffer.set(shader(clipSpaceX, clipSpaceY, uniforms), i);
	}
}
