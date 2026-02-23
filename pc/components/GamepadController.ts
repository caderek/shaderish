/* Gamepad memory layout:

  digital input 2 bytes (16 flags,  1 bit on/off, 15 bits of buttons)

    Uint16             - Binary flags:

    0b0000000000000001 - on/off      (on if the gamepad is connected)
    0b0000000000000010 - Button 0    (A / cross)
    0b0000000000000100 - Button 1    (B / circle)
    0b0000000000001000 - Button 2    (X / square)
    0b0000000000010000 - Button 3    (Y / triangle)
    0b0000000000100000 - Button 4    (LB / L1)
    0b0000000001000000 - Button 5    (RB / R1)
    0b0000000010000000 - Button 8    (Share / View)
    0b0000000100000000 - Button 9    (Options / Menu)
    0b0000001000000000 - Button 10   (LSB / L3)
    0b0000010000000000 - Button 11   (RSB / R3)
    0b0000100000000000 - Button 12   (D-Pad Up)
    0b0001000000000000 - Button 13   (D-Pad Down)
    0b0010000000000000 - Button 14   (D-Pad Left)
    0b0100000000000000 - Button 15   (D-Pad Right)
    0b1000000000000000 - Button 16   (Start / Xbox button / PS button)

  analog triggers 2 bytes

    Uint8              - Button 6 (LT/ L2)
    Uint8              - Button 7 (RT/ R2)

  analog sticks 8 bytes

    Int16              - Axis 0 (Left stick X axis)   left negative
    Int16              - Axis 1 (Left stick Y axis)   up negative
    Int16              - Axis 2 (Right stick X axis)  left negative
    Int16              - Axis 3 (Right stick Y axis)  up negative

  deadzones 8 bytes

    Uint8 - left stick inner dead zone      (radius percentage as x/255)
    Uint8 - left stick outer dead zone      (radius percentage as x/255)
    Uint8 - right stick inner dead zone     (radius percentage as x/255)
    Uint8 - right stick outer dead zone     (radius percentage as x/255)
    Uint8 - left trigger inner dead zone    (percentage as x/255)
    Uint8 - left trigger outer dead zone    (percentage as x/255)
    Uint8 - right trigger inner dead zone   (percentage as x/255)
    Uint8 - right trigger outer dead zone   (percentage as x/255)

  effects - 12 bytes
    Uint8  - effect status (0 - none, 1 - playing) - more flags may be available in the future
    Uint8  - effect id (0 - cancel, 1 - dual-rumble, 2 - trigger-rumble) - more effects can be available in the furture

    10 bytes for arguments, depend on the effect, for example:

      for dual-rumble:

      Uint16 - effect arg0 - ex. duration in ms (max 5000)
      Uint16 - effect arg1 - delay in ms (max 4000)
      Uint8  - effect arg2 - strong magnitude (intensity of the low-frequency motor)
      Uint8  - effect arg3 - weak magnitude (intensity of the high-frequency motor)
      4 bytes padding

      for trigger-rumble

      Uint16 - effect arg0 - ex. duration in ms (max 5000)
      Uint16 - effect arg1 - delay in ms (max 4000)
      Uint8  - effect arg2 - left trigger (rumble intensity of the bottom-left trigger)
      Uint8  - effect arg3 - right trigger (rumble intensity of the bottom-right trigger)
      4 bytes padding

  32 bytes padding to align the queue to the cache line

  Input queue (ring buffer) - 640 bytes:

    Uint32 - head position
    60 bytes of padding
    56 bytes of padding
    Uint32 - tail position
    60 bytes of padding
    512 bytes of events (64 events max, including 1 "empty" to distinguish empty queue from the full one)

      Event entry:

      Uint8 - button_id
      Uint8 - status (0 - released, 1 - pressed, other flags possible in the future)
      2 bytes aligned - full value (so simple on/of buttons as well as axes can be handled)
      Uint32 - timestamp (ms since session start)

      TOTAL per event: 8 bytes

  TOTAL: 704 bytes (11 cache lines) per gamepad
*/

const DEFAULT_STICK_INNER_DEAD_ZONE = 0.1;
const DEFAULT_STICK_OUTER_DEAD_ZONE = 0.05;
const DEFAULT_TRIGGER_INNER_DEAD_ZONE = 0.05;
const DEFAULT_TRIGGER_OUTER_DEAD_ZONE = 0.05;

const DIGITAL_BUTTONS_MASKS = [
  0b0000000000000001, // Button 0    (A / cross)
  0b0000000000000010, // Button 1    (B / circle)
  0b0000000000000100, // Button 2    (X / square)
  0b0000000000001000, // Button 3    (Y / triangle)
  0b0000000000010000, // Button 4    (LB / L1)
  0b0000000000100000, // Button 5    (RB / R1)
  0, // Button 6 (LT / L2 - not used here, used as analog)
  0, // Button 7 (RT / R2 - not used here, used as analog)
  0b0000000001000000, // Button 8    (Share / View)
  0b0000000010000000, // Button 9    (Options / Menu)
  0b0000000100000000, // Button 10   (LSB / L3)
  0b0000001000000000, // Button 11   (RSB / R3)
  0b0000010000000000, // Button 12   (D-Pad Up)
  0b0000100000000000, // Button 13   (D-Pad Down)
  0b0001000000000000, // Button 14   (D-Pad Left)
  0b0010000000000000, // Button 15   (D-Pad Right)
  0b0100000000000000, // Button 16   (Start / Xbox button / PS button)
  0b1000000000000000, // on/off      (on if the gamepad is connected)
];

