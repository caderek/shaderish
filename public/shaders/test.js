import { createArena } from "http://localhost:5173/lib/fast-util.js";
// Assume these are your high-performance, in-place math utils
import { mat4_rotateY, mat4_apply, vec3_dot, vec3_sub } from "./math-utils.js";

const a = createArena({ initialSize: 2048 });

// --- 1. "Uniforms" (Fixed state for the frame) ---
const modelMatrix = a.mat4();
const lightPos = a.vec4(5.0, 5.0, -2.0, 1.0);
const lightColor = a.vec4(1.0, 0.9, 0.7, 1.0);
const baseColor = a.vec4(0.2, 0.5, 0.8, 1.0);

// --- 2. "Scratchpad" (Pre-allocated targets for math) ---
// We never "create" these inside the loop. We just write into them.
const worldPos = a.vec4();
const normal = a.vec4();
const lightDir = a.vec4();
const finalCol = a.vec4();

export function fragment(x, y, t, w, h) {
  const uvX = (x / w) * 2 - 1;
  const uvY = (y / h) * 2 - 1;

  const distSq = uvX * uvX + uvY * uvY;
  if (distSq > 1.0) return 0;

  const uvZ = Math.sqrt(1.0 - distSq);

  // --- MATH BLOCK (Zero-Allocation) ---

  // Rotate the model matrix in-place
  mat4_rotateY(modelMatrix, modelMatrix, t);

  // Set initial position into our scratchpad
  worldPos[0] = uvX;
  worldPos[1] = uvY;
  worldPos[2] = uvZ;
  worldPos[3] = 1.0;

  // Transform: worldPos = modelMatrix * worldPos
  // Note: 'out' is the first or last param depending on your style
  mat4_apply(worldPos, modelMatrix, worldPos);

  // Normal for a sphere at origin is just the position
  // normal = worldPos
  normal.set(worldPos);

  // Direction to light: lightDir = lightPos - worldPos
  vec3_sub(lightDir, lightPos, worldPos);

  // Lighting intensity: dot product
  const intensity = Math.max(0, vec3_dot(normal, lightDir));

  // Final Color calculation
  finalCol[0] = baseColor[0] * lightColor[0] * intensity;
  finalCol[1] = baseColor[1] * lightColor[1] * intensity;
  finalCol[2] = baseColor[2] * lightColor[2] * intensity;
  finalCol[3] = 1.0;

  // Pack the color and reset ALL scratchpads (worldPos, normal, etc.)
  // back to their zeros/initial values for the next pixel.
  return a.pack(finalCol);
}
