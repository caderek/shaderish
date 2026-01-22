export function normalize(val) {
  return Math.fround((val + 1) / 2);
}

export function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

export function createArena({ initalSize, maxSize } = {}) {
  const len = initalSize ?? 64; // 1 cache line
  const maxByteLength = maxSize ?? 1048576; // 1 MB
  let ptr = 0;

  // We need two buffers and their views, one to be freely modified
  // by user throgh allocated typed arrays, and a backup one to store
  // only the inital values, to restore for each fragment
  const buffer = new ArrayBuffer(len, { maxByteLength });
  const initialBuffer = new ArrayBuffer(len, { maxByteLength });
  const bytes = new Uint8Array(buffer);
  const initialBytes = new Uint8Array(initialBuffer);
  let resetView = initialBytes.subarray(0, ptr);

  return {
    alloc(item) {
      if (!ArrayBuffer.isView(item)) {
        throw new Error("Arena can only store TypedArray or DataView");
      }

      const requiredBytes = ptr + item.byteLength;

      if (requiredBytes > buffer.byteLength) {
        resizeBuffer(buffer, requiredBytes);
        resizeBuffer(initialBuffer, requiredBytes);
      }

      // Make a bytes view, to set underlying values properly,
      // without this, you would assign for example floats to bytes
      const itemAsBytes = new Uint8Array(
        item.buffer,
        item.byteOffset,
        item.byteLength,
      );

      bytes.set(itemAsBytes, ptr);
      initialBytes.set(itemAsBytes, ptr);

      const binded = new item.constructor(buffer, ptr, item.length);

      ptr += item.byteLength;
      resetView = initialBytes.subarray(0, ptr);

      return binded;
    },

    pack(vec) {
      const col = pack(vec[0], vec[1], vec[2], vec[3]);
      bytes.set(resetView); // not using this.reset is a bit faster
      return col;
    },

    reset() {
      bytes.set(resetView);
    },

    // Warning - do not use allocated arrays after clear, as new allocations will override the old ones!
    // this is by design, you should call clear() only when you are done with the previous data.
    clear() {
      bytes.fill(0, 0, ptr);
      initialBytes.fill(0, 0, ptr);
      ptr = 0;
      resetView = initialBytes.subarray(0, 0);
    },

    get ptr() {
      return ptr;
    },

    get size() {
      return buffer.byteLength;
    },
  };
}

function resizeBuffer(buffer, requredBytes) {
  const newLen = 2 ** Math.ceil(Math.log2(requredBytes));

  if (newLen <= buffer.maxByteLength) {
    buffer.resize(newLen);
  } else {
    throw new Error(
      `Maximum size (${MAX_ARENA_LENGTH} bytes) for the shader vectors and matrices exceeded!`,
    );
  }
}

export function pack(a, b, c, d) {
  a = clamp(a * 255, 0, 255);
  b = clamp(b * 255, 0, 255);
  c = clamp(c * 255, 0, 255);
  d = clamp(d * 255, 0, 255);

  return a | (b << 8) | (c << 16) | (d << 24);
}

export function vec4(a, b, c, d) {
  return new Float32Array([a, b, c, d], 4);
}
