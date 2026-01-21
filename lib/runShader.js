export function runShader(
  framebuffer,
  controlbuffer,
  uniformsbuffer,
  shader,
  tilesPerRow,
  tilesPerCol,
  chunkLen,
) {
  const maxTile = tilesPerRow * tilesPerCol;
  const tileSizeX = controlbuffer[3];
  const tileSizeY = controlbuffer[4];
  const colors = new Uint32Array(framebuffer.buffer, 0);
  const [t, w, h, mx, my] = uniformsbuffer;

  while (true) {
    const tile = Atomics.add(controlbuffer, 0, 1);

    if (tile >= maxTile) {
      return;
    }

    const start = (tile * chunkLen) / 4; // @todo remove the need to divide
    const end = start + chunkLen / 4;

    const tileX = tile % tilesPerRow;
    const tileY = Math.trunc(tile / tilesPerRow);

    for (let i = start, n = 0; i < end; i++, n++) {
      const canvasX = (n % tileSizeX) + tileX * tileSizeX;
      const canvasY = Math.trunc(n / tileSizeX) + tileY * tileSizeY;

      const clipSpaceX = Math.fround((canvasX + 0.5) / (w / 2) - 1);
      const clipSpaceY = Math.fround(1 - (canvasY + 0.5) / (h / 2));

      colors[i] = shader(clipSpaceX, clipSpaceY, t, w, h, mx, my);
    }
  }
}
