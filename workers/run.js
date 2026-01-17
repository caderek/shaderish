import { runShader } from "../lib/runShader.js";

let shader = null;
let framebuffer = null;
let controlbuffer = null;
let tilesPerRow = 0;
let tilesPerCol = 0;
let chunkLen = 0;

onmessage = async (e) => {
	const [type, ...data] = e.data;

	switch (type) {
		case "init": {
			const [buffer, framebufferSize, controlbufferSize, perRow, perCol] = data;
			framebuffer = new Uint8ClampedArray(buffer, 0, framebufferSize);
			controlbuffer = new Uint32Array(
				buffer,
				framebufferSize,
				controlbufferSize / 4,
			);
			tilesPerRow = perRow;
			tilesPerCol = perCol;
			chunkLen = framebufferSize / (tilesPerRow * tilesPerCol);
			break;
		}
		case "loadShader": {
			const [shaderPath] = data;
			shader = (await import(shaderPath)).fragment;
			self.postMessage("loaded");

			break;
		}
		case "runShader": {
			if (!shader) {
				throw new Error("No shader provided");
			}

			const [uniforms, ranges] = data;

			runShader(
				framebuffer,
				controlbuffer,
				shader,
				uniforms,
				tilesPerRow,
				tilesPerCol,
				chunkLen,
			);

			self.postMessage("rendered");

			break;
		}
		default: {
			console.warn(`Message "${type}" is not handled.`);
		}
	}
};
