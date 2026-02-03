/**
 * Renders a pixel buffer to a WebGL2 canvas with nearest-neighbor scaling.
 * @param {HTMLCanvasElement} canvas - The target canvas.
 * @param {Uint8Array|Uint8ClampedArray} data - RGBA pixel data.
 * @param {number} width - Source buffer width.
 * @param {number} height - Source buffer height.
 * @param {number} scale - Display scale (e.g., 3 for 3x).
 */
export const renderToWebGL = (function () {
  const glStates = new WeakMap();

  return function (canvas, data, width, height, scale) {
    let state = glStates.get(canvas);

    // 1. Initialize WebGL2 context and shaders for this canvas if not already done
    if (!state) {
      const gl = canvas.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
        alpha: false,
        preserveDrawingBuffer: false,
      });

      if (!gl) throw new Error("WebGL2 not supported");

      const vs = `#version 300 es
                in vec2 p; out vec2 u;
                void main() { gl_Position = vec4(p * 2.0 - 1.0, 0, 1); u = vec2(p.x, 1.0 - p.y); }`;
      const fs = `#version 300 es
                precision highp float;
                uniform sampler2D t; in vec2 u; out vec4 c;
                void main() { c = texture(t, u); }`;

      const createShader = (t, s) => {
        const sh = gl.createShader(t);
        gl.shaderSource(sh, s);
        gl.compileShader(sh);
        return sh;
      };

      const prog = gl.createProgram();
      gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        gl.STATIC_DRAW,
      );

      const pos = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      state = { gl, tex, width: 0, height: 0 };
      glStates.set(canvas, state);
    }

    const gl = state.gl;

    // 2. Handle Canvas Resizing
    const targetW = width * scale;
    const targetH = height * scale;
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      gl.viewport(0, 0, targetW, targetH);
    }

    // 3. Update Texture
    gl.bindTexture(gl.TEXTURE_2D, state.tex);

    // If dimensions changed, we must use texImage2D to reallocate
    if (state.width !== width || state.height !== height) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data,
      );
      state.width = width;
      state.height = height;
    } else {
      // texSubImage2D is faster for frame-by-frame updates of the same size
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data,
      );
    }

    // 4. Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
})();

/**
 * Renders a pixel buffer to a WebGL2 canvas using Asynchronous PBOs.
 * Fixed for immediate visibility and robust texture allocation.
 */
export const renderWithPBO = (function () {
  const glStates = new WeakMap();

  return function (canvas, data, width, height, scale) {
    let s = glStates.get(canvas);

    // 1. INITIALIZATION
    if (!s) {
      const gl = canvas.getContext("webgl2", {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
      });
      if (!gl) throw new Error("WebGL2 not supported");

      const vsSrc = `#version 300 es
                layout(location=0) in vec2 p; out vec2 u;
                void main() { gl_Position = vec4(p*2.0-1.0, 0, 1); u = vec2(p.x, 1.0-p.y); }`;
      const fsSrc = `#version 300 es
                precision highp float; uniform sampler2D t; in vec2 u; out vec4 c;
                void main() { c = texture(t, u); }`;

      const compile = (type, src) => {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        return sh;
      };

      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      // Set the sampler to use Texture Unit 0
      gl.uniform1i(gl.getUniformLocation(prog, "t"), 0);

      const quadBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      // Pre-allocate immutable storage for the texture
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);

      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

      const pbos = [gl.createBuffer(), gl.createBuffer()];
      const size = width * height * 4;
      pbos.forEach((b) => {
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, b);
        gl.bufferData(gl.PIXEL_UNPACK_BUFFER, size, gl.STREAM_DRAW);
      });

      s = { gl, tex, pbos, index: 0, w: width, h: height, firstFrame: true };
      glStates.set(canvas, s);
    }

    const { gl, tex, pbos, w, h } = s;

    // 2. DIMENSION/SCALE CHECK
    if (canvas.width !== width * scale || canvas.height !== height * scale) {
      canvas.width = width * scale;
      canvas.height = height * scale;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const uploadData =
      data instanceof Uint8Array
        ? data
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    if (s.firstFrame) {
      // First frame: Direct upload to avoid black flicker
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        uploadData,
      );
      s.firstFrame = false;
    } else {
      // PBO Shuffle
      const writeIdx = s.index;
      const readIdx = (s.index + 1) % 2;

      // Step A: Upload data to the "Write" PBO
      gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pbos[writeIdx]);
      gl.bufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, uploadData);

      // Step B: Update texture from the "Read" PBO (last frame's data)
      gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pbos[readIdx]);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        0,
      );

      s.index = readIdx;
    }

    // 3. DRAW
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Cleanup state
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
  };
})();
