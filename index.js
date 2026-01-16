import { toClipspace } from "./lib/normalize.js";
import { runShader } from "./lib/runShader.js";

document.querySelector("footer").textContent = `v${APP_VERSION}`;

const ANIMATE = 0;
const MAX_WORKERS = Infinity;
const tileSize = 8;
const adjust = (size) => size * 1;
const MIN_SIZE = (640 * 2) / devicePixelRatio;
const w = adjust(640);
const h = adjust(360);
const scale = MIN_SIZE / w;

const urls = await Promise.all(
	["plasma", "singularity", "rainbow", "warp", "accretion", "phospor"].map(
		createShaderUrl,
	),
);
const url = urls[1];

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
const tileByteSize = tileSize ** 2 * 4;
const tilesPerRow = Math.ceil(w / tileSize);
const tilesPerCol = Math.ceil(h / tileSize);

const tilesCount = tilesPerRow * tilesPerCol;
const framebufferSize = tileByteSize * tilesCount;
const controlbufferSize = 64;
const vramSize = framebufferSize + controlbufferSize;

const vram = crossOriginIsolated
	? new SharedArrayBuffer(vramSize)
	: new ArrayBuffer(vramSize);

const framebuffer = new Uint8ClampedArray(vram, 0, framebufferSize);
const controlbuffer = new Uint8Array(vram, framebufferSize, controlbufferSize);
const staging = crossOriginIsolated
	? new Uint8ClampedArray(frameSize)
	: framebuffer;
const frame = new ImageData(staging, w, h);

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
	tileSize,
	tilesPerRow,
	tilesPerCol,
	tilesCount,
	tileByteSize,
	tilesPerWorker,
	framebufferSize,
	controlbufferSize,
	vramSize,
});

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

	worker.postMessage(["init", vram]);
	worker.postMessage(["loadShader", url]);
});

async function loop(elapsed = 0) {
	if (workersCount > 0) {
		await doneLoad;
	}
	const start = performance.now();
	let done;

	if (workersCount > 0) {
		done = new Promise((resolve) => {
			endRender = resolve;
		});

		workers.forEach((worker, i) =>
			worker.postMessage([
				"runShader",
				{ t: elapsed / 1000, w, h },
				[[i * tilesPerWorker, i * tilesPerWorker + tilesPerWorker]],
			]),
		);
		await done;
		rendered = 0;
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

	if (n % 10 === 0) {
		const taken = performance.now() - start;
		const time = elapsed - prev;
		const fps = time > 0 ? 1000 / time : 0;
		fpsOut.innerText = `FPS: ${fps.toFixed(1)}, Render: ${taken.toFixed(2)}ms, Threads: ${workersCount ?? 1}, Res: ${w}x${h}px`;
		n = 0;
	}

	prev = elapsed;
	n++;

	const sourceView = framebuffer.subarray(0, frameSize);
	staging.set(sourceView);
	ctx.putImageData(frame, 0, 0);
	if (ANIMATE) {
		requestAnimationFrame(loop);
	}
}

loop();
