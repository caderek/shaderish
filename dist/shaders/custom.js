import {
  createArena,
  vec4,
} from "https://shaderish.pages.dev/lib/fast-util.js";

const arena = createArena();

const col = arena.alloc(vec4(0, 0, 0.2, 1));
const mul = arena.alloc(vec4(0.5, 0.3, 0.4, 1));

export function fragment(x, y, t, w, h) {
  col[0] = (x + 1) * Math.abs(Math.sin(t)) * mul[0];
  col[1] = y * mul[0];
  col[2] *= mul[0];
  col[3] *= mul[3];

  return arena.pack(col);
}
