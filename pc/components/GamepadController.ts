/* Gamepad memory layout:

  --state--section-- 64 bytes

  Uint32 - last change timestamp

  digital input 4 bytes (32 flags,  1 bit on/off, 31 bits of buttons)

    Uint32 - Binary flags:

    0b00000000000000000000000000000001 - Button 0    (A / cross)                        
    0b00000000000000000000000000000010 - Button 1    (B / circle)                       
    0b00000000000000000000000000000100 - Button 2    (X / square)                       
    0b00000000000000000000000000001000 - Button 3    (Y / triangle)                     
    0b00000000000000000000000000010000 - Button 4    (LB / L1)                          
    0b00000000000000000000000000100000 - Button 5    (RB / R1)                          
    0b00000000000000000000000001000000 - Button 6    (LT / L2)                          
    0b00000000000000000000000010000000 - Button 7    (RT / R2)                          
    0b00000000000000000000000100000000 - Button 8    (Share / View)                     
    0b00000000000000000000001000000000 - Button 9    (Options / Menu)                   
    0b00000000000000000000010000000000 - Button 10   (LSB / L3)                         
    0b00000000000000000000100000000000 - Button 11   (RSB / R3)                         
    0b00000000000000000001000000000000 - Button 12   (D-Pad Up)                         
    0b00000000000000000010000000000000 - Button 13   (D-Pad Down)                       
    0b00000000000000000100000000000000 - Button 14   (D-Pad Left)                       
    0b00000000000000001000000000000000 - Button 15   (D-Pad Right)                      
    0b00000000000000010000000000000000 - Button 16   (Start / Xbox button / PS button)  
    0b00000000000000100000000000000000 - Button 17   (reserved)                         
    0b00000000000001000000000000000000 - Button 18   (reserved)                         
    0b00000000000010000000000000000000 - Button 19   (Up)                               
    0b00000000000100000000000000000000 - Button 20   (Down)                             
    0b00000000001000000000000000000000 - Button 21   (Left)                             
    0b00000000010000000000000000000000 - Button 22   (Right)                            
    0b00000000100000000000000000000000 - Button 23   (Left Stick Up)                    
    0b00000001000000000000000000000000 - Button 24   (Left Stick Down)                  
    0b00000010000000000000000000000000 - Button 25   (Left Stick Left)                  
    0b00000100000000000000000000000000 - Button 26   (Left Stick Right)                 
    0b00001000000000000000000000000000 - Button 27   (Right Stick Up)                   
    0b00010000000000000000000000000000 - Button 28   (Right Stick Down)                 
    0b00100000000000000000000000000000 - Button 29   (Right Stick Left)                 
    0b01000000000000000000000000000000 - Button 30   (Right Stick Right)                
    0b10000000000000000000000000000000 - on/off      (on if the gamepad is connected)   

  analog sticks 8 bytes

    Int16              - Axis 0 (17) (Left stick X axis)   left negative
    Int16              - Axis 1 (18) (Left stick Y axis)   up negative
    Int16              - Axis 2 (19) (Right stick X axis)  left negative
    Int16              - Axis 3 (20) (Right stick Y axis)  up negative

  analog triggers 2 bytes

    Uint8              - Button 15 (LT/ L2)
    Uint8              - Button 16 (RT/ R2)

  effect status flags 4 bytes

    Uint8 - general effects status flags:
      0b00000001 - prev effect stil running
      0b00000010 - incorrect effect opcode
      0b00000100 - incorrect effect arguments
      0b00001000 - reserved
      0b00010000 - reserved
      0b00100000 - reserved
      0b01000000 - reserved
      0b10000000 - haptics disabled / unavailable

    Uint8 - triggers effects status flags:
      0b00000001 - prev effect stil running
      0b00000010 - incorrect effect opcode
      0b00000100 - incorrect effect arguments
      0b00001000 - reserved
      0b00010000 - reserved
      0b00100000 - reserved
      0b01000000 - reserved
      0b10000000 - haptics disabled / unavailable

    Uint8 - lights effects status flags:
      0b00000001 - prev effect stil running
      0b00000010 - incorrect effect opcode
      0b00000100 - incorrect effect arguments
      0b00001000 - reserved
      0b00010000 - reserved
      0b00100000 - reserved
      0b01000000 - reserved
      0b10000000 - lights disabled / unavailable

    Uint8 - reserved effects status

  42 bytes of reserved space / padding

  --settings--section-- 64 bytes

  deadzones 8 bytes

    Uint8 - left stick inner dead zone      (radius percentage as x/255)
    Uint8 - left stick outer dead zone      (radius percentage as x/255)
    Uint8 - right stick inner dead zone     (radius percentage as x/255)
    Uint8 - right stick outer dead zone     (radius percentage as x/255)
    Uint8 - left trigger inner dead zone    (percentage as x/255)
    Uint8 - left trigger outer dead zone    (percentage as x/255)
    Uint8 - right trigger inner dead zone   (percentage as x/255)
    Uint8 - right trigger outer dead zone   (percentage as x/255)

  Analog to digital actuation 8 bytes

    Uint8              - Left stick acutation point
    Uint8              - Left stick release point
    Uint8              - Right stick acutation point
    Uint8              - Right stick release point
    Uint8              - Button 6 (LT/ L2) acutation point
    Uint8              - Button 6 (LT/ L2) release point
    Uint8              - Button 7 (RT/ R2) actuation point
    Uint8              - Button 7 (RT/ R2) release point

  48 bytes of reserved space / padding

  --effect-commands--section-- 64 bytes

  Effects regfisters - 64 bytes
  (important: opcodes are doorbells, and should be written last after the arguments)
  (important: opcodes should be written and read via atomics, arguments can be set using normal storeage operaions)

    Uint16 - general vibration effect opcode (0 - noop, 1 - dual-rumble, 2+ other effects)
    7 x 2-byte arugments registers

      for dual-rumble:
      Uint16 - effect arg0 - ex. duration in ms (max 5000)
      Uint16 - effect arg1 - delay in ms (max 4000)
      Uint16  - effect arg2 - strong magnitude (intensity of the low-frequency motor)
      Uint16  - effect arg3 - weak magnitude (intensity of the high-frequency motor)

    Uint16 - triggers effect opcode (0 - noop, 1 - trigger-rumble, 2+ other effects)
    7 x 2-byte arugments registers

      for trigger-rumble:
      Uint16 - effect arg0 - ex. duration in ms (max 5000)
      Uint16 - effect arg1 - delay in ms (max 4000)
      Uint16  - effect arg2 - left trigger (rumble intensity of the bottom-left trigger)
      Uint16  - effect arg3 - right trigger (rumble intensity of the bottom-right trigger)

    Uint16 - lights effect opcode (0 - noop, 1 - set-solid-color, 2+ other effects)
    7 x 2-byte arugments registers

      for set-solid-color (hypothetical):
      Uint16 - red channel
      Uint16 - green channel
      Uint16  - blue channel
      2 bytes not used

    16 bytes reserved for future use (yet another gamepad effects type)

  =================================================================

  Buttons queue (ring buffer) - 384 bytes:

    Uint32 - head position
    60 bytes of padding
    56 bytes of padding
    Uint32 - tail position
    60 bytes of padding
    256 bytes of events (32 events max, including 1 "empty" to distinguish empty queue from the full one)

      Event entry:

      Uint8 - button_id
      Uint8 - status (0 - released, 1 - pressed, other flags possible in the future)
      Int16 - sequential event number
      Uint32 - timestamp (ms since session start)

      TOTAL per event: 8 bytes

  Axes queue (ring buffer) - 384 bytes:

    Uint32 - head position
    60 bytes of padding
    56 bytes of padding
    Uint32 - tail position
    60 bytes of padding
    256 bytes of events (32 events max, including 1 "empty" to distinguish empty queue from the full one)

      Event entry:

      Uint8 - button_id
      Uint8 - status (0 - rest positon, 1 - active position, other flags possible in the future)
      Int16 - full value
      Uint32 - timestamp (ms since session start)

      TOTAL per event: 8 bytes

  Padding / reserved space for future use:

    128 bytes

  TOTAL: 1024 bytes (1 KiB, 16 cache lines) per gamepad
*/

