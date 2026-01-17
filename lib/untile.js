const TILE_SIZE = 8;
const BYTES_PER_PIXEL = 4;

/**
 * Rearranges tiled data into a linear buffer.
 */
export function untile(src, dst, tilesPerRow) {
	const stride = TILE_SIZE * BYTES_PER_PIXEL;

	for (let n = 0; n < src.length / stride; n++) {
		const tile = Math.floor(n / TILE_SIZE);
		const tileX = tile % tilesPerRow;
		const tileY = Math.floor(tile / tilesPerRow);

		const localRow = n % TILE_SIZE;
		const globalY = tileY * TILE_SIZE + localRow;

		const sliceOffset = globalY * tilesPerRow + tileX;
		const srcStart = n * stride;

		dst.set(src.subarray(srcStart, srcStart + stride), sliceOffset * stride);
	}
}
