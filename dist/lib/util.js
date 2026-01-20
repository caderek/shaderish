export function normalize(val) {
  return Math.fround((val + 1) / 2);
}

export function color(r, g, b, a) {
  return (255 * r) | ((255 * g) << 8) | ((255 * b) << 16) | ((255 * a) << 24);
}