import {
  GAMEPADS_MAPPING_BYTE_LENGTH,
  GAMEPADS_MAPPING_OFFSET,
} from "../ramLayout";

const DEFAULT_TRIGGER_INNER_DEAD_ZONE = 0.05;
const DEFAULT_TRIGGER_OUTER_DEAD_ZONE = 0.05;
const DEFAULT_STICK_INNER_DEAD_ZONE = 0.1;
const DEFAULT_STICK_OUTER_DEAD_ZONE = 0.05;
const DEFAULT_TRIGGER_DIGITAL_ACTUATION = 0.1;
const DEFAULT_TRIGGER_DIGITAL_RELEASE = 0.0;
const DEFAULT_STICK_DIGITAL_ACTUATION = 0.1;
const DEFAULT_STICK_DIGITAL_RELEASE = 0.0;

const DIGITAL_BUTTONS_MASKS = [
  0b00000000000000000000000000000001, // Button 0    (A / cross)
  0b00000000000000000000000000000010, // Button 1    (B / circle)
  0b00000000000000000000000000000100, // Button 2    (X / square)
  0b00000000000000000000000000001000, // Button 3    (Y / triangle)
  0b00000000000000000000000000010000, // Button 4    (LB / L1)
  0b00000000000000000000000000100000, // Button 5    (RB / R1)
  0b00000000000000000000000001000000, // Button 6    (LT / L2)
  0b00000000000000000000000010000000, // Button 7    (RT / R2)
  0b00000000000000000000000100000000, // Button 8    (Share / View)
  0b00000000000000000000001000000000, // Button 9    (Options / Menu)
  0b00000000000000000000010000000000, // Button 10   (LSB / L3)
  0b00000000000000000000100000000000, // Button 11   (RSB / R3)
  0b00000000000010000001000000000000, // Button 12   (D-Pad Up)
  0b00000000000100000010000000000000, // Button 13   (D-Pad Down)
  0b00000000001000000100000000000000, // Button 14   (D-Pad Left)
  0b00000000010000001000000000000000, // Button 15   (D-Pad Right)
  0b00000000000000010000000000000000, // Button 16   (reserved - Start / Xbox button / PS button)
  0b00000000000000100000000000000000, // Button 17   (reserved)
  0b00000000000001000000000000000000, // Button 18   (reserved)
  0b00000000000010000000000000000000, // Button 19   (Up)
  0b00000000000100000000000000000000, // Button 20   (Down)
  0b00000000001000000000000000000000, // Button 21   (Left)
  0b00000000010000000000000000000000, // Button 22   (Right)
  0b00000000100010000000000000000000, // Button 23   (Left Stick Up)
  0b00000001000100000000000000000000, // Button 24   (Left Stick Down)
  0b00000010001000000000000000000000, // Button 25   (Left Stick Left)
  0b00000100010000000000000000000000, // Button 26   (Left Stick Right)
  0b00001000000000000000000000000000, // Button 27   (Right Stick Up)
  0b00010000000000000000000000000000, // Button 28   (Right Stick Down)
  0b00100000000000000000000000000000, // Button 29   (Right Stick Left)
  0b01000000000000000000000000000000, // Button 30   (Right Stick Right)
  0b10000000000000000000000000000000, // on/off      (on if the gamepad is connected)
];

