import { color, normalize } from "https://shaderish.pages.dev/lib/util.js";

/**
 * "Liquid Warp" (JS Port)
 * Original authour: @whoadrian -> https://www.shadertoy.com/user/whoadrian
 * Source: https://www.shadertoy.com/view/wtXXD2
 * License: CC BY-NC-SA 3.0 -> https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(x, y, t, w, h) {
  // 1. Coordinate Setup
  // Correct aspect ratio
  const aspect = w / h;
  const uvX = x * 0.5 + 0.5; // 0 to 1 space for vignette
  const uvY = y * 0.5 + 0.5;

  // Scale coordinates for the noise pattern (similar to fragCoord * .004)
  let px = x * aspect * 2.5;
  let py = y * 2.5;

  const time = t * 0.2; // Slow down time slightly

  // 2. Pattern Generation (Domain Warping)
  // q = fbm(p)
  const qx = fbm(px, py);
  const qy = fbm(px + 5.2, py + 1.3);

  // r = fbm(p + 4*q + time)
  // We add offsets directly to p based on q
  const rx = fbm(
    px + 4.0 * qx + 1.7 + 0.15 * time,
    py + 4.0 * qy + 9.2 + 0.15 * time,
  );
  const ry = fbm(
    px + 4.0 * qx + 8.3 + 0.126 * time,
    py + 4.0 * qy + 2.8 + 0.126 * time,
  );

  // g = fbm(p + 4*r + time) ... used for internal color mixing
  // Note: The original GLSL uses 'g' for the final fbm call, but calculates
  // an intermediate vector for mixing.
  const gx = fbm(
    px + 4.0 * rx + 2.0 + time * 0.2,
    py + 4.0 * ry + 6.0 + time * 0.2,
  );
  const gy = fbm(
    px + 4.0 * rx + 5.0 + time * 0.1,
    py + 4.0 * ry + 3.0 + time * 0.1,
  );

  // Final noise value
  const nVal = fbm(px + 4.0 * gx - time * 0.4, py + 4.0 * gy - time * 0.4);

  // 3. Coloring
  // Base color based on main noise
  // mix(vec3(0.1, 0.4, 0.4), vec3(0.5, 0.7, 0.0), smoothstep(...))
  const s1 = smoothstep(0.0, 1.0, nVal);
  let r = mix(0.1, 0.5, s1);
  let g = mix(0.4, 0.7, s1);
  let b = mix(0.4, 0.0, s1);

  // Mix based on 'q' magnitude
  const qDot = qx * qx + qy * qy;
  r = mix(r, 0.35, qDot);
  g = mix(g, 0.0, qDot);
  b = mix(b, 0.1, qDot);

  // Mix based on 'g.y'
  const gyFactor = 0.2 * gy * gy; // approximating g.y from GLSL
  r = mix(r, 0.0, gyFactor);
  g = mix(g, 0.2, gyFactor);
  b = mix(b, 1.0, gyFactor);

  // Mix based on 'r' magnitude (using rx/ry as approximation of g in logic)
  // The original logic is tricky here as it swaps variable names.
  // We emulate the visual density.
  const rDot = smoothstep(0.0, 0.6, 0.6 * (rx * rx + ry * ry));
  r = mix(r, 0.3, rDot);
  g = mix(g, 0.0, rDot);
  b = mix(b, 0.0, rDot);

  // Dark outlines
  let w1 = smoothstep(0.3, 0.5, nVal) * smoothstep(0.5, 0.3, nVal);
  let w2 = smoothstep(0.7, 0.8, nVal) * smoothstep(0.8, 0.7, nVal);
  const outline = 1.0 - Math.max(w1, w2);

  r *= outline;
  g *= outline;
  b *= outline;

  // Contrast
  r *= nVal * 2.0;
  g *= nVal * 2.0;
  b *= nVal * 2.0;

  // Vignette
  // 0.70 + 0.65 * sqrt(70.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
  const vigVal = 70.0 * uvX * uvY * (1.0 - uvX) * (1.0 - uvY);
  const vig = 0.7 + 0.65 * Math.sqrt(Math.max(0, vigVal));

  r *= vig;
  g *= vig;
  b *= vig;

  // 4. Output
  return color(r, g, b, 1.0);
}

// --- Math Helpers ---

const fract = (x) => x - Math.floor(x);
const mix = (x, y, a) => x * (1 - a) + y * a;
const smoothstep = (e0, e1, x) => {
  x = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return x * x * (3 - 2 * x);
};

// --- Noise Functions ---

// Simple hash function to replace the texture lookup
function hash(x, y) {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return fract(v);
}

// Value noise (bilinear interpolation of hash values)
function noise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fract(x);
  const fy = fract(y);

  // Cubic smoothing
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  return mix(mix(a, b, ux), mix(c, d, ux), uy);
}

// Fractal Brownian Motion
function fbm(x, y) {
  let v = 0.0;
  let a = 0.5;

  // Rotation matrix: 0.8, 0.6, -0.6, 0.8
  // We unroll the vector math here for JS performance
  for (let i = 0; i < 6; i++) {
    v += a * noise(x, y);

    // Rotate and scale: p = mtx * p * 2.0
    // Combined scale varies slightly per octave in original,
    // but we approximate to the primary 2.02 scale for simplicity
    const nx = (0.8 * x + 0.6 * y) * 2.02;
    const ny = (-0.6 * x + 0.8 * y) * 2.02;
    x = nx;
    y = ny;

    a *= 0.5;
  }
  return v / 0.96875;
}
