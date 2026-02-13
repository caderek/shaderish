import { basic } from "./text-mode-palettes/basic.ts";
import { catppuccinLate } from "./text-mode-palettes/catppuccinLate.ts";
import { catppuccinMocha } from "./text-mode-palettes/catppuccinMocha.ts";
import { everforest } from "./text-mode-palettes/everforest.ts";
import { gruvbox } from "./text-mode-palettes/gruvbox.ts";
import { kanagawa } from "./text-mode-palettes/kanagawa.ts";
import { rosePine } from "./text-mode-palettes/rosePine.ts";
import { solarizedDark } from "./text-mode-palettes/solarizedDark.ts";
import { solarizedLight } from "./text-mode-palettes/solarizedLight.ts";
import { sonokai } from "./text-mode-palettes/sonokai.ts";

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
]);

console.log(palettes.byteLength);
