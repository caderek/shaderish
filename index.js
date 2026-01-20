import { setFooter } from "./setFooter.js";
import { toClipspace } from "./lib/normalize.js";
import { runShader } from "./lib/runShader.js";
import { untile } from "./lib/untile.js";

document.querySelector("footer").textContent = `v${APP_VERSION}`;

const CONTROL_BUFFER = {
  tileCounter: 0,
  workersDone: 1,
  workersCount: 2,
  tileSizeX: 3,
  tileSizeY: 4,
};

const search = new URLSearchParams(location.search);

setFooter(search);

const [w, h] = (search.get("res") ?? "640x360").split("x").map(Number);

const shaderName = search.get("shader") ?? "plasma";

const [tileSizeX, tileSizeY] = (search.get("tile") ?? "8x8")
  .split("x")
  .map(Number);

const url = await createShaderUrl(shaderName);

const ANIMATE = 1;
const MAX_WORKERS = Infinity;
const MULTIPLE = Math.floor(window.innerWidth / 320);
const MIN_SIZE = 320 * MULTIPLE;
const scale = MIN_SIZE / w;

const canvas = document.querySelector("canvas", {
  alpha: false,
  willReadFrequently: false,
});

canvas.width = w;
canvas.height = h;
canvas.style.setProperty("--width", w);
canvas.style.setProperty("--scale", scale);
canvas.style.setProperty("--ratio", `${w} / ${h}`);

const fpsOut = document.getElementById("fps");
const ctx = canvas.getContext("2d");

async function createShaderUrl(name) {
  const blob = await fetch(`/shaders/${name}.js`).then((res) => res.blob());
  const file = new File([blob], "shader.js", {
    type: "application/javascript",
  });

  return URL.createObjectURL(file);
}

function randomElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

const frameSize = w * h * 4;
const tileByteSize = tileSizeX * tileSizeY * 4;
const tilesPerRow = Math.ceil(w / tileSizeX);
const tilesPerCol = Math.ceil(h / tileSizeY);

const tilesCount = tilesPerRow * tilesPerCol;
const framebufferSize = tileByteSize * tilesCount;
const paddingSize = 0;
const controlbufferSize = 64;
const uniformsbufferSize = 64;
const vramSize =
  framebufferSize +
  paddingSize +
  controlbufferSize +
  paddingSize +
  uniformsbufferSize;

const vram = crossOriginIsolated
  ? new SharedArrayBuffer(vramSize)
  : new ArrayBuffer(vramSize);

const framebuffer = new Uint8ClampedArray(vram, 0, framebufferSize);
const controlbuffer = new Int32Array(
  vram,
  framebufferSize + paddingSize,
  controlbufferSize / 4,
);
const uniformsbuffer = new Float32Array(
  vram,
  framebufferSize + controlbufferSize + paddingSize * 2,
  uniformsbufferSize / 4,
);
const staging = crossOriginIsolated
  ? new Uint8ClampedArray(framebufferSize)
  : framebuffer;
const frame = new ImageData(staging.subarray(0, frameSize), w, h);

let n = 0;
let prev = 0;

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = toClipspace(e.clientX, 1920);
  mouseY = toClipspace(e.clientY, 1080);
});

const maxThreads = navigator.hardwareConcurrency ?? 4;
const workersCount = Math.min(
  crossOriginIsolated ? maxThreads : 0,
  MAX_WORKERS,
);
const tilesPerWorker = Math.ceil(tilesCount / workersCount);
console.log({ crossOriginIsolated });
console.log({ threads: workersCount > 0 ? workersCount : 1 });
console.table({
  w,
  h,
  tileSizeX,
  tileSizeY,
  tilesPerRow,
  tilesPerCol,
  tilesCount,
  tileByteSize,
  tilesPerWorker,
  framebufferSize,
  controlbufferSize,
  vramSize,
});
console.log(vram);

const workers = Array.from(
  { length: workersCount },
  () =>
    new Worker(new URL("workers/run.js", import.meta.url), { type: "module" }),
);
let rendered = 0;
let loaded = 0;
let endRender = null;
let endLoad = null;
let doneLoad = new Promise((resolve) => {
  endLoad = resolve;
});

const shader = (await import(url)).fragment;

workers.forEach((worker) => {
  worker.addEventListener("message", (e) => {
    switch (e.data) {
      case "rendered": {
        rendered++;

        if (rendered === workersCount) {
          endRender();
        }
        break;
      }
      case "loaded": {
        loaded++;

        if (loaded === workersCount) {
          endLoad();
        }
        break;
      }
    }
  });

  worker.postMessage([
    "init",
    vram,
    framebufferSize,
    controlbufferSize,
    uniformsbufferSize,
    paddingSize,
    tilesPerRow,
    tilesPerCol,
  ]);
  worker.postMessage(["loadShader", url]);
});

controlbuffer[CONTROL_BUFFER.workersCount] = workersCount;
controlbuffer[CONTROL_BUFFER.tileSizeX] = tileSizeX;
controlbuffer[CONTROL_BUFFER.tileSizeY] = tileSizeY;

async function loop(elapsed = 0) {
  if (workersCount > 0) {
    await doneLoad;
  }
  const start = performance.now();
  uniformsbuffer[0] = elapsed / 1000;
  uniformsbuffer[1] = w;
  uniformsbuffer[2] = h;
  // uniformsbuffer[3] = mouseX;
  // uniformsbuffer[4] = mouseY;

  if (workersCount > 0) {
    workers.forEach((worker, i) => worker.postMessage(["runShader"]));
    await Atomics.waitAsync(controlbuffer, CONTROL_BUFFER.workersDone, 0).value;
    rendered = 0;
    controlbuffer[CONTROL_BUFFER.tileCounter] = 0;
    controlbuffer[CONTROL_BUFFER.workersDone] = 0;
  } else {
    runShader(
      framebuffer,
      shader,
      {
        t: elapsed / 1000, // in seconds as most shaders are done!
        w,
        h,
        mouseX,
        mouseY,
      },
      0,
      tilesCount,
    );
  }

  const mid = performance.now();
  untile(framebuffer, staging, tileSizeX, tileSizeY, tilesPerRow, tilesPerCol);
  ctx.putImageData(frame, 0, 0);

  if (n % 10 === 0) {
    const end = performance.now();
    const takenShader = mid - start;
    const takenClone = end - mid;
    const takenAll = takenShader + takenClone;
    const time = elapsed - prev;
    const fps = time > 0 ? 1000 / time : 0;
    fpsOut.innerText = `FPS: ${fps.toFixed(1)}, All: ${takenAll.toFixed(2).padStart(5, "0")}ms, Shader: ${takenShader.toFixed(2).padStart(5, "0")}ms, Clone: ${takenClone.toFixed(2).padStart(5, "0")}ms, Threads: ${workersCount ?? 1}, Res: ${w}x${h}px, Tile: ${tileSizeX}x${tileSizeY}`;
    n = 0;
  }

  prev = elapsed;
  n++;

  // const sourceView = framebuffer.subarray(0, frameSize);
  // staging.set(sourceView);
  if (ANIMATE) {
    requestAnimationFrame(loop);
  }
}

loop();
