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
import { initStats } from "./stats.ts";

async function getRomData() {
  const res = await fetch("/data/rom.bin", {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
  return res.arrayBuffer();
}

async function getSplashScreen(textbuffer: Uint8Array) {
  const res = await fetch("/data/splash.bin");
  const text = await res.arrayBuffer();
  const buffer = new Uint8Array(text);
  textbuffer.set(buffer, 0);
}

async function main() {
  const ram = new RAM(2 ** 14); // 16_384 pages, 1 GiB
  const mmu = new MMU(ram);
  const systemMemory = mmu.reserve(MAX_SYSTEM_PAGES, MAX_SYSTEM_PAGES);

  const romData = await getRomData();
  const rom = new ROM(romData, systemMemory);

  console.log({
    rom,
    font: rom.font,
    frimware: rom.firmware,
    palettes: rom.palettes,
  });

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
  const stats = initStats($footer);

  screen.bind($main);

  let i = 0;

  function loop(t: number) {
    stats.start(t);

    if (i === 0) {
      videoController.draw();
      screen.refresh();
    }

    stats.complete();
    requestAnimationFrame(loop);

    i = (i + 1) % 1;
  }

  loop(0);
}

main();
