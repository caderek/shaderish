import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp;credentialless",
			"Content-Security-Policy": "connect-src 'self'; worker-src 'self';",
		},
	},
	define: {
		APP_VERSION: JSON.stringify(pkg.version),
	},
});
