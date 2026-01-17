import { runShader } from "../lib/runShader.js";

let shader = null;
let framebuffer = null;
let controlbuffer = null;
let uniformsbuffer = null;
let tilesPerRow = 0;
let tilesPerCol = 0;
let chunkLen = 0;

onmessage = async (e) => {
	const [type, ...data] = e.data;

	switch (type) {
		case "init": {
			const [
				buffer,
				framebufferSize,
				controlbufferSize,
				uniformsbufferSize,
				perRow,
				perCol,
			] = data;
			framebuffer = new Uint8ClampedArray(buffer, 0, framebufferSize);
			controlbuffer = new Int32Array(
				buffer,
				framebufferSize,
				controlbufferSize / 4,
			);
			uniformsbuffer = new Float32Array(
				buffer,
				framebufferSize + controlbufferSize,
				uniformsbufferSize / 4,
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

			runShader(
				framebuffer,
				controlbuffer,
				uniformsbuffer,
				shader,
				tilesPerRow,
				tilesPerCol,
				chunkLen,
			);

			const workersFinished = Atomics.add(controlbuffer, 1, 1);

			if (workersFinished === controlbuffer[2] - 1) {
				Atomics.notify(controlbuffer, 1);
			}

			break;
		}
		default: {
			console.warn(`Message "${type}" is not handled.`);
		}
	}
};
