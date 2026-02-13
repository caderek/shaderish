export function swap32(val: number) {
  return (
    ((val & 0xff) << 24) | // Move RR to AA position
    ((val & 0xff00) << 8) | // Move GG to BB position
    ((val >> 8) & 0xff00) | // Move BB to GG position
    ((val >> 24) & 0xff) // Move AA to RR position
  );
}
