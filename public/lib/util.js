export function normalize(val) {
  return Math.fround((val + 1) / 2);
}

export function color(r, g, b, a) {
  r = Math.max(0, Math.min(r * 255, 255));
  g = Math.max(0, Math.min(g * 255, 255));
  b = Math.max(0, Math.min(b * 255, 255));
  a = Math.max(0, Math.min(a * 255, 255));

  return r | (g << 8) | (b << 16) | (a << 24);
}
