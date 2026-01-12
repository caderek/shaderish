import { runShader } from "../lib/runShader.js";
import { singularityFragment } from "../shaders/singularity-fragment.js";
import { accretionFragment } from "../shaders/accretion-fragment.js";
const shader = singularityFragment;
// const shader = accretionFragment;
let framebuffer = null;
let size = 0;

onmessage = (e) => {
	const [type, ...data] = e.data;

	switch (type) {
		case "init": {
			const [buffer, s] = data;
			framebuffer = new Uint8ClampedArray(buffer);
			size = s;
			console.log("Configured shared framebuffer");
			break;
		}
		case "runShader": {
			const [uniforms, from, to] = data;
			runShader(framebuffer, size, shader, uniforms, from, to);
			self.postMessage("rendered");

			break;
		}
		default: {
			console.warn(`Message "${type}" is not handled.`);
		}
	}
};