const DIGITAL_BUTTONS_BYTE_SIZE = 2;
const ANALOG_TRIGGERS_BYTE_SIZE = 2;
const ANALOG_STICKS_BYTE_SIZE = 8;
const DEAZONES_BYTE_SIZE = 8;
const EFFECTS_STATUS_BYTE_SIZE = 1;
const EFFECTS_OPCODE_BYTE_SIZE = 1;
const EFFECTS_ARGUMENTS_BYTE_SIZE = 10;

const DIGITAL_BUTTONS_OFFSET = 0;
const ANALOG_TRIGGERS_OFFSET = DIGITAL_BUTTONS_BYTE_SIZE;
const ANALOG_STICKS_OFFSET = ANALOG_TRIGGERS_OFFSET + ANALOG_TRIGGERS_BYTE_SIZE;
const DEAZONES_OFFSET = ANALOG_STICKS_OFFSET + ANALOG_STICKS_BYTE_SIZE;
const EFFECTS_STATUS_OFFSET = DEAZONES_OFFSET + DEAZONES_BYTE_SIZE;
const EFFECTS_OPCODE_OFFSET = EFFECTS_STATUS_OFFSET + EFFECTS_STATUS_BYTE_SIZE;
const EFFECTS_ARGUMENTS_OFFSET =
  EFFECTS_OPCODE_OFFSET + EFFECTS_OPCODE_BYTE_SIZE;

const MAX_GAMEPADS = 4;
const STATUS_REGISTERS_COUNT = 1;
const AXES_COUNT = 4;
const BUTTONS_COUNT = 17;
const CONTROL_REGISTERS_COUNT = 10;

const AXES_OFFSET = STATUS_REGISTERS_COUNT;
const BUTTONS_OFFSET = AXES_OFFSET + AXES_COUNT;

const SIZE_PER_GAMEPAD =
  STATUS_REGISTERS_COUNT + AXES_COUNT + BUTTONS_COUNT + CONTROL_REGISTERS_COUNT;

// @todo reset all memory for gamepad on disconnect!

export class GamepadController {
  constructor(memory: WebAssembly.Memory) {
    this.#registerHandlers();
    this.watch = this.watch.bind(this);

    this.watch();
  }

  #registerHandlers() {
    window.addEventListener("gamepadconnected", (e) => {
      console.log("gamepad connnected!");
      console.log(e.gamepad);

      this.#vibrate(e.gamepad, 1000, {
        weakMagnitude: 0,
        strongMagnitude: 1,
      });
      this.#vibrate(e.gamepad, 1000, {
        weakMagnitude: 1,
        strongMagnitude: 0,
      });
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("gamepad disconnnected!");
      console.log(e.gamepad);
    });
  }

  watch() {
    this.getData();
    setTimeout(this.watch, 0);
  }

  getData() {
    // 32 2-byte registers, 1 status register, 21 input registers, 10 control registers
    // what about input queue for buttons pressed between frames? could they fit in control registers?
    // or maybe condense the input registers for binary buttons?
    // autocalibration of dead zones on connect

    const gamepads = navigator.getGamepads();

    for (let i = 0; i < MAX_GAMEPADS; i++) {
      const gamepad = gamepads[i];
      const offset = i * SIZE_PER_GAMEPAD;

      if (!gamepad || gamepad.timestamp === lastUpdate.get(gamepad.index)) {
        continue;
      }

      for (let axis = 0; axis < AXES_COUNT; axis += 2) {
        const valPositionX = offset + AXES_OFFSET + axis;
        const valPositionY = valPositionX + 1;
        const oldValueX = gamepadsRegisters[valPositionX];
        const oldValueY = gamepadsRegisters[valPositionY];
        let newValueX = gamepad.axes[axis];
        let newValueY = gamepad.axes[axis + 1];
        const radius = Math.hypot(newValueX, newValueY);
        const normalizedRadius = applyDeadzone(0.1, 0.95, radius);

        if (radius > 0) {
          const scale = normalizedRadius / radius;
          newValueX *= scale;
          newValueY *= scale;
        }

        newValueX = round(newValueX, 3);
        newValueY = round(newValueY, 3);

        if (oldValueX !== newValueX) {
          console.log(`Axis ${axis} change:`, oldValueX, "to", newValueX);
          gamepadsRegisters[valPositionX] = newValueX;
        }

        if (oldValueY !== newValueY) {
          console.log(`Axis ${axis + 1} change:`, oldValueY, "to", newValueY);
          gamepadsRegisters[valPositionY] = newValueY;
        }
      }

      for (let btn = 0; btn < BUTTONS_COUNT; btn++) {
        const oldValPos = offset + BUTTONS_OFFSET + btn;
        const oldVal = gamepadsRegisters[oldValPos];
        const newVal = gamepad.buttons[btn].value;

        if (oldVal !== newVal) {
          // push the change to queue
          console.log(
            `Button ${btn} change:`,
            oldVal,
            "to",
            newVal,
            "at",
            Math.floor(gamepad.timestamp),
          );
          gamepadsRegisters[oldValPos] = newVal;
        }
      }

      lastUpdate.set(gamepad.index, gamepad.timestamp);
    }
  }

  #vibrate(gamepad: Gamepad, duration: number, options = {}) {
    if (!gamepad.vibrationActuator) {
      return;
    }

    gamepad.vibrationActuator.playEffect("dual-rumble", {
      duration,
      startDelay: 0,
      weakMagnitude: 0.5,
      strongMagnitude: 0.5,
      ...options,
    });
  }
}

const lastUpdate = new Map([
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
]);

function applyDeadzone(lower: number, upper: number, val: number) {
  if (val <= lower) {
    return 0;
  }

  if (val >= upper) {
    return 1;
  }

  return (val - lower) / (upper - lower);
}

function round(val: number, decimals: number) {
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}
