// const TILE_SIZE = 8;
//
// export function runShader(framebuffer, shader, uniforms, from, to) {
// 	const { w, h } = uniforms;
//
// 	// Convert the 1D range into pixel indices
// 	const startPixel = from / 4;
// 	const endPixel = to / 4;
//
// 	// Iterate through tiles
// 	// We find the tile coordinates (tx, ty) that contain our start/end pixels
// 	for (let ty = 0; ty < h; ty += TILE_SIZE) {
// 		for (let tx = 0; tx < w; tx += TILE_SIZE) {
// 			// Process pixels within the current 8x8 tile
// 			for (let y = ty; y < ty + TILE_SIZE && y < h; y++) {
// 				for (let x = tx; x < tx + TILE_SIZE && x < w; x++) {
// 					const pos = y * w + x;
//
// 					// Boundary check: ensure this pixel is within the 'from/to' slice
// 					if (pos < startPixel || pos >= endPixel) continue;
//
// 					const i = pos * 4;
//
// 					// Calculate clip space coordinates
// 					const clipSpaceX = Math.fround((x + 0.5) / (w / 2) - 1);
// 					const clipSpaceY = Math.fround(1 - (y + 0.5) / (h / 2));
//
// 					const color = shader(clipSpaceX, clipSpaceY, uniforms);
//
// 					framebuffer[i] = color[0] * 255;
// 					framebuffer[i + 1] = color[1] * 255;
// 					framebuffer[i + 2] = color[2] * 255;
// 					framebuffer[i + 3] = color[3] * 255;
// 				}
// 			}
// 		}
// 	}
// }
const TILE_SIZE = 8;

export function runShader(framebuffer, shader, uniforms, fromTile, toTile) {
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
