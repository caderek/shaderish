import { toClipspace } from "./lib/normalize.js";
import { runShader } from "./lib/runShader.js";
import { accretionFragment } from "./shaders/accretion-fragment.js";
import {
	circleFragment,
	circleBouncingFragment,
} from "./shaders/circle-fragment.js";
import { plasmaFragment } from "./shaders/plasma-fragment.js";
import { singularityFragment } from "./shaders/singularity-fragment.js";

// const fragment = plasmaFragment;
const fragment = singularityFragment;
// const fragment = accretionFragment;

const MIN_SIZE = 720 / devicePixelRatio;
const size = 180;
const scale = size > MIN_SIZE ? 1 : MIN_SIZE / size;

const canvas = document.querySelector("canvas", {
	alpha: false,
	willReadFrequently: false,
});

canvas.width = size;
canvas.height = size;
canvas.style.setProperty("--size", size);
canvas.style.setProperty("--scale", scale);

const fpsOut = document.getElementById("fps");
const ctx = canvas.getContext("2d");

const bufferSize = size ** 2 * 4;
const buffer = crossOriginIsolated
	? new SharedArrayBuffer(bufferSize)
	: new ArrayBuffer(bufferSize);

const framebuffer = new Uint8ClampedArray(buffer);
const staging = crossOriginIsolated
	? new Uint8ClampedArray(bufferSize)
	: framebuffer;
const frame = new ImageData(staging, size, size);

let n = 0;
let prev = 0;

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
	mouseX = toClipspace(e.clientX, 1920);
	mouseY = toClipspace(e.clientY, 1080);
});

console.log({ crossOriginIsolated });

const maxThreads = navigator.hardwareConcurrency ?? 4;
const workersCount = crossOriginIsolated ? maxThreads - 1 : 0;
const chunkSize = Math.trunc(framebuffer.byteLength / (workersCount + 1));

const workers = Array.from(
	{ length: workersCount },
	() =>
		new Worker(new URL("workers/run.js", import.meta.url), { type: "module" }),
);
let rendered = 0;
let end = null;

workers.forEach((worker) => {
	worker.addEventListener("message", (e) => {
		rendered++;

		if (rendered === workersCount) {
			end();
		}
	});

	worker.postMessage(["init", buffer, size]);
});

async function loop(elapsed = 0) {
	const start = performance.now();
	let done;

	if (workersCount > 0) {
		done = new Promise((resolve) => {
			end = resolve;
		});

		workers.forEach((worker, i) =>
			worker.postMessage([
				"runShader",
				{ t: elapsed / 1000 },
				i * chunkSize,
				i * chunkSize + chunkSize,
			]),
		);
	}

	runShader(
		framebuffer,
		size,
		fragment,
		{
			t: elapsed / 1000, // in seconds as most shaders are done!
			mouseX,
			mouseY,
		},
		chunkSize * workersCount,
		framebuffer.byteLength,
	);

	if (workersCount > 0) {
		await done;
		rendered = 0;
	}

	if (n % 10 === 0) {
		const taken = performance.now() - start;
		const time = elapsed - prev;
		const fps = time > 0 ? 1000 / time : 0;
		fpsOut.innerText = `FPS: ${fps.toFixed(1)}, Render: ${taken.toFixed(2)}ms, Threads: ${workersCount + 1}, Res: ${size}px`;
		n = 0;
	}

	prev = elapsed;
	n++;

	staging.set(framebuffer);
	ctx.putImageData(frame, 0, 0);
	requestAnimationFrame(loop);
}

loop();