const STATE_SECTION_BYTE_SIZE = 64;
const LAST_UPDATE_BYTE_SIZE = 4;
const DIGITAL_BUTTONS_BYTE_SIZE = 4;
const ANALOG_STICKS_BYTE_SIZE = 8;
const ANALOG_TRIGGERS_BYTE_SIZE = 2;
const EFFECTS_STATUS_BYTE_SIZE = 4;

const SETTINGS_SECTION_BYTE_SIZE = 64;
const DEAZONES_BYTE_SIZE = 8;
const DIGITAL_TRIGGERS_ACTUATIONS_BYTE_SIZE = 4;
const DIGITAL_STICKS_ACTUATIONS_BYTE_SIZE = 4;

const EFFECTS_SECTION_BYTE_SIZE = 64;
const GENERAL_VIBRATIONS_EFFECT_BYTE_SIZE = 16;
const TRIGGER_EFFECT_BYTE_SIZE = 16;
const LIGHTS_EFFECT_BYTE_SIZE = 16;

const GAMEPAD_IMMEDIATE_DATA_BYTE_SIZE =
  STATE_SECTION_BYTE_SIZE +
  SETTINGS_SECTION_BYTE_SIZE +
  EFFECTS_SECTION_BYTE_SIZE;

const GAMEPAD_QUEUE_HEAD_PADDED_BYTE_SIZE = 64;
const GAMEPAD_QUEUE_TAIL_PADDED_BYTE_SIZE = 64;
const GAMEPAD_QUEUE_HEADER_BYTE_SIZE =
  GAMEPAD_QUEUE_HEAD_PADDED_BYTE_SIZE + GAMEPAD_QUEUE_TAIL_PADDED_BYTE_SIZE;

