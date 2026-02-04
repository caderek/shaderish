import fs from "node:fs";
import path from "node:path";

export function readPBM(filePath: string) {
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

readPBM(path.join("public", "textures", "ascii_core.pbm"));
