const BYTES_PER_PIXEL = 4;

/**
 * Rearranges tiled data into a linear buffer.
 */
export function untile(src, dst, tileSizeX, tileSizeY, tilesPerRow) {
	const stride = tileSizeX * BYTES_PER_PIXEL;

	for (let n = 0; n < src.length / stride; n++) {
		const tile = Math.floor(n / tileSizeY);
		const tileX = tile % tilesPerRow;
		const tileY = Math.floor(tile / tilesPerRow);

		const localRow = n % tileSizeY;
		const globalY = tileY * tileSizeY + localRow;

		const sliceOffset = globalY * tilesPerRow + tileX;
		const srcStart = n * stride;

		dst.set(src.subarray(srcStart, srcStart + stride), sliceOffset * stride);
	}
}
