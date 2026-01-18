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

const shaders = [
	"solid",
	"gradient",
	"dirtytiles",
	"circle",
	"plasma",
	"singularity",
	"rainbow",
	"liquid",
	"warp",
	"accretion",
	"phosphor",
];

const search = new URLSearchParams(location.search);

const scaleFactor = Number(search.get("factor") ?? "1");
const shaderName = search.get("shader") ?? "plasma";

const [tileSizeX, tileSizeY] = (search.get("tile") ?? "8x8")
	.split("x")
	.map(Number);

const url = await createShaderUrl(shaderName);

document.querySelector("footer").innerHTML =
	"<p>" +
	shaders
		.map(
			(item) =>
				`<a href="/?shader=${item}&factor=${search.get("factor") ?? "1"}&tile=${search.get("tile") ?? "8x8"}">${item}</a>`,
		)
		.join(" | ") +
	"</p>" +
	"<p>" +
	[1, 2, 4, 8]
		.map(
			(item) =>
				`<a href="/?shader=${search.get("shader") ?? "singularity"}&factor=${item}&tile=${search.get("tile") ?? "8x8"}">1 / ${item}</a>`,
		)
		.join(" | ") +
	"</p>" +
	"<p>" +
	[
		"1x1",
		"2x2",
		"4x4",
		"8x8",
		"16x16",
		"32x32",
		"64x64",
		"1x2",
		"2x4",
		"4x8",
		"8x16",
		"16x32",
		"32x64",
	]
		.map(
			(item) =>
				`<a href="/?shader=${search.get("shader") ?? "singularity"}&factor=${search.get("factor") ?? 1}&tile=${item}">${item}</a>`,
		)
		.join(" | ") +
	"</p>";

const ANIMATE = 1;
const MAX_WORKERS = 4; //Infinity;
const adjust = (size) => size / scaleFactor;
const MIN_SIZE = (320 * 4) / devicePixelRatio;
const w = adjust(640);
const h = adjust(360);
// const MIN_SIZE = 512 / devicePixelRatio;
// const w = adjust(512);
// const h = adjust(512);
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
const controlbufferSize = 64;
const uniformsbufferSize = 64;
const vramSize = framebufferSize + controlbufferSize + uniformsbufferSize;

const vram = crossOriginIsolated
	? new SharedArrayBuffer(vramSize)
	: new ArrayBuffer(vramSize);

const framebuffer = new Uint8ClampedArray(vram, 0, framebufferSize);
const controlbuffer = new Int32Array(
	vram,
	framebufferSize,
	controlbufferSize / 4,
);
const uniformsbuffer = new Float32Array(
	vram,
	framebufferSize + controlbufferSize,
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
		// done = new Promise((resolve) => {
		// 	endRender = resolve;
		// });

		workers.forEach((worker, i) => worker.postMessage(["runShader"]));
		await Atomics.waitAsync(controlbuffer, CONTROL_BUFFER.workersDone, 0).value;
		// await done;
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

	if (n % 10 === 0) {
		const taken = performance.now() - start;
		const time = elapsed - prev;
		const fps = time > 0 ? 1000 / time : 0;
		fpsOut.innerText = `FPS: ${fps.toFixed(1)}, Render: ${taken.toFixed(2)}ms, Threads: ${workersCount ?? 1}, Res: ${w}x${h}px, Tile: ${tileSizeX}x${tileSizeY}`;
		n = 0;
	}

	prev = elapsed;
	n++;

	// const sourceView = framebuffer.subarray(0, frameSize);
	// staging.set(sourceView);
	untile(framebuffer, staging, tileSizeX, tileSizeY, tilesPerRow, tilesPerCol);
	ctx.putImageData(frame, 0, 0);
	if (ANIMATE) {
		requestAnimationFrame(loop);
	}
}

loop();
