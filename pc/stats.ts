export function initStats($el: HTMLElement) {
  // @ts-ignore
  const memory = performance.memory;

  let prevT = 0;
  let currentT = 0;
  let cycle = 0;
  let renderStart = 0;

  return {
    start(t: number) {
      renderStart = performance.now();
      currentT = t;
    },

    complete() {
      const time = performance.now() - renderStart;

      if (cycle == 0) {
        const theoreticalFps = 1000 / time;
        const realFps = 1000 / (currentT - prevT);
        let text = "";
        text += `Real FPS: ${realFps.toFixed(1)}`;
        text += ` | Theoretical FPS: ${theoreticalFps.toFixed(1)}`;
        text += ` | Render time: ${time.toFixed(1).padStart(2, "0")}ms`;
        if (memory) {
          text += `| Heap used: ${(memory.usedJSHeapSize / 2 ** 20).toFixed(1)} MiB`;
          text += ` | Heap reserved: ${(memory.totalJSHeapSize / 2 ** 20).toFixed(2)} MiB`;
        }

        $el.textContent = text;
      }

      prevT = currentT;
      cycle = (cycle + 1) % 20;
    },
  };
}