const GAMEPAD_QUEUE_ITEM_BYTE_SIZE = 8;
const GAMEPAD_QUEUE_CAPACITY = 32;
const GAMEPAD_QUEUE_BYTE_SIZE =
  GAMEPAD_QUEUE_HEADER_BYTE_SIZE +
  GAMEPAD_QUEUE_ITEM_BYTE_SIZE * GAMEPAD_QUEUE_CAPACITY;

const GAMEPAD_QUEUE_INPUT_ID_BYTE_SIZE = 1;
const GAMEPAD_QUEUE_INPUT_STATUS_BYTE_SIZE = 1;
const GAMEPAD_QUEUE_INPUT_FULL_VALUE_BYTE_SIZE = 2;
const GAMEPAD_QUEUE_INPUT_EVENT_NUMBER_BYTE_SIZE = 2;
const GAMEPAD_QUEUE_INPUT_TIMESTAMP_BYTE_SIZE = 4;

const STATE_SECTION_OFFSET = 0;
const LAST_UPDATE_OFFSET = STATE_SECTION_OFFSET;
const DIGITAL_BUTTONS_OFFSET = LAST_UPDATE_OFFSET + LAST_UPDATE_BYTE_SIZE;
const ANALOG_STICKS_OFFSET = DIGITAL_BUTTONS_OFFSET + DIGITAL_BUTTONS_BYTE_SIZE;
const ANALOG_TRIGGERS_OFFSET = ANALOG_STICKS_OFFSET + ANALOG_STICKS_BYTE_SIZE;
const EFFECTS_STATUS_OFFSET =
  ANALOG_TRIGGERS_OFFSET + ANALOG_TRIGGERS_BYTE_SIZE;

const SETTINGS_SECTION_OFFSET = STATE_SECTION_BYTE_SIZE;
const DEAZONES_OFFSET = SETTINGS_SECTION_OFFSET;
const DIGITAL_TRIGGERS_ACTUATIONS_OFFSET = DEAZONES_OFFSET + DEAZONES_BYTE_SIZE;
const DIGITAL_STICKS_ACTUATIONS_OFFSET =
  DIGITAL_TRIGGERS_ACTUATIONS_OFFSET + DIGITAL_TRIGGERS_ACTUATIONS_BYTE_SIZE;

const EFFECT_COMMANDS_OFFSET = SETTINGS_SECTION_BYTE_SIZE;
const GENERAL_VIBRATIONS_EFFECT_OFFSET = EFFECT_COMMANDS_OFFSET;
const TRIGGER_EFFECT_OFFSET =
  GENERAL_VIBRATIONS_EFFECT_OFFSET + GENERAL_VIBRATIONS_EFFECT_BYTE_SIZE;
const LIGHTS_EFFECT_OFFSET = TRIGGER_EFFECT_OFFSET + TRIGGER_EFFECT_BYTE_SIZE;

const GAMEPAD_DIGITAL_QUEUE_OFFSET = GAMEPAD_IMMEDIATE_DATA_BYTE_SIZE;
const GAMEPAD_ANALOG_QUEUE_OFFSET =
  GAMEPAD_DIGITAL_QUEUE_OFFSET + GAMEPAD_QUEUE_BYTE_SIZE;

const MAX_GAMEPADS = 4;
const ANALOG_TRIGGERS_COUNT = 2;
const ANALOG_STICKS_COUNT = 2;
const STICK_STRIDE = 4;

const BYTE_SIZE_PER_GAMEPAD = 1024;
const POOLING_RATE_MS = 4;

export class GamepadController {
  #bytes: Uint8Array;
  #mmio: DataView;
  #lastUpdate = new Map([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
  #sequentialEventNumber = 0;
  #analogToDigitalActive = 0; // flags for analog buttons treated as digital
  #listener?: (time: number) => void;

  constructor(memory: WebAssembly.Memory) {
    this.#registerHandlers();

    this.#bytes = new Uint8Array(
      memory.buffer,
      GAMEPADS_MAPPING_OFFSET,
      GAMEPADS_MAPPING_BYTE_LENGTH,
    );

