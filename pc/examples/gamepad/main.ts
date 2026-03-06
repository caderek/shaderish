console.log("hello");
import { GamepadController } from "../../components/GamepadController";
import {
  GAMEPADS_MAPPING_BYTE_LENGTH,
  GAMEPADS_MAPPING_OFFSET,
} from "../../ramLayout";

const INT_16_MAX = 2 ** 15 - 1;

const memory = new WebAssembly.Memory({
  initial: 64,
  maximum: 64,
  shared: false,
});

const gamepadsView = new DataView(
  memory.buffer,
  GAMEPADS_MAPPING_OFFSET,
  GAMEPADS_MAPPING_OFFSET + GAMEPADS_MAPPING_BYTE_LENGTH,
);

const gampepadController = new GamepadController(memory);

const $generalStats = document.getElementById("general-stats")!;
const $gamepadState = document.getElementById("gamepad-state")!;
const $gamepadSettings = document.getElementById("gamepad-settings")!;
const $buttonsQueue = document.getElementById("buttons-queue")!;
const $axesQueue = document.getElementById("axes-queue")!;

gampepadController.addListener((time) => {
  const lastModified = gamepadsView.getUint32(0, true);
  const buttonsFlags = gamepadsView.getUint32(4, true);
  const leftStickX = gamepadsView.getInt16(8, true);
  const leftStickY = gamepadsView.getInt16(10, true);
  const rightStickX = gamepadsView.getInt16(12, true);
  const rightStickY = gamepadsView.getInt16(14, true);
  const leftTrigger = gamepadsView.getUint8(16);
  const rightTrigger = gamepadsView.getUint8(17);
  const effectStatus = gamepadsView.getUint8(18);

  const lStickInnerDZ = gamepadsView.getUint8(64);
  const lStickOuterDZ = gamepadsView.getUint8(65);
  const rStickInnerDZ = gamepadsView.getUint8(66);
  const rStickOuterDZ = gamepadsView.getUint8(67);
  const lTriggerInnerDZ = gamepadsView.getUint8(68);
  const lTriggerOuterDZ = gamepadsView.getUint8(69);
  const rTriggerInnerDZ = gamepadsView.getUint8(70);
  const rTriggerOuterDZ = gamepadsView.getUint8(71);
  const lStickActuation = gamepadsView.getUint8(72);
  const lStickRelease = gamepadsView.getUint8(73);
  const rStickActuation = gamepadsView.getUint8(74);
  const rStickRelease = gamepadsView.getUint8(75);
  const lTriggerActuation = gamepadsView.getUint8(76);
  const lTriggerRelease = gamepadsView.getUint8(77);
  const rTriggerActuation = gamepadsView.getUint8(78);
  const rTriggerRelease = gamepadsView.getUint8(79);

  const effectOpcode = gamepadsView.getUint32(80, true);
  const effectArg0 = gamepadsView.getUint32(84, true);
  const effectArg1 = gamepadsView.getUint32(88, true);
  const effectArg2 = gamepadsView.getUint32(92, true);
  const effectArg3 = gamepadsView.getUint32(96, true);
  const effectArg4 = gamepadsView.getUint32(100, true);
  const effectArg5 = gamepadsView.getUint32(104, true);
  const effectArg6 = gamepadsView.getUint32(108, true);

  const buttonsQueueHead = gamepadsView.getUint32(128, true);
  const buttonsQueueTail = gamepadsView.getUint32(192, true);

  $generalStats.textContent = `Connected: ${buttonsFlags !== 0} | Input processing time: ${time.toFixed(2)} ms`;

  $gamepadState.textContent = `
    Gamepad state:

    Last modified: ${lastModified}
    Buttons flags: ${buttonsFlags.toString(2).padStart(32, "0")}

    ${+!!(buttonsFlags & 0b00000000000000000000000000000001)} - Button 0    (A / cross)
    ${+!!(buttonsFlags & 0b00000000000000000000000000000010)} - Button 1    (B / circle)
    ${+!!(buttonsFlags & 0b00000000000000000000000000000100)} - Button 2    (X / square)
    ${+!!(buttonsFlags & 0b00000000000000000000000000001000)} - Button 3    (Y / triangle)
    ${+!!(buttonsFlags & 0b00000000000000000000000000010000)} - Button 4    (LB / L1)
    ${+!!(buttonsFlags & 0b00000000000000000000000000100000)} - Button 5    (RB / R1)
    ${+!!(buttonsFlags & 0b00000000000000000000000001000000)} - Button 6    (LT / L2)
    ${+!!(buttonsFlags & 0b00000000000000000000000010000000)} - Button 7    (RT / R2)
    ${+!!(buttonsFlags & 0b00000000000000000000000100000000)} - Button 8    (Share / View)
    ${+!!(buttonsFlags & 0b00000000000000000000001000000000)} - Button 9    (Options / Menu)
    ${+!!(buttonsFlags & 0b00000000000000000000010000000000)} - Button 10   (LSB / L3)
    ${+!!(buttonsFlags & 0b00000000000000000000100000000000)} - Button 11   (RSB / R3)
    ${+!!(buttonsFlags & 0b00000000000000000001000000000000)} - Button 12   (D-Pad Up)
    ${+!!(buttonsFlags & 0b00000000000000000010000000000000)} - Button 13   (D-Pad Down)
    ${+!!(buttonsFlags & 0b00000000000000000100000000000000)} - Button 14   (D-Pad Left)
    ${+!!(buttonsFlags & 0b00000000000000001000000000000000)} - Button 15   (D-Pad Right)
    ${+!!(buttonsFlags & 0b00000000000000010000000000000000)} - Button 16   (reserved - Center button)
    ${+!!(buttonsFlags & 0b00000000000000100000000000000000)} - Button 17   (reserved)
    ${+!!(buttonsFlags & 0b00000000000001000000000000000000)} - Button 18   (reserved)
    ${+!!(buttonsFlags & 0b00000000000010000000000000000000)} - Button 19   (Up)
    ${+!!(buttonsFlags & 0b00000000000100000000000000000000)} - Button 20   (Down)
    ${+!!(buttonsFlags & 0b00000000001000000000000000000000)} - Button 21   (Left)
    ${+!!(buttonsFlags & 0b00000000010000000000000000000000)} - Button 22   (Right)
    ${+!!(buttonsFlags & 0b00000000100000000000000000000000)} - Button 23   (Left Stick Up)
    ${+!!(buttonsFlags & 0b00000001000000000000000000000000)} - Button 24   (Left Stick Down)
    ${+!!(buttonsFlags & 0b00000010000000000000000000000000)} - Button 25   (Left Stick Left)
    ${+!!(buttonsFlags & 0b00000100000000000000000000000000)} - Button 26   (Left Stick Right)
    ${+!!(buttonsFlags & 0b00001000000000000000000000000000)} - Button 27   (Right Stick Up)
    ${+!!(buttonsFlags & 0b00010000000000000000000000000000)} - Button 28   (Right Stick Down)
    ${+!!(buttonsFlags & 0b00100000000000000000000000000000)} - Button 29   (Right Stick Left)
    ${+!!(buttonsFlags & 0b01000000000000000000000000000000)} - Button 30   (Right Stick Right)
    ${+!!(buttonsFlags & 0b10000000000000000000000000000000)} - on/off      (on if the gamepad is connected)

    L stick X: ${String(leftStickX).padStart(6, " ")} | ${(leftStickX / INT_16_MAX).toFixed(5).padStart(8, " ")}
    L stick Y: ${String(leftStickY).padStart(6, " ")} | ${(leftStickY / INT_16_MAX).toFixed(5).padStart(8, " ")}
    R stick X: ${String(rightStickX).padStart(6, " ")} | ${(rightStickX / INT_16_MAX).toFixed(5).padStart(8, " ")}
    R stick Y: ${String(rightStickY).padStart(6, " ")} | ${(rightStickY / INT_16_MAX).toFixed(5).padStart(8, " ")}
    L trigger: ${String(leftTrigger).padStart(6, " ")} |  ${(leftTrigger / 256).toFixed(2)}
    R trigger: ${String(rightTrigger).padStart(6, " ")} |  ${(rightTrigger / 255).toFixed(2)}

    ------------------------------------------------

    General vibrations status flags: ${effectStatus.toString(2).padStart(8, "0")}

    ${+!!(effectStatus & 0b00000001)} - Busy (copying the opcode and args)
    ${+!!(effectStatus & 0b00000010)} - Previous effect still running
    ${+!!(effectStatus & 0b00000100)} - Incorrect effect opcode
    ${+!!(effectStatus & 0b00001000)} - Incorrect effect arguments
    ${+!!(effectStatus & 0b00010000)} - (reserved)
    ${+!!(effectStatus & 0b00100000)} - (reserved)
    ${+!!(effectStatus & 0b01000000)} - (reserved)
    ${+!!(effectStatus & 0b10000000)} - Haptics disabled / unavailable
  `;

  $gamepadSettings.textContent = `
    Gamepad settings:

    L stick inner dead zone:     0x${lStickInnerDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(lStickInnerDZ / 255).toFixed(2).padStart(4, "0")}
    L stick outer dead zone:     0x${lStickOuterDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(lStickOuterDZ / 255).toFixed(2).padStart(4, "0")}
    R stick inner dead zone:     0x${rStickInnerDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(rStickInnerDZ / 255).toFixed(2).padStart(4, "0")}
    R stick outer dead zone:     0x${rStickOuterDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(rStickOuterDZ / 255).toFixed(2).padStart(4, "0")}
    L trigger inner dead zone:   0x${lTriggerInnerDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(lTriggerInnerDZ / 255).toFixed(2).padStart(4, "0")}
    L trigger outer dead zone:   0x${lTriggerOuterDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(lTriggerOuterDZ / 255).toFixed(2).padStart(4, "0")}
    R trigger inner dead zone:   0x${rTriggerInnerDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(rTriggerInnerDZ / 255).toFixed(2).padStart(4, "0")}
    R trigger outer dead zone:   0x${rTriggerOuterDZ.toString(16).toUpperCase().padStart(2, "0")} | ${(rTriggerOuterDZ / 255).toFixed(2).padStart(4, "0")}

    L stick acutation point:     0x${lStickActuation.toString(16).toUpperCase().padStart(2, "0")} | ${(lStickActuation / 255).toFixed(2).padStart(4, "0")}
    L stick release point:       0x${lStickRelease.toString(16).toUpperCase().padStart(2, "0")} | ${(lStickRelease / 255).toFixed(2).padStart(4, "0")}
    R stick acutation point:     0x${rStickActuation.toString(16).toUpperCase().padStart(2, "0")} | ${(rStickActuation / 255).toFixed(2).padStart(4, "0")}
    R stick release point:       0x${rStickRelease.toString(16).toUpperCase().padStart(2, "0")} | ${(rStickRelease / 255).toFixed(2).padStart(4, "0")}
    L trigger acutation point:   0x${lTriggerActuation.toString(16).toUpperCase().padStart(2, "0")} | ${(lTriggerActuation / 255).toFixed(2).padStart(4, "0")}
    L trigger release point:     0x${lTriggerRelease.toString(16).toUpperCase().padStart(2, "0")} | ${(lTriggerRelease / 255).toFixed(2).padStart(4, "0")}
    R trigger actuation point:   0x${rTriggerActuation.toString(16).toUpperCase().padStart(2, "0")} | ${(rTriggerActuation / 255).toFixed(2).padStart(4, "0")}
    R trigger release point:     0x${rTriggerRelease.toString(16).toUpperCase().padStart(2, "0")} | ${(rTriggerRelease / 255).toFixed(2).padStart(4, "0")}

    ----------------------------------------

    Gamepad commands:
    
    General vibration effect opcode: 0x${effectOpcode.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 0:  0x${effectArg0.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 1:  0x${effectArg1.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 2:  0x${effectArg2.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 3:  0x${effectArg3.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 4:  0x${effectArg4.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 5:  0x${effectArg5.toString(16).toUpperCase().padStart(4, "0")}        
    General vibration effect arg 6:  0x${effectArg6.toString(16).toUpperCase().padStart(4, "0")}        
  `;
  $buttonsQueue.textContent = `
    Buttons queue:

    Head: 0x${buttonsQueueHead.toString(16).padStart(8, "0")} | ${String(buttonsQueueHead).padStart(2, " ")}
    Tail: 0x${buttonsQueueTail.toString(16).padStart(8, "0")} | ${String(buttonsQueueTail).padStart(2, " ")}

    
  `;
  $axesQueue.textContent = `
    Axes queue:

    Head: 0x00000000 |  0
    Tail: 0x00000000 |  0
    
  `;
});

gampepadController.watch();
