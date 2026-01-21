let shader = null;
let buffers = []; // Store multiple SharedArrayBuffers

self.onmessage = function (e) {
  const { type, data } = e.data;

  if (type === "init") {
    // Data contains an array of buffers
    buffers = data.buffers.map((b) => new Uint8ClampedArray(b));
    shader = new Function(
      "x",
      "y",
      "w",
      "h",
      "t",
      "mx",
      "my",
      data.shaderSource,
    );
    return;
  }

  if (type === "render") {
    const { width, height, startY, endY, t, mx, my, bufferIndex } = data;
    const p = buffers[bufferIndex];
    const s = shader;

    for (let y = startY; y < endY; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const index = (rowOffset + x) << 2;
        const [r, g, b, a] = s(x, y, width, height, t, mx, my);
        p[index] = r;
        p[index + 1] = g;
        p[index + 2] = b;
        p[index + 3] = a;
      }
    }
    self.postMessage({ type: "done", bufferIndex });
  }
};
