import { pack } from "https://shaderish.pages.dev/lib/fast-util.js";

// --- PRE-COMPUTATION (Run once) ---
const TABLE_SIZE = 4096;
const sinTable = new Float32Array(TABLE_SIZE);
const PI2 = Math.PI * 2;
for (let i = 0; i < TABLE_SIZE; i++) {
  sinTable[i] = Math.sin((i / TABLE_SIZE) * PI2);
}

// Fast Periodic Lookups
function fastSin(x) {
  return sinTable[((x * (4096 / PI2)) | 0) & 4095];
}

function fastCos(x) {
  return sinTable[(((x + 1.5707) * (4096 / PI2)) | 0) & 4095];
}

export function fragment(pos, t, w, h) {
  let x = pos[0];
  let y = pos[1];
  x = (2 * x - w) / h;
  y = -(2 * y - h) / h;

  const dotUV = Math.fround(x * x + y * y);
  const zVal = Math.fround(4.0 - 4.0 * Math.abs(0.7 - dotUV));

  let f_x = Math.fround(x * zVal);
  let f_y = Math.fround(y * zVal);

  let r = 0,
    g = 0,
    b = 0,
    a = 0;

  // HOT LOOP: Optimized with LUT lookups
  for (let iter = 1; iter <= 8; iter++) {
    const arg_x = f_y * iter + t;
    const arg_y = f_x * iter + iter + t;

    f_x += Math.fround(fastCos(arg_x) / iter + 0.7);
    f_y += Math.fround(fastCos(arg_y) / iter + 0.7);

    const intensity = Math.fround(Math.abs(f_x - f_y));
    const sin_fx = Math.fround(fastSin(f_x) + 1.0);
    const sin_fy = Math.fround(fastSin(f_y) + 1.0);

    r += sin_fx * intensity;
    g += sin_fy * intensity;
    b += sin_fy * intensity;
    a += sin_fx * intensity;
  }

  // FINAL PASS: High-fidelity math (Only runs once per pixel)
  const commonExp = Math.fround(zVal - 4.0);

  r = Math.fround(Math.tanh((7.0 * Math.exp(commonExp + y)) / r));
  g = Math.fround(Math.tanh((7.0 * Math.exp(commonExp - y)) / g));
  b = Math.fround(Math.tanh((7.0 * Math.exp(commonExp - 2.0 * y)) / b));
  a = Math.fround(Math.tanh((7.0 * Math.exp(commonExp)) / a));

  return pack(r, g, b, a);
}
