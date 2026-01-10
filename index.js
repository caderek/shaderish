import {
	circleFragment,
	circleBouncingFragment,
} from "./shaders/circle-fragment.js";

const size = 360; // 32;
const scale = 1; // 24

const canvas = document.querySelector("canvas");
canvas.width = size;
canvas.height = size;
canvas.style.setProperty("--size", size);
canvas.style.setProperty("--scale", scale);

const fpsOut = document.getElementById("fps");
const ctx = canvas.getContext("2d");

const bufferSize = size ** 2 * 4;
const data = new Uint8ClampedArray(bufferSize, size);
const frame = new ImageData(data, size, size);

function step(shader, uniforms) {
	for (let i = 0; i < bufferSize; i += 4) {
		const pos = i / 4;
		const x = pos % size;
		const y = Math.floor(pos / size);
		const clipSpaceX = (x + 0.5) / (size / 2) - 1;
		const clipSpaceY = 1 - (y + 0.5) / (size / 2);

		const [r, g, b, a] = shader(clipSpaceX, clipSpaceY, uniforms);

		data[i] = r * 255;
		data[i + 1] = g * 255;
		data[i + 2] = b * 255;
		data[i + 3] = a * 255;
	}
}

let n = 0;
let prev = 0;

// function fragmentShader(x, y, uniforms) {
// 	return [
// 		normalize(x),
// 		normalize(Math.sin(Math.floor(uniforms.t) / 1000)),
// 		normalize(y),
// 		1,
// 	];
// }

// function smoothstep(edge0, edge1, x) {
// 	const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
// 	return t * t * (3 - 2 * t);
// }
//
// function fragmentShader(x, y, uniforms) {
// 	const dist = Math.hypot(x, y);
//B
// 	// Smoothly transition from 0 to 1 over a tiny distance (0.02)
// 	// This creates "Soft Edges"
// 	const radius = 0.5;
// 	const softness = 0.02;
// 	const alpha = smoothstep(radius, radius - softness, dist);
//
// 	return [alpha, alpha, alpha, 1];
// }

function loop(elapsed = 0) {
	const start = performance.now();
	step(circleBouncingFragment, { t: elapsed });

	if (n % 10 === 0) {
		const taken = performance.now() - start;
		const time = elapsed - prev;
		const fps = 1000 / time;
		fpsOut.innerText = `FPS: ${fps.toFixed(1)}, Render: ${taken.toFixed(2)}ms`;
		n = 0;
	}

	prev = elapsed;
	n++;

	ctx.putImageData(frame, 0, 0);
	requestAnimationFrame(loop);
}

loop();
