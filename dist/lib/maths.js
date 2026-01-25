// sin(ok), cos(ok), tan(ok), asin(ok), acos(ok), atan(ok),
// pow(ok), exp(ok), log(ok), sqrt(ok), abs(ok), sign(ok),
// floor(ok), ceil(ok), fract(ok), mod(ok), min(ok), max(ok)
// and clamp(ok).

export function normalize(val) {
  return Math.fround((val + 1) / 2);
}

export function clamp(val, min, max) {
  return Math.fround(val < min ? min : val > max ? max : val);
}

export function mod(num, modulus) {
  return Math.fround(((num % modulus) + modulus) % modulus);
}

export function fract(num) {
  return Math.fround(num - Math.trunc(num));
}

export function step(treshold, num) {
  return Math.fround(num < treshold ? 0.0 : 1.0);
}

export function smoothstep(from, to, num) {
  const t = clamp((num - from) / (to - from), 0, 1);
  return t * t * (3.0 - 2.0 * t);
}
