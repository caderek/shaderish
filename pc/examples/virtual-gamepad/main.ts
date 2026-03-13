const patterns = {
  strong: [
    [15, 45],
    [20, 40],
    [25, 35],
    [30, 30],
  ],
  weak: [
    [5, 25],
    [10, 20],
    [15, 15],
    [20, 10],
  ],
  both: [
    [15, 20, 5, 20],
    [15, 20, 10, 15],
    [15, 20, 15, 10],
    [15, 20, 20, 5],
    [20, 15, 5, 20],
    [20, 15, 10, 15],
    [20, 15, 15, 10],
    [20, 15, 20, 5],
    [25, 10, 5, 20],
    [25, 10, 10, 15],
    [25, 10, 15, 10],
    [25, 10, 20, 5],
    [30, 5, 5, 20],
    [30, 5, 10, 15],
    [30, 5, 15, 10],
    [30, 5, 20, 5],
  ],
};

/**
 * Simulate gamepad vibration on virtual gamepad
 * via vibration api on mobile devices
 */
function vibrate(params: GamepadEffectParameters) {
  const weak = params.weakMagnitude ?? 0;
  const strong = params.strongMagnitude ?? 0;
  const duration = params.duration ?? 0;

  if ((weak === 0 && strong === 0) || duration === 0) {
    return;
  }

  const delay = params.startDelay ?? 0;

  const weakIndex = Math.min(Math.ceil(weak * 4) - 1, 3);
  const strongIndex = Math.min(Math.ceil(strong * 4) - 1, 3);

  let pattern: number[];

  if (strong === 0) {
    const cycles = Math.ceil(duration / 30);

    pattern = Array.from(
      { length: cycles },
      () => patterns.weak[weakIndex],
    ).flat();
  } else if (weak === 0) {
    const cycles = Math.ceil(duration / 60);

    pattern = Array.from(
      { length: cycles },
      () => patterns.strong[strongIndex],
    ).flat();
  } else {
    const cycles = Math.ceil(duration / 60);
    const bothIndex = (strongIndex << 2) | weakIndex;
    pattern = Array.from(
      { length: cycles },
      () => patterns.both[bothIndex],
    ).flat();
  }

  if (delay === 0) {
    navigator.vibrate(pattern);
    return;
  }

  setTimeout(() => navigator.vibrate(pattern), delay);
}

document.querySelector(".haptic")?.addEventListener("pointerdown", () => {
  navigator.vibrate(15);
});

document.querySelector(".strong")?.addEventListener("pointerdown", () => {
  vibrate({
    weakMagnitude: 0,
    strongMagnitude: 1,
    startDelay: 0,
    duration: 1000,
  });
});

document.querySelector(".weak")?.addEventListener("pointerdown", () => {
  vibrate({
    weakMagnitude: 1,
    strongMagnitude: 0,
    startDelay: 0,
    duration: 1000,
  });
});

document.querySelector(".both")?.addEventListener("pointerdown", () => {
  vibrate({
    weakMagnitude: 1,
    strongMagnitude: 1,
    startDelay: 0,
    duration: 1000,
  });
});
