import path from "node:path";
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
  plugins: [
    {
      name: "watch-sideloaded-code",
      configureServer(server) {
        const foldersToWatch = [
          path.resolve(__dirname, "public/shaders"),
          path.resolve(__dirname, "public/lib"),
        ];

        server.watcher.add(foldersToWatch);

        server.watcher.on("change", (file) => {
          if (foldersToWatch.some((folder) => file.startsWith(folder))) {
            server.ws.send({
              type: "full-reload",
              path: "*",
            });
          }
        });
      },
    },
  ],
});
