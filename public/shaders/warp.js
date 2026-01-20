import { color, normalize } from "https://shaderish.pages.dev/lib/util.js";

/**
 * "Bumped Sinusoidal Warp" (JS Port)
 * Original authour: @Shane -> https://www.shadertoy.com/user/Shane
 * Source: https://www.shadertoy.com/view/4l2XWK
 * License: CC BY-NC-SA 3.0 -> https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en
 *
 * @param {Float32Array} fragColor - output color in [r, g, b, a]
 * @param {number} x - Normalized coordinate (-1 to 1)
 * @param {number} y - Normalized coordinate (-1 to 1)
 * @param {Float32Array} uniformsbuffewr - [time, width, height, ...]
 */
export function fragment(x, y, t, w, h) {
  // 1. Aspect Correction (User's preferred method)
  x = x * (w / h);

  // 2. Coordinate Setup
  // Original: vec3 sp = vec3(uv, 0);
  // We treat z as 0 for surface pos
  let spX = x;
  let spY = y;

  // Original: vec3 rd = normalize(vec3(uv, 1));
  // Ray direction z is 1.0
  const rdLen = Math.sqrt(x * x + y * y + 1.0);
  const rdX = x / rdLen;
  const rdY = y / rdLen;
  const rdZ = 1.0 / rdLen;

  // Light Position: vec3 lp = vec3(cos(iTime)*.5, sin(iTime)*.2, -1);
  const lpX = Math.cos(t) * 0.5;
  const lpY = Math.sin(t) * 0.2;
  const lpZ = -1.0;

  // Plane Normal: vec3 sn = vec3(0, 0, -1);
  let snX = 0.0,
    snY = 0.0,
    snZ = -1.0;

  // 3. Bump Mapping (Finite Differences)
  // vec2 eps = vec2(4./iResolution.y, 0);
  const eps = 4.0 / h;

  const f = bumpFunc(spX, spY, t);
  const fxVal = bumpFunc(spX - eps, spY, t);
  const fyVal = bumpFunc(spX, spY - eps, t); // eps.yx means x=0, y=eps

  const bumpFactor = 0.05;

  // Calculate gradients
  const gx = (fxVal - f) / eps;
  const gy = (fyVal - f) / eps;

  // Perturb Normal
  // sn = normalize(sn + vec3(fx, fy, 0)*bumpFactor);
  snX = snX + gx * bumpFactor;
  snY = snY + gy * bumpFactor;
  // snZ remains -1 + 0

  // Normalize sn
  const snLen = Math.sqrt(snX * snX + snY * snY + snZ * snZ);
  snX /= snLen;
  snY /= snLen;
  snZ /= snLen;

  // 4. Lighting
  // vec3 ld = lp - sp;
  let ldX = lpX - spX;
  let ldY = lpY - spY;
  let ldZ = lpZ - 0.0; // sp.z is 0

  let lDist = Math.sqrt(ldX * ldX + ldY * ldY + ldZ * ldZ);
  lDist = Math.max(lDist, 0.0001);

  // Normalize Light Direction
  ldX /= lDist;
  ldY /= lDist;
  ldZ /= lDist;

  // Attenuation
  let atten = 1.0 / (1.0 + lDist * lDist * 0.15);
  atten *= f * 0.9 + 0.1; // Darken crevices

  // Diffuse
  // dot(sn, ld)
  let diff = Math.max(0, snX * ldX + snY * ldY + snZ * ldZ);
  // Enhancing diffuse
  diff = Math.pow(diff, 4.0) * 0.66 + Math.pow(diff, 8.0) * 0.34;

  // Specular
  // reflect(-ld, sn) -> r = d - 2*dot(d, n)*n
  // Here d is -ld
  const nldX = -ldX;
  const nldY = -ldY;
  const nldZ = -ldZ;
  const dotNLD = nldX * snX + nldY * snY + nldZ * snZ;

  const refX = nldX - 2.0 * dotNLD * snX;
  const refY = nldY - 2.0 * dotNLD * snY;
  const refZ = nldZ - 2.0 * dotNLD * snZ;

  // dot(reflect, -rd)
  const dotSpec = Math.max(0, refX * -rdX + refY * -rdY + refZ * -rdZ);
  const spec = Math.pow(dotSpec, 12.0);

  // 5. Texture Color (Procedural / Textureless fallback)
  // vec3 texCol = smoothFract( W(sp.xy).xyy )*.1 + .2;
  const wRes = W(spX, spY, t);
  // Swizzle .xyy -> x=w0, y=w1, z=w1
  const sf = smoothFract(wRes[0], wRes[1], wRes[1]);

  let texR = sf[0] * 0.1 + 0.2;
  let texG = sf[1] * 0.1 + 0.2;
  let texB = sf[2] * 0.1 + 0.2;

  // 6. Final Color Composition
  // col = (texCol*(diff*vec3(1, .97, .92)*2. + .5) + vec3(1, .6, .2)*spec*2.)*atten;

  // Diffuse part
  const diffR = diff * 1.0 * 2.0 + 0.5;
  const diffG = diff * 0.97 * 2.0 + 0.5;
  const diffB = diff * 0.92 * 2.0 + 0.5;

  // Combine texture and diffuse
  let colR = texR * diffR;
  let colG = texG * diffG;
  let colB = texB * diffB;

  // Add Specular (Orange-ish highlight: 1, .6, .2)
  colR += 1.0 * spec * 2.0;
  colG += 0.6 * spec * 2.0;
  colB += 0.2 * spec * 2.0;

  // Apply Attenuation
  colR *= atten;
  colG *= atten;
  colB *= atten;

  // 7. Faux Environment Mapping (Shiny stuff)
  // ref = max(dot(reflect(rd, sn), vec3(1)), 0.)
  // reflect(rd, sn)
  const dotRD = rdX * snX + rdY * snY + rdZ * snZ;
  const envRefX = rdX - 2.0 * dotRD * snX;
  const envRefY = rdY - 2.0 * dotRD * snY;
  const envRefZ = rdZ - 2.0 * dotRD * snZ;

  // dot(..., vec3(1)) means sum of components
  const refVal = Math.max(0, envRefX + envRefY + envRefZ);
  const refPow = Math.pow(refVal, 4.0);

  // col += col*pow(ref, 4.)*vec3(.25, .5, 1)*3.;
  colR += colR * refPow * 0.25 * 3.0;
  colG += colG * refPow * 0.5 * 3.0;
  colB += colB * refPow * 1.0 * 3.0;

  // 8. Gamma Correction (sqrt)
  return color(Math.sqrt(colR), Math.sqrt(colG), Math.sqrt(colB), 1.0);
}

