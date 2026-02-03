import { Arena } from "http://localhost:5173/lib/Arena.js";
import { step, smoothstep, mod } from "http://localhost:5173/lib/maths.js";

const arena = new Arena();
const color = arena.vec4(0, 0, 0, 1);
const mask = arena.fixed.vec4(1, 1, 0, 1);
const cam = arena.fixed.vec2(1, 0.4);
arena.lock();

const amplitude = 1;
const fullCycle = Math.PI * 2;
const frequency = 8;
const animationFps = 5; // 5 fps gives that stop-motion retro style

export function fragment(pos, res, t) {
  let px = pos[0];
  let py = pos[1];
  let w = res[0];
  let h = res[1];
  let x = px / w;
  let y = py / h;

  const scale = 1 / 2;

  // const t2 = Math.floor(t * animationFps) / animationFps;
  const t2 = t;
  const changeA = Math.sqrt(x) * x * Math.log2(x);
  const changeB = Math.sin((x + t2 * 0.2) * fullCycle * frequency) * amplitude;
  const line = y + changeA * changeB * scale;
  const fuzz = 0.01;
  const val = step(0.5, line);
  // const val = smoothstep(0.5 - fuzz, 0.5 + fuzz, line);
  color[0] = 0;
  color[1] = val;
  color[2] = 0.2;

  return arena.flush(color);
}
