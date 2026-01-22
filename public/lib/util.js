export function normalize(val) {
  return Math.fround((val + 1) / 2);
}

export function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

export function color(r, g, b, a) {
  r = clamp(r * 255, 0, 255);
  g = clamp(g * 255, 0, 255);
  b = clamp(b * 255, 0, 255);
  a = clamp(a * 255, 0, 255);

  return r | (g << 8) | (b << 16) | (a << 24);
}
