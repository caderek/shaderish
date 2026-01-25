import { Arena } from "http://localhost:5173/lib/Arena.js";
import { step, smoothstep, mod } from "http://localhost:5173/lib/maths.js";

const arena = new Arena();

const color = arena.vec4(0, 0, 0, 1);

arena.lock();

function plot(y, val) {
  return smoothstep(val - 0.01, val, y) - smoothstep(val, val + 0.01, y);
}

export function fragment(pos, res, t) {
  let px = pos[0];
  let py = pos[1];
  let w = res[0];
  let h = res[1];
  let x = px / w;
  let y = py / h;

  const scale = 1 / 2;

  const amplitude = 1;
  const fullCycle = Math.PI * 2;
  const frequency = 10;
  // const change = 0;
  const changeA = Math.sqrt(x) * x * Math.log2(x);
  const changeB = Math.sin((x + t * 0.2) * fullCycle * frequency) * amplitude;
  // const change = Math.abs(Math.sin(x * fullCycle * frequency)) * amplitude;
  const line = y + changeA * changeB * scale;
  color[0] = 0;
  color[1] = step(0.5, line);
  color[2] = 0.2;

  return arena.flush(color);
}
