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
  // Run tile by tile until no tiles left, check the next tile from buffer
  // @todo Optimize the empty shader - now it takes 1-2ms, probably becaue of the uniforms serialization and postMessage to run,
  // try using a vram for uniforms and Atomics for signalling to run.
  const colors = new Uint32Array(framebuffer.buffer, 0);
  const [t, w, h] = uniformsbuffer;

  while (true) {
    const tile = Atomics.add(controlbuffer, 0, 1);

    if (tile >= maxTile) {
      return;
    }

    // const start = tile * chunkLen;
    // const end = start + chunkLen;
    const start = (tile * chunkLen) / 4; // @todo remove the need to divide
    const end = start + chunkLen / 4;

    const tileX = tile % tilesPerRow;
    const tileY = Math.trunc(tile / tilesPerRow);

    // for (let i = start, n = 0; i < end; i+=4, n++) {
    for (let i = start, n = 0; i < end; i++, n++) {
      const canvasX = (n % tileSizeX) + tileX * tileSizeX;
      const canvasY = Math.trunc(n / tileSizeX) + tileY * tileSizeY;

      const clipSpaceX = Math.fround((canvasX + 0.5) / (w / 2) - 1);
      const clipSpaceY = Math.fround(1 - (canvasY + 0.5) / (h / 2));

      const color = shader(clipSpaceX, clipSpaceY, t, w, h);

      // framebuffer[i] = color[0] * 255;
      // framebuffer[i + 1] = color[1] * 255;
      // framebuffer[i + 2] = color[2] * 255;
      // framebuffer[i + 3] = color[3] * 255;
      colors[i] = color;
    }
  }
}
