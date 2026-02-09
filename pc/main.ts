import { Screen } from "./devices/Screen.ts";
import { ROM } from "./components/ROM.ts";
import { RAM } from "./components/RAM.ts";
import { MMU } from "./components/MMU.ts";
import {
  FRAMEBUFFER_BYTE_LENGTH,
  FRAMEBUFFER_OFFSET,
  MAX_SYSTEM_PAGES,
  TEXT_BUFFER_BYTE_LENGTH,
  TEXT_BUFFER_OFFSET,
} from "./ramLayout.ts";
import { VideoController } from "./components/VideoController.ts";

async function getRomData() {
  const res = await fetch("/data/rom.bin", {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
  return res.arrayBuffer();
}

async function getSplashScreen(textbuffer: Uint8Array) {
  const res = await fetch("/data/splash.txt");
  const text = await res.text();
  const flatText = text.split("\n").join("");

  for (const [i, char] of flatText.split("").entries()) {
    const code = char.charCodeAt(0);
    textbuffer[i * 2] = code;
    textbuffer[i * 2 + 1] = 0b11110000;
  }
}

async function main() {
  const ram = new RAM(2 ** 14); // 16_384 pages, 1 GiB
  const mmu = new MMU(ram);
  const systemMemory = mmu.reserve(MAX_SYSTEM_PAGES, MAX_SYSTEM_PAGES);

  const romData = await getRomData();
  const rom = new ROM(romData, systemMemory);

  console.log({ rom, font: rom.font, frimware: rom.firmware });

  const width = 640 * 1;
  const height = 360 * 1;

  const videoController = new VideoController(systemMemory);
  await getSplashScreen(
    new Uint8Array(
      systemMemory.buffer,
      TEXT_BUFFER_OFFSET,
      TEXT_BUFFER_BYTE_LENGTH,
    ),
  );

  const framebufferView = new Uint8ClampedArray(
    systemMemory.buffer,
    FRAMEBUFFER_OFFSET,
    FRAMEBUFFER_BYTE_LENGTH,
  );

  const screen = new Screen(framebufferView, width, height);

  const $main = document.querySelector("main")!;
  const $footer = document.querySelector("footer")!;

  screen.bind($main);

  let prevT = 0;
  let cycle = 0;

  function loop(t) {
    const start = performance.now();
    // for (let i = 0; i < framebufferView.length; i++) {
    //   framebufferView[i] = Math.floor(Math.random() * 256);
    // }
    videoController.draw();
    screen.refresh();
    const time = performance.now() - start;

    if (cycle == 0) {
      const theoreticalFps = 1000 / time;
      const realFps = 1000 / (t - prevT);
      $footer.textContent =
        `Real FPS: ${realFps.toFixed(1)} | Theoretical FPS: ${theoreticalFps.toFixed(1)} | Render time: ${time.toFixed(1).padStart(2, "0")}ms` +
        `| Heap used: ${(performance.memory.usedJSHeapSize / 2 ** 20).toFixed(1)} MiB | Heap reserved: ${(performance.memory.totalJSHeapSize / 2 ** 20).toFixed(2)} MiB`;
    }

    prevT = t;

    cycle = (cycle + 1) % 20;
    requestAnimationFrame(loop);
  }

  loop(0);
}

main();