    this.#mmio = new DataView(
      memory.buffer,
      GAMEPADS_MAPPING_OFFSET,
      GAMEPADS_MAPPING_BYTE_LENGTH,
    );

    this.watch = this.watch.bind(this);
  }

  addListener(listener: (time: number) => void) {
    this.#listener = listener;
  }

  #registerHandlers() {
    // @todo autocalibration of dead zones on connect
    window.addEventListener("gamepadconnected", (e) => {
      const index = e.gamepad.index;

      if (index >= MAX_GAMEPADS) {
        return;
      }

      if (e.gamepad.mapping !== "standard") {
        console.error("Unknown gamepad layout");
      }

      this.#initGamepad(index);
      this.#vibrate(e.gamepad, 200);
      console.log(e.gamepad);
    });

    // @todo reset all memory for gamepad on disconnect!
    window.addEventListener("gamepaddisconnected", (e) => {
      const index = e.gamepad.index;

      if (index >= MAX_GAMEPADS) {
        return;
      }

      this.#clearGamepad(index);
    });
  }

  #initGamepad(index: number) {
    const offset = index * BYTE_SIZE_PER_GAMEPAD;
    const digitalButtonsPos = offset + DIGITAL_BUTTONS_OFFSET;
    const mask = DIGITAL_BUTTONS_MASKS[31];
    let val = this.#mmio.getUint32(digitalButtonsPos, true) | mask;
    this.#mmio.setUint32(digitalButtonsPos, val, true);
  }

  #clearGamepad(index: number) {
    // @todo There is a race conditon here - i.e. if the consumer stores some data here
    // while the buffer is cleared, the stale data can persist, like queue tail or commands
    // figure out haw to best handle it.
    // We clear the digital flags first, including the connection byte
    // (it's important to clear all, as the user my rely on the whole secton being zero),
    // so the consumer knows to not process the gamepad data anymore
    // but that still doesn not remove race codition, but makes it very unlikely to occur
    //
    // Good way to reduce it further without locks is to kill the head frist (head = tail)
    const offset = index * BYTE_SIZE_PER_GAMEPAD;
    this.#mmio.setUint32(offset + DIGITAL_BUTTONS_OFFSET, 0, true);
    this.#bytes.fill(0, offset, offset + BYTE_SIZE_PER_GAMEPAD);
  }

  watch() {
    const start = performance.now();
    this.getData();
    setTimeout(this.watch, POOLING_RATE_MS);
    const time = performance.now() - start;

    if (this.#listener) {
      this.#listener(time);
    }
  }

  getData() {
    const gamepads = navigator.getGamepads();

    for (let gamepadIdx = 0; gamepadIdx < MAX_GAMEPADS; gamepadIdx++) {
      const gamepad = gamepads[gamepadIdx];
      const offset = gamepadIdx * BYTE_SIZE_PER_GAMEPAD;

      if (!gamepad || gamepad.timestamp === this.#lastUpdate.get(gamepadIdx)) {
        continue;
      }

      let modified = false;
      const timestamp = Math.floor(gamepad.timestamp);

      const digitalButtonsPos = offset + DIGITAL_BUTTONS_OFFSET;
      let btnVals = this.#mmio.getUint32(digitalButtonsPos, true);
      const oldBtnVals = btnVals;

      for (let btn = 0; btn < 16; btn++) {
        const mask = DIGITAL_BUTTONS_MASKS[btn];
        const btnOldValDigital = +!!(btnVals & mask);

        if (btn === 6 || btn === 7) {
          const pos = offset + ANALOG_TRIGGERS_OFFSET + btn - 6;
          const btnOldValAnalog = this.#mmio.getUint8(pos);
          const btnNewVal = triggerToUint8(
            applyDeadzone(0.05, 0.95, gamepad.buttons[btn].value),
          );

          if (btnOldValAnalog === btnNewVal) {
            continue;
          }

          modified = true;
          this.#mmio.setUint8(pos, btnNewVal);

          const releaseThreshold = 0; // @todo use real value
          const pressThreshold = 0.1; // @todo use real value

          if (
            (btnNewVal >= pressThreshold && btnOldValDigital === 0) ||
            (btnNewVal <= releaseThreshold && btnOldValDigital === 1)
          ) {
            btnVals ^= mask;
          }
        } else {
          let btnNewVal = gamepad.buttons[btn].value;

          if (btnOldValDigital === btnNewVal) {
            continue;
          }

          modified = true;
          this.#addToButtonsQueue(gamepadIdx, btn, btnNewVal, timestamp);
          btnVals ^= mask;
        }
      }

      this.#mmio.setUint32(digitalButtonsPos, btnVals, true);

      // 0b00000000000010000000000000000000, // Button 19   (Up)
      // 0b00000000000100000000000000000000, // Button 20   (Down)
      // 0b00000000001000000000000000000000, // Button 21   (Left)
      // 0b00000000010000000000000000000000, // Button 22   (Right)
      // 0b00000000100000000000000000000000, // Button 23   (Left Stick Up)
      // 0b00000001000000000000000000000000, // Button 24   (Left Stick Down)
      // 0b00000010000000000000000000000000, // Button 25   (Left Stick Left)
      // 0b00000100000000000000000000000000, // Button 26   (Left Stick Right)
      // 0b00001000000000000000000000000000, // Button 27   (Right Stick Up)
      // 0b00010000000000000000000000000000, // Button 28   (Right Stick Down)
      // 0b00100000000000000000000000000000, // Button 29   (Right Stick Left)
      // 0b01000000000000000000000000000000, // Button 30   (Right Stick Right)

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
          modified = true;
          this.#addToAxesQueue(gamepadIdx, axisX, newX, timestamp);
          this.#mmio.setInt16(posX, newX, true);
        }

        if (oldY !== newY) {
          modified = true;
          this.#addToAxesQueue(gamepadIdx, axisY, newY, timestamp);
          this.#mmio.setInt16(posY, newY, true);
        }
      }

      this.#lastUpdate.set(gamepad.index, gamepad.timestamp);

      if (modified) {
        this.#mmio.setUint32(offset + LAST_UPDATE_OFFSET, timestamp, true);
      }
    }
  }

  // @todo two separate queues for anoalog and digital input
  // triggers should  be in both, the digital version should be at the end of digital buttons,
  // and be set as a hair-trigger with activation at 10% and deactivation at 0
  // the inputId should be consistent and continuous between the queues,
  // basically each button/trigger/stick axis has it's own id/index
  // make the hair trigger configurable as the deadzones?

  #addToButtonsQueue(
    gamepadIndex: number,
    buttonId: number,
    value: number,
    timestamp: number,
  ) {
    // console.log({ gamepadIndex, buttonId, value, timestamp });
    return;

    // const offset = gamepadIndex * BYTE_SIZE_PER_GAMEPAD + GAMEPAD_QUEUE_OFFSET;
    // const head = this.#mmio.getUint32(offset, true);
    // const tail = this.#mmio.getUint32(
    //   offset + GAMEPAD_QUEUE_HEAD_PADDED_BYTE_SIZE,
    //   true,
    // );
    //
    // const newHead = (head + 1) & GAMEPAD_QUEUE_WRAP_MASK;
    //
    // // Don't add events if queue is full
    // if (newHead == tail) {
    //   return;
    // }
    //
    // const itemOffset =
    //   offset +
    //   GAMEPAD_QUEUE_HEADER_BYTE_SIZE +
    //   newHead * GAMEPAD_QUEUE_ITEM_BYTE_SIZE;
    //
    // this.#mmio.setUint8(itemOffset, inputId);
    // this.#mmio.setUint8(
    //   itemOffset + GAMEPAD_QUEUE_INPUT_ID_BYTE_SIZE,
    //   +!!value,
    // );
    // this.#mmio.setInt16(
    //   itemOffset +
    //     GAMEPAD_QUEUE_INPUT_ID_BYTE_SIZE +
    //     GAMEPAD_QUEUE_INPUT_STATUS_BYTE_SIZE,
    //   value,
    //   true,
    // );
    // this.#mmio.setInt32(
    //   itemOffset +
    //     GAMEPAD_QUEUE_INPUT_ID_BYTE_SIZE +
    //     GAMEPAD_QUEUE_INPUT_STATUS_BYTE_SIZE +
    //     GAMEPAD_QUEUE_INPUT_FULL_VALUE_BYTE_SIZE,
    //   timestamp,
    //   true,
    // );
    // this.#mmio.setUint32(offset, newHead, true);
    //
    // console.log(
    //   `Gamepad ${gamepadIndex}, input ${inputId} changed to ${value} (${value !== 0 ? "ON" : "OFF"}) at ${timestamp}`,
    // );
  }

  #addToAxesQueue(
    gamepadIndex: number,
    axisId: number,
    value: number,
    timestamp: number,
  ) {
    // console.log({ gamepadIndex, axisId, value, timestamp });
    return;
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
