import fs from "node:fs";

export function readPbm(filePath: string) {
  const ppm = fs.readFileSync(filePath);
  const sizeStart = ppm.indexOf("\n".charCodeAt(0)) + 1;
  const binStart = ppm.indexOf("\n".charCodeAt(0), sizeStart) + 1;
  const header = ppm.subarray(0, binStart).toString("utf8");
  const [format, size] = header.trim().split("\n");

  const [w, h] = size.split(" ").map(Number);
  const data = ppm.subarray(binStart);

  if (format !== "P4" || Math.ceil(w / 8) * h !== data.length) {
    throw new Error("Incorrect pbm file");
  }

  return { format, w, h, data };
}

export function pbmToFont(
  filePath: string,
  tileH: number,
  invertColors: boolean = false,
) {
  let { data, w, h } = readPbm(filePath);

  if (invertColors) {
    data = data.map((x) => ~x);
  }

  const font = Buffer.alloc(data.length);
  const cols = w / 8;
  const rows = h / 16;

  let i = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (let line = 0; line < tileH; line++) {
        const j = row * cols * tileH + line * cols + col;
        font[i++] = data[j];
      }
    }
  }

  return font;
}

export function printChar(charCode: number, font: Buffer, tileH: number = 16) {
  const offset = charCode * tileH;

  const char = font.subarray(offset, offset + tileH);

  for (const item of char) {
    console.log(
      item
        .toString(2)
        .padStart(8, "0")
        .replaceAll("1", "██")
        .replaceAll("0", "░░"),
    );
  }
}
