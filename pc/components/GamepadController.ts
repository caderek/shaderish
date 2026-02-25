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

import { argv0 } from "process";
import {
  GAMEPADS_MAPPING_BYTE_LENGTH,
  GAMEPADS_MAPPING_OFFSET,
} from "../ramLayout";

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

const GAMEPAD_STATE_BYTE_SIZE = 64;

const GAMEPAD_STATE_PADDING_BYTE_SIZE =
  GAMEPAD_STATE_BYTE_SIZE -
  (DIGITAL_BUTTONS_BYTE_SIZE +
    ANALOG_TRIGGERS_BYTE_SIZE +
    ANALOG_STICKS_BYTE_SIZE +
    DEAZONES_BYTE_SIZE +
    EFFECTS_STATUS_BYTE_SIZE +
    EFFECTS_OPCODE_BYTE_SIZE +
    EFFECTS_ARGUMENTS_BYTE_SIZE);

const GAMEPAD_QUEUE_BYTE_SIZE = 640;

const DIGITAL_BUTTONS_OFFSET = 0;
const ANALOG_TRIGGERS_OFFSET = DIGITAL_BUTTONS_BYTE_SIZE;
const ANALOG_STICKS_OFFSET = ANALOG_TRIGGERS_OFFSET + ANALOG_TRIGGERS_BYTE_SIZE;
const DEAZONES_OFFSET = ANALOG_STICKS_OFFSET + ANALOG_STICKS_BYTE_SIZE;
const EFFECTS_STATUS_OFFSET = DEAZONES_OFFSET + DEAZONES_BYTE_SIZE;
const EFFECTS_OPCODE_OFFSET = EFFECTS_STATUS_OFFSET + EFFECTS_STATUS_BYTE_SIZE;
const EFFECTS_ARGUMENTS_OFFSET =
  EFFECTS_OPCODE_OFFSET + EFFECTS_OPCODE_BYTE_SIZE;

const MAX_GAMEPADS = 4;
const ANALOG_TRIGGERS_COUNT = 2;
const ANALOG_STICKS_COUNT = 2;
const STICK_STRIDE = 4;

const BYTE_SIZE_PER_GAMEPAD = GAMEPAD_STATE_BYTE_SIZE + GAMEPAD_QUEUE_BYTE_SIZE;

const POOLING_RATE_MS = 4;

console.log({ BYTE_SIZE_PER_GAMEPAD });

export class GamepadController {
  #mmio: DataView;
  #lastUpdate = new Map([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);

  constructor(memory: WebAssembly.Memory) {
    this.#registerHandlers();

    this.#mmio = new DataView(
      memory.buffer,
      GAMEPADS_MAPPING_OFFSET,
      GAMEPADS_MAPPING_BYTE_LENGTH,
    );

    this.watch = this.watch.bind(this);
    this.watch();
  }

  #registerHandlers() {
    // @todo autocalibration of dead zones on connect
    window.addEventListener("gamepadconnected", (e) => {
      console.log("gamepad connnected!");
      console.log(e.gamepad);

      this.#vibrate(e.gamepad, 200);
    });

    // @todo reset all memory for gamepad on disconnect!
    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("gamepad disconnnected!");
      console.log(e.gamepad);
    });
  }

  watch() {
    this.getData();
    setTimeout(this.watch, POOLING_RATE_MS);
  }

  getData() {
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < MAX_GAMEPADS; i++) {
      const gamepad = gamepads[i];
      const offset = i * BYTE_SIZE_PER_GAMEPAD;

      if (
        !gamepad ||
        gamepad.timestamp === this.#lastUpdate.get(gamepad.index)
      ) {
        continue;
      }

      const digitalButtonsPos = offset + DIGITAL_BUTTONS_OFFSET;
      let btnVals = this.#mmio.getUint16(digitalButtonsPos, true);

      for (let btn = 0; btn < 6; btn++) {
        const btnNewVal = gamepad.buttons[btn].value;
        const mask = DIGITAL_BUTTONS_MASKS[btn];
        const btnOldVal = +!!(btnVals & mask);

        if (btnOldVal !== btnNewVal) {
          this.#addToQueue(btn, btnNewVal, gamepad.timestamp);
          btnVals ^= mask;
        }
      }

      for (let btn = 8; btn < 17; btn++) {
        const btnNewVal = gamepad.buttons[btn].value;
        const mask = DIGITAL_BUTTONS_MASKS[btn];
        const btnOldVal = +!!(btnVals & mask);

        if (btnOldVal !== btnNewVal) {
          this.#addToQueue(btn - 2, btnNewVal, gamepad.timestamp);
          btnVals ^= mask;
        }
      }

      this.#mmio.setUint16(digitalButtonsPos, btnVals, true);

      for (let trigger = 0; trigger < ANALOG_TRIGGERS_COUNT; trigger++) {
        const pos = offset + ANALOG_TRIGGERS_OFFSET + trigger;
        const oldVal = this.#mmio.getUint8(pos);
        let newVal = gamepad.buttons[6 + trigger].value;
        newVal = applyDeadzone(0.05, 0.95, newVal);
        newVal = triggerToUint8(newVal);

        if (oldVal !== newVal) {
          this.#addToQueue(trigger + 15, newVal, gamepad.timestamp);
          this.#mmio.setUint8(pos, newVal);
        }
      }

      for (let stick = 0; stick < ANALOG_STICKS_COUNT; stick++) {
        const axisX = stick * 2;
        const axisY = stick * 2 + 1;
        const posX = offset + ANALOG_STICKS_OFFSET + stick * STICK_STRIDE;
        const posY = posX + 2;
        const oldX = this.#mmio.getInt16(posX, true);
        const oldY = this.#mmio.getInt16(posY, true);

        let newX = gamepad.axes[axisX];
        let newY = gamepad.axes[axisY];
        const radius = Math.hypot(newX, newY);
        const normalizedRadius = applyDeadzone(0.1, 0.95, radius);

        if (normalizedRadius > 0) {
          const scale = normalizedRadius / radius;
          newX *= scale;
          newY *= scale;
        } else {
          newX = 0;
          newY = 0;
        }

        newX = axisToInt16(newX);
        newY = axisToInt16(newY);

        if (oldX !== newX) {
          this.#addToQueue(axisX + 17, newX, gamepad.timestamp);
          this.#mmio.setInt16(posX, newX, true);
        }

        if (oldY !== newY) {
          this.#addToQueue(axisY + 17, newY, gamepad.timestamp);
          this.#mmio.setInt16(posY, newY, true);
        }
      }

      this.#lastUpdate.set(gamepad.index, gamepad.timestamp);
    }
  }

  #addToQueue(inputId: number, value: number, timestamp: number) {
    timestamp = Math.floor(timestamp);
    console.log(
      `Input ${inputId} changed to ${value} (${value !== 0 ? "ON" : "OFF"}) at ${timestamp}`,
    );
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

function applyDeadzone(lower: number, upper: number, val: number) {
  if (val <= lower) {
    return 0;
  }

  if (val >= upper) {
    return 1;
  }

  return (val - lower) / (upper - lower);
}

const INT_16_MAX_VALUE = 2 ** 16 / 2 - 1;
const UINT_8_MAX_VALUE = 2 ** 8 - 1;

function axisToInt16(val: number) {
  return Math.floor(val * INT_16_MAX_VALUE);
}

function triggerToUint8(val: number) {
  return Math.floor(val * UINT_8_MAX_VALUE);
}
