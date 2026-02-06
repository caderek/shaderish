import { Screen } from "./devices/Screen.ts";
import { ROM } from "./components/ROM.ts";

async function getRomData() {
  const res = await fetch("/data/rom.bin", {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
  return res.arrayBuffer();
}

async function main() {
  const romData = await getRomData();
  const rom = new ROM(romData);
  console.log({ rom, font: rom.font, bootloader: rom.bootloader });

  const width = 640 * 1;
  const height = 360 * 1;

  const buff = new Uint8ClampedArray(width * height * 4);
  const screen = new Screen(buff, width, height);

  screen.bind(document.body);

  function loop() {
    for (let i = 0; i < buff.length; i++) {
      buff[i] = Math.floor(Math.random() * 256);
    }
    screen.refresh();
    //requestAnimationFrame(loop);
  }

  loop();
}

main();
