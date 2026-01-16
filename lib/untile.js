// const TILE_SIZE = 8;
// /**
//  * Rearranges 8x8 tiled data into a linear buffer.
//  * @param {Uint8Array} src - The source tiled buffer view.
//  * @param {Uint8Array} dst - The destination linear buffer view.
//  * @param {number} tilesPerRow - Total tiles per row
//  * @param {number} tilesPerCol - Total tiles per row
//  */
// export function untile(src, dst, tilesPerRow, tilesPerCol) {
// 	const stride = TILE_SIZE * 4;
//
// 	let z = 0;
// 	for (let i = 0, n = 0; i < src.length; i += stride, n++) {
// 		const tile = Math.trunc(n / TILE_SIZE);
// 		const lineX = Math.trunc(n / TILE_SIZE) % tilesPerRow;
// 		const lineY = n % TILE_SIZE;
// 		const tileRow = Math.trunc(tile / tilesPerRow);
// 		const slice = src.subarray(i, i + stride);
// 		const offset = lineY * tilesPerRow + lineX + tileRow * tileRow * TILE_SIZE;
// 		console.log({ n, tile, lineX, lineY, offset, tileRow });
// 		dst.set(slice, stride * offset);
// 		z++;
// 	}
// }

const TILE_SIZE = 8;
const BYTES_PER_PIXEL = 4; // Assuming RGBA based on your stride

/**
 * Rearranges 8x8 tiled data into a linear buffer.
 */
export function untile(src, dst, tilesPerRow, tilesPerCol) {
	const stride = TILE_SIZE * BYTES_PER_PIXEL; // 32 bytes

	for (let n = 0; n < src.length / stride; n++) {
		// 1. Which tile are we in?
		const tileIdx = Math.floor(n / TILE_SIZE);
		const tileX = tileIdx % tilesPerRow;
		const tileY = Math.floor(tileIdx / tilesPerRow);

		// 2. Which row inside that tile are we on? (0-7)
		const localRow = n % TILE_SIZE;

		// 3. Calculate the global Y coordinate (which pixel row in the whole image)
		const globalY = tileY * TILE_SIZE + localRow;

		/**
		 * 4. Calculate the offset:
		 * (Current Global Row * Tiles in a Row) + Current Tile X
		 * We multiply by stride at the end to convert "slice index" to "byte index"
		 */
		const sliceOffset = globalY * tilesPerRow + tileX;

		const srcStart = n * stride;
		dst.set(src.subarray(srcStart, srcStart + stride), sliceOffset * stride);
	}
}
