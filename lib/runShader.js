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
  const varyingsBuffer = new ArrayBuffer(16);
  const pos = new Float32Array(varyingsBuffer, 0, 4);
  const t = uniformsbuffer[0];
  const res = new Float32Array([uniformsbuffer[1], uniformsbuffer[2]]);
  const mouse = new Float32Array([uniformsbuffer[3], uniformsbuffer[4]]);

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
      // const x = (n % tileSizeX) + tileX * tileSizeX + 0.5;
      // const y = Math.trunc(n / tileSizeX) + tileY * tileSizeY + 0.5;
      pos[0] = (n % tileSizeX) + tileX * tileSizeX + 0.5;
      pos[1] = Math.trunc(n / tileSizeX) + tileY * tileSizeY + 0.5;

      colors[i] = shader(pos, res, t, mouse);
      // colors[i] = shader(x, y, t, w, h, mx, my);
    }
  }
}
