import { runShader } from "../lib/runShader.js";

let shader = null;
let framebuffer = null;
let size = 0;

onmessage = async (e) => {
	const [type, ...data] = e.data;

	switch (type) {
		case "init": {
			const [buffer, s] = data;
			framebuffer = new Uint8ClampedArray(buffer);
			size = s;
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

			for (const [from, to] of ranges) {
				runShader(framebuffer, size, shader, uniforms, from, to);
			}

			self.postMessage("rendered");

			break;
		}
		default: {
			console.warn(`Message "${type}" is not handled.`);
		}
	}
};
