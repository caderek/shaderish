export function runShader(framebuffer, shader, uniforms, from, to) {
	const { w, h } = uniforms;
	for (let i = from; i < to; i += 4) {
		const pos = i / 4;
		const x = pos % w;
		const y = Math.trunc(pos / w);
		const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
		const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));

		const color = shader(clipSpaceX, clipSpaceY, uniforms);
		framebuffer[i] = color[0] * 255;
		framebuffer[i + 1] = color[1] * 255;
		framebuffer[i + 2] = color[2] * 255;
		framebuffer[i + 3] = color[3] * 255;
	}
}
