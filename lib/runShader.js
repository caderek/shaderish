const TILE_SIZE = 8;

export function runShader(
	framebuffer,
	controlbuffer,
	shader,
	uniforms,
	tilesPerRow,
	tilesPerCol,
	chunkLen,
) {
	const color = new Float32Array(4);
	const maxTile = tilesPerRow * tilesPerCol;
	// Run tile by tile until no tiles left, check the next tile from buffer
	// @todo Optimize the empty shader - now it takes 1-2ms, probably becaue of the uniforms serialization and postMessage to run,
	// try using a vram for uniforms and Atomics for signalling to run.
	while (true) {
		const tile = Atomics.add(controlbuffer, 0, 1);

		if (tile >= maxTile) {
			return;
		}

		const start = tile * chunkLen;
		const end = start + chunkLen;

		const { w, h } = uniforms;
		const tileX = tile % tilesPerRow;
		const tileY = Math.trunc(tile / tilesPerRow);

		for (let i = start, n = 0; i < end; i += 4, n++) {
			const x = (n % TILE_SIZE) + tileX * TILE_SIZE;
			const y = Math.trunc(n / TILE_SIZE) + tileY * TILE_SIZE;

			const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
			const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));

			shader(color, clipSpaceX, clipSpaceY, uniforms);

			framebuffer[i] = color[0] * 255;
			framebuffer[i + 1] = color[1] * 255;
			framebuffer[i + 2] = color[2] * 255;
			framebuffer[i + 3] = color[3] * 255;
		}
	}
}
