const TILE_SIZE = 8;

export function runShaderTiled(
	framebuffer,
	controlbuffer,
	shader,
	uniforms,
	tilesPerRow,
	tilesPerCol,
	chunkLen,
) {
	const maxTile = tilesPerRow * tilesPerCol;
	// Run tile by tile until no tiles left, check the next tile from buffer
	// @todo Optimize the empty shader - now it takes 1-2ms, probably becaue of the uniforms serialization and postMessage to run,
	// try uing a vram for uniforms and Atomics for signalling to run.
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
		const startX = 0;

		for (let i = start, n = 0; i < end; i += 4, n++) {
			const x = (n % TILE_SIZE) + tileX * TILE_SIZE;
			const y = Math.trunc(n / TILE_SIZE) + tileY * TILE_SIZE;

			// console.log({ tile, x, y });

			// const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
			// const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));
			const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
			const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));

			const color = shader(clipSpaceX, clipSpaceY, uniforms);

			framebuffer[i] = color[0] * 255;
			framebuffer[i + 1] = color[1] * 255;
			framebuffer[i + 2] = color[2] * 255;
			framebuffer[i + 3] = color[3] * 255;
		}
	}
}

export function runShader(framebuffer, shader, uniforms, fromTile, toTile) {
	// const start = performance.now();
	const { w, h } = uniforms;
	const tilesPerRow = Math.ceil(w / TILE_SIZE);

	for (let t = fromTile; t < toTile; t++) {
		// Convert tile index to pixel coordinates
		const tileX = (t % tilesPerRow) * TILE_SIZE;
		const tileY = Math.trunc(t / tilesPerRow) * TILE_SIZE;

		// Process the 8x8 block
		for (let y = tileY; y < tileY + TILE_SIZE && y < h; y++) {
			const rowOffset = y * w;

			for (let x = tileX; x < tileX + TILE_SIZE && x < w; x++) {
				const i = (rowOffset + x) * 4;

				const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
				const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));

				const color = shader(clipSpaceX, clipSpaceY, uniforms);

				framebuffer[i] = color[0] * 255;
				framebuffer[i + 1] = color[1] * 255;
				framebuffer[i + 2] = color[2] * 255;
				framebuffer[i + 3] = color[3] * 255;
			}
		}
	}
	// const time = performance.now() - start;
	// console.log({ time });
}

// export function runShader(framebuffer, shader, uniforms, from, to) {
// 	const { w, h } = uniforms;
// 	for (let i = from; i < to; i += 4) {
// 		const pos = i / 4;
// 		const x = pos % w;
// 		const y = Math.trunc(pos / w);
// 		const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
// 		const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));
//
// 		const color = shader(clipSpaceX, clipSpaceY, uniforms);
// 		framebuffer[i] = color[0] * 255;
// 		framebuffer[i + 1] = color[1] * 255;
// 		framebuffer[i + 2] = color[2] * 255;
// 		framebuffer[i + 3] = color[3] * 255;
// 	}
// }
