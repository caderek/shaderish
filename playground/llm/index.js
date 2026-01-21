const CONFIG = {
  width: 1920,
  height: 1080,
  threads: navigator.hardwareConcurrency || 4,
};

// UI Elements
const fpsDiv = document.createElement("div");
fpsDiv.style =
  "position:fixed; top:10px; left:10px; color:lime; font-family:monospace; background:black; padding:5px;";
document.body.appendChild(fpsDiv);

const canvas = document.querySelector("canvas");
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;
const ctx = canvas.getContext("2d", { alpha: false });

// Double Buffering Setup
const buffers = [
  new SharedArrayBuffer(CONFIG.width * CONFIG.height * 4),
  new SharedArrayBuffer(CONFIG.width * CONFIG.height * 4),
];
const sharedViews = buffers.map((b) => new Uint8ClampedArray(b));
const canvasView = new Uint8ClampedArray(CONFIG.width * CONFIG.height * 4);
const imageData = new ImageData(canvasView, CONFIG.width, CONFIG.height);

let currentBufferIndex = 0;
let mouse = { x: 0, y: 0 };
window.onmousemove = (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
};

// Optimization: The Shader
const shaderSource = `
  let nx = x/w, ny = y/h;
  nx = nx * (w/h)
  const nmx = mx/w, nmy = my/h;
  const d = Math.sqrt((nx-nmx)**2 + (ny-nmy)**2);
  const color = Math.sin(d * 10 - t * 0.005) * 127 + 128;
  return [color, color * nx, 255 * ny, 255];
`;

const workers = Array.from(
  { length: CONFIG.threads },
  () => new Worker("worker.js"),
);

// Initialize Workers
workers.forEach((w) =>
  w.postMessage({
    type: "init",
    data: { buffers, shaderSource },
  }),
);

let frameCount = 0;
let lastTime = performance.now();
const rowsPerWorker = Math.floor(CONFIG.height / CONFIG.threads);

function startFrame(time) {
  let finished = 0;
  const writeIdx = currentBufferIndex;

  // FPS Logic (Every 10 frames)
  frameCount++;
  if (frameCount >= 10) {
    const now = performance.now();
    const fps = ((1000 * 10) / (now - lastTime)).toFixed(1);
    fpsDiv.innerText = `FPS: ${fps} | Res: ${CONFIG.width}x${CONFIG.height}`;
    lastTime = now;
    frameCount = 0;
  }

  for (let i = 0; i < CONFIG.threads; i++) {
    workers[i].onmessage = (e) => {
      if (++finished === CONFIG.threads) {
        // Swap buffers: Draw the one we just finished, start next on the other
        canvasView.set(sharedViews[writeIdx]);
        ctx.putImageData(imageData, 0, 0);

        currentBufferIndex = 1 - currentBufferIndex; // Flip 0/1
        requestAnimationFrame(startFrame);
      }
    };

    workers[i].postMessage({
      type: "render",
      data: {
        width: CONFIG.width,
        height: CONFIG.height,
        t: time,
        mx: mouse.x,
        my: mouse.y,
        startY: i * rowsPerWorker,
        endY:
          i === CONFIG.threads - 1 ? CONFIG.height : (i + 1) * rowsPerWorker,
        bufferIndex: writeIdx,
      },
    });
  }
}

requestAnimationFrame(startFrame);
