const shaders = [
  "solid",
  "gradient",
  "noise",
  "circle",
  "plasma",
  "singularity",
  "rainbow",
  "liquid",
  "warp",
  "accretion",
  "phosphor",
];

export function setFooter(search) {
  document.querySelector("footer").innerHTML =
    "<p>" +
    shaders
      .map(
        (item) =>
          `<a href="/?shader=${item}&res=${search.get("res") ?? "640x360"}&tile=${search.get("tile") ?? "8x8"}">${item}</a>`,
      )
      .join(" | ") +
    "</p>" +
    "<p>" +
    ["1920x1080", "1280x720", "640x360", "320x180", "160x90"]
      .map(
        (item) =>
          `<a href="/?shader=${search.get("shader") ?? "singularity"}&res=${item}&tile=${search.get("tile") ?? "8x8"}">${item}p</a>`,
      )
      .join(" | ") +
    "</p>" +
    "<p>" +
    [
      "1x1",
      "2x2",
      "4x4",
      "8x8",
      "16x16",
      "32x32",
      "64x64",
      "2x1",
      "4x2",
      "8x4",
      "16x8",
      "32x16",
      "64x32",
    ]
      .map(
        (item) =>
          `<a href="/?shader=${search.get("shader") ?? "singularity"}&res=${search.get("res") ?? "640x360"}&tile=${item}">${item}</a>`,
      )
      .join(" | ") +
    "</p>";
}