// --- Helper Functions ---

function fract(x) {
  return x - Math.floor(x);
}

// Helper to handle mod for negative numbers like GLSL
function glslMod(x, y) {
  return x - y * Math.floor(x / y);
}

function length(x, y) {
  return Math.sqrt(x * x + y * y);
}

function smoothFract(x, y, z) {
  // vec3 smoothFract(vec3 x){ x = fract(x); return min(x, x*(1.-x)*12.); }
  let fx = fract(x);
  let fy = fract(y);
  let fz = fract(z);

  return [
    Math.min(fx, fx * (1.0 - fx) * 12.0),
    Math.min(fy, fy * (1.0 - fy) * 12.0),
    Math.min(fz, fz * (1.0 - fz) * 12.0),
  ];
}

// --- The Warp Function ---
// Returns [x, y]
function W(px, py, t) {
  // p = (p + 3.)*4.;
  px = (px + 3.0) * 4.0;
  py = (py + 3.0) * 4.0;

  const time = t / 2.0;

  // Layered sinusoidal feedback
  for (let i = 0; i < 3; i++) {
    // p += cos(p.yx*3. + vec2(t, 1.57))/3.;
    // Note the swizzle p.yx (y is used for x calc, x is used for y calc)
    let oldX = px;
    let oldY = py;

    px += Math.cos(oldY * 3.0 + time) / 3.0;
    py += Math.cos(oldX * 3.0 + 1.57 + time) / 3.0; // 1.57 is approx PI/2

    // p += sin(p.yx + t + vec2(1.57, 0))/2.;
    oldX = px;
    oldY = py;

    px += Math.sin(oldY + time + 1.57) / 2.0;
    py += Math.sin(oldX + time) / 2.0;

    // p *= 1.3;
    px *= 1.3;
    py *= 1.3;
  }

  // Jitter
  // p += fract(sin(p+vec2(13, 7))*5e5)*.03 - .015;
  let sx = Math.sin(px + 13.0) * 500000.0;
  let sy = Math.sin(py + 7.0) * 500000.0;

  px += fract(sx) * 0.03 - 0.015;
  py += fract(sy) * 0.03 - 0.015;

  // return mod(p, 2.) - 1.;
  return [glslMod(px, 2.0) - 1.0, glslMod(py, 2.0) - 1.0];
}

// --- Bump Mapping Function ---
function bumpFunc(px, py, t) {
  const w = W(px, py, t);
  return length(w[0], w[1]) * 0.7071;
}
