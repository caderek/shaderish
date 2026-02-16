import { ayu } from "../../raw-data/text-mode-palettes/ayu.ts";
import { basic } from "../../raw-data/text-mode-palettes/basic.ts";
import { catppuccinLate } from "../../raw-data/text-mode-palettes/catppuccinLate.ts";
import { catppuccinMocha } from "../../raw-data/text-mode-palettes/catppuccinMocha.ts";
import { everforest } from "../../raw-data/text-mode-palettes/everforest.ts";
import { gruvbox } from "../../raw-data/text-mode-palettes/gruvbox.ts";
import { kanagawa } from "../../raw-data/text-mode-palettes/kanagawa.ts";
import { narc } from "../../raw-data/text-mode-palettes/narc.ts";
import { nightOwl } from "../../raw-data/text-mode-palettes/nightOwl.ts";
import { nord } from "../../raw-data/text-mode-palettes/nord.ts";
import { rosePine } from "../../raw-data/text-mode-palettes/rosePine.ts";
import { solarizedDark } from "../../raw-data/text-mode-palettes/solarizedDark.ts";
import { solarizedLight } from "../../raw-data/text-mode-palettes/solarizedLight.ts";
import { sonokai } from "../../raw-data/text-mode-palettes/sonokai.ts";
import { tokyoNight } from "../../raw-data/text-mode-palettes/tokyoNight.ts";
import { PALETTES_BYTE_LENGTH } from "../../romLayout.ts";

export const palettes = Uint32Array.from([
  ...basic,
  ...gruvbox,
  ...catppuccinMocha,
  ...catppuccinLate,
  ...sonokai,
  ...rosePine,
  ...kanagawa,
  ...everforest,
  ...solarizedDark,
  ...solarizedLight,
  ...nord,
  ...tokyoNight,
  ...nightOwl,
  ...ayu,
  ...narc,
]);

export function generatePalettes() {
  if (palettes.byteLength > PALETTES_BYTE_LENGTH) {
    throw new Error("To many palettes defined, max 32 palletes, 64 bytes each");
  }

  const definedPalettes = Buffer.from(palettes.buffer);
  const pallettesBytes = new Uint8Array(PALETTES_BYTE_LENGTH);
  pallettesBytes.set(definedPalettes);

  return Buffer.from(pallettesBytes.buffer);
}
