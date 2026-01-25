import { clamp } from "./maths.js";

export function pack(a, b, c, d) {
  a = clamp(a * 255, 0, 255);
  b = clamp(b * 255, 0, 255);
  c = clamp(c * 255, 0, 255);
  d = clamp(d * 255, 0, 255);

  return a | (b << 8) | (c << 16) | (d << 24);
}

export function vec4(...args) {
  if (args.length === 0) {
    return new Float32Array([0, 0, 0, 0]);
  }

  if (args.length === 1 && typeof args[0] === "number") {
    return new Float32Array([args[0], args[0], args[0], args[0]]);
  }

  if (args.length === 4) {
    return new Float32Array([...args]);
  }

  let ptr = 0;
  const vec = new Float32Array(4);

  for (const arg of args) {
    if (ptr === vec.length) {
      throw new Error("Vec4 was given to many values");
    }

    if (ArrayBuffer.isView(arg)) {
      if (ptr + arg.length <= vec.length) {
        vec.set(arg, ptr);
        ptr += arg.length;
      } else {
        throw new Error("Vec4 was given to many values");
      }
    } else if (typeof arg === "number") {
      vec[ptr] = arg;
      ptr++;
    } else {
      throw new Error(
        "Vec4 was given incorrect argument type, only number and and other vectors are allowed",
      );
    }
  }

  return vec;
}
