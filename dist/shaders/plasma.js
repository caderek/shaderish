import { pack } from "https://shaderish.pages.dev/lib/fast-util.js";

/**
 * "Plasma" (JS Port)
 * Original authour: @Xor -> https://www.shadertoy.com/user/Xor
 * Source: https://www.shadertoy.com/view/WfS3Dd
 * License: CC BY-NC-SA 3.0 -> https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(pos, t, w, h) {
  let x = pos[0];
  let y = pos[1];
  x = (2 * x - w) / h;
  y = -(2 * y - h) / h;

  // x = Math.fround(x * (w / h));
  // 1. Z-Depth / Vignette
  const dotUV = Math.fround(x * x + y * y);
  const zVal = Math.fround(4.0 - 4.0 * Math.abs(0.7 - dotUV));

  // 2. Initial Fluid Coordinates
  let f_x = Math.fround(x * zVal);
  let f_y = Math.fround(y * zVal);

  let r = 0,
    g = 0,
    b = 0,
    a = 0;

  // 3. The 8-Step Iteration Loop
  for (let iter = 1; iter <= 8; iter++) {
    // Domain Warping Step
    // Note the axis swap (f_y used for new f_x)
    const arg_x = f_y * iter + t;
    const arg_y = f_x * iter + iter + t;

    f_x += Math.fround(Math.cos(arg_x) / iter + 0.7);
    f_y += Math.fround(Math.cos(arg_y) / iter + 0.7);

    // Cumulative Color Calculation
    const intensity = Math.fround(Math.abs(f_x - f_y));
    const sin_fx = Math.fround(Math.sin(f_x) + 1.0);
    const sin_fy = Math.fround(Math.sin(f_y) + 1.0);

    // Map sin results to RGBA channels (xyyx swizzle)
    r += sin_fx * intensity;
    g += sin_fy * intensity;
    b += sin_fy * intensity;
    a += sin_fx * intensity;
  }

  // 4. Final Gradient and Tonemapping
  // We use Math.exp for the vertical color shift and Math.tanh to clamp the glow
  const commonExp = Math.fround(zVal - 4.0);

  // fragColor[0] = Math.fround(Math.tanh((7.0 * Math.exp(commonExp + y)) / r)); // Red (y * -1.0)
  // fragColor[1] = Math.fround(Math.tanh((7.0 * Math.exp(commonExp - y)) / g)); // Green (y * 1.0)
  // fragColor[2] = Math.fround(
  //   Math.tanh((7.0 * Math.exp(commonExp - 2.0 * y)) / b),
  // ); // Blue (y * 2.0)
  // fragColor[3] = Math.fround(Math.tanh((7.0 * Math.exp(commonExp)) / a)); // Alpha (y * 0.0)
  r = Math.fround(Math.tanh((7.0 * Math.exp(commonExp + y)) / r));
  g = Math.fround(Math.tanh((7.0 * Math.exp(commonExp - y)) / g));
  b = Math.fround(Math.tanh((7.0 * Math.exp(commonExp - 2.0 * y)) / b));
  a = Math.fround(Math.tanh((7.0 * Math.exp(commonExp)) / a));

  return pack(r, g, b, a);
}
