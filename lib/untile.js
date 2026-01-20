// @todo Make workers write directly to the dst??
const BYTES_PER_PIXEL = 4;
export function untile(src, dst, tileSizeX, tileSizeY, tilesPerRow) {
  const BYTES_PER_PIXEL = 4;

  // Calculate how many tiles there are vertically
  const totalPixels = src.length / BYTES_PER_PIXEL;
  const pixelsPerTile = tileSizeX * tileSizeY;
  const totalTiles = totalPixels / pixelsPerTile;
  const tilesPerCol = totalTiles / tilesPerRow;

  // Use 32-bit views to move 4 bytes at a time
  const src32 = new Uint32Array(src.buffer, src.byteOffset, totalPixels);
  const dst32 = new Uint32Array(
    dst.buffer,
    dst.byteOffset,
    dst.length / BYTES_PER_PIXEL,
  );

  const imgWidth = tilesPerRow * tileSizeX;
  let srcPtr = 0;

  for (let ty = 0; ty < tilesPerCol; ty++) {
    for (let tx = 0; tx < tilesPerRow; tx++) {
      // Starting position of this tile in the linear destination
      const destTileBase = ty * tileSizeY * imgWidth + tx * tileSizeX;

      for (let y = 0; y < tileSizeY; y++) {
        const destRowStart = destTileBase + y * imgWidth;

        // Copy the row of the tile
        for (let x = 0; x < tileSizeX; x++) {
          dst32[destRowStart + x] = src32[srcPtr++];
        }
      }
    }
  }
}
