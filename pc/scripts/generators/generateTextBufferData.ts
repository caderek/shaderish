import { TEXT_BUFFER_BYTE_LENGTH } from "../../ramLayout.ts";

const ESCAPE_CODES = {
  NULL: "0",
  BELL: "a",
  BACKSPACE: "b",
  HORIZONTAL_TAB: "t",
  LINE_FEED: "n",
  VERTICAL_TAB: "v",
  FORM_FEED: "f",
  CARRIAGE_RETURN: "r",
  ESCAPE: "e",
};

const COMMANDS = {
  ASCII_CHAR: "ex",
  UNICODE_CHAR: "eu",
  ALT_CHARS_DISABLED: "ea0",
  ALT_CHARS_ENABLED: "ea1",
  BACKGROUND_COLOR: "eb",
  CURSOR_HIDDEN: "ec0",
  CURSOR_VISIBLE: "ec1",
  ERASE_SCREEN: "ees",
  ERASE_LINE: "eel",
  ERASE_AFTER: "eea",
  FOREGROUND_COLOR: "ef",
  MOVE_TO: "emt",
  MOVE_BY: "emb",
  MOVE_UP: "emu",
  MOVE_DOWN: "emd",
  MOVE_LEFT: "eml",
  MOVE_RIGHT: "emr",
  STATE_SAVE: "ess",
  STATE_RESTORE: "esr",
};

const NAMED_COLORS = {
  bg0: 0x0,
  bg1: 0x1,
  bg2: 0x2,
  bg3: 0x3,
  fg0: 0x4,
  fg1: 0x5,
  fg2: 0x6,
  fg3: 0x7,
  magenta: 0x8,
  red: 0x9,
  orange: 0xa,
  yellow: 0xb,
  green: 0xc,
  cyan: 0xd,
  blue: 0xe,
  gray: 0xf,
  grey: 0xf,
};

// "\\0": 0x00, // Null
// "\\a": 0x07, // Bell/Alert
// "\\b": 0x08, // Backspace
// "\\t": 0x09, // Horizontal Tab
// "\\n": 0x0a, // Line Feed
// "\\v": 0x0b, // Vertical Tab
// "\\f": 0x0c, // Form Feed
// "\\r": 0x0d, // Carriage Return
// "\\ex:00-7F;": "ascii char",
// "\\eu:F-FFFFFF;": "unicode",
// "\\eae;": "alt character set enebled",
// "\\ead;": "alt character set disabled",
// "\\eat;": "alt character set toggle",
// "\\eb:0-F;": "background in hex",
// "\\eb:Red;": "background as named color",
// "\\ech;": "cursor hide",
// "\\ecs;": "cursor show",
// "\\ect;": "cursor toggle",
// "\\ees;": "erase screen, cursor to 0,0",
// "\\eel;": "erase line, cursor to x=0",
// "\\eea;": "erase after cursor to the end of line",
// "\\ef:0-F;": "foreground in hex",
// "\\ef:Red;": "foreground as named color",
// "\\emp:X,Y;": "move the caret to the X, Y position",
// "\\emu:X;": "move the caret up X places",
// "\\emd:X;": "move the caret down X places",
// "\\eml:X;": "move the caret left X places",
// "\\emr:X;": "move the caret right X places",
// "\\ess;": "state save",
// "\\esr;": "state restore",

const STATE = {
  NORMAL: 0,
  ESCAPE_CODE: 1,
  COMMAND: 2,
  ARGS: 3,
};

class TerminalDriver {
  #ptr = 0;
  #textBuffer = new Uint8Array(TEXT_BUFFER_BYTE_LENGTH);
  #state = STATE.NORMAL;
  #commandBuffer = "";
  #argsBuffer = "";
  #altChars = false;
  #bgColor = 0x01;
  #fgColor = 0x05;
  #tabSize = 2;

  processChar(char: string) {
    switch (this.#state) {
      case STATE.NORMAL: {
        this.#processNormal(char);
        break;
      }
      case STATE.ESCAPE_CODE: {
        this.#processEscapeCode(char);
        break;
      }
      case STATE.COMMAND: {
        this.#processCommand(char);
        break;
      }
      case STATE.ARGS: {
        this.#processArgs(char);
        break;
      }
    }
  }

  #processNormal(char: string) {
    if (char === "\\") {
      this.#state = STATE.COMMAND;
      return;
    }

    this.#putByte(char.charCodeAt(0));
  }

  #processEscapeCode(char: string) {
    switch (char) {
      case ESCAPE_CODES.NULL: {
        this.#putByte(0x00);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.BELL: {
        this.#putByte(0x07);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.BACKSPACE: {
        this.#putByte(0x08);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.HORIZONTAL_TAB: {
        this.#putByte(0x09);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.LINE_FEED: {
        this.#putByte(0x0a);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.VERTICAL_TAB: {
        this.#putByte(0x0b);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.FORM_FEED: {
        this.#putByte(0x0c);
        this.#state = STATE.NORMAL;
        return;
      }
      case ESCAPE_CODES.CARRIAGE_RETURN: {
        this.#putByte(0x0d);
        this.#state = STATE.NORMAL;
        return;
      }
      case "e": {
        this.#state = STATE.COMMAND;
        return;
      }
    }
  }

  #processCommand(char: string) {
    if (char === ":") {
      this.#state = STATE.ARGS;
      return;
    }

    if (char === ";") {
      this.#execCommand();
      this.#state = STATE.NORMAL;
      return;
    }

    this.#commandBuffer += char;
  }

  #processArgs(char: string) {
    if (char === ";") {
      this.#execCommand();
      this.#state = STATE.NORMAL;
      return;
    }

    this.#argsBuffer += char;
  }

  #putByte(byte: number) {
    const attributes = (this.#bgColor << 4) | this.#fgColor;
    this.#textBuffer[this.#ptr] = byte + 128 * Number(this.#altChars);
    this.#textBuffer[this.#ptr + 1] = attributes;
    this.#ptr += 2;
  }

  #execCommand() {
    switch (this.#commandBuffer) {
      case COMMANDS.BACKGROUND_COLOR: {
        const color = getPaletteColor(this.#argsBuffer);
        if (color !== null) {
          this.#bgColor = color;
          console.log({ color });
        } else {
          console.log({ color });
          // dump raw command
        }
        break;
      }
      case COMMANDS.FOREGROUND_COLOR: {
        const color = getPaletteColor(this.#argsBuffer);
        if (color !== null) {
          this.#fgColor = color;
        } else {
          // dump raw command
        }
        break;
      }
      case COMMANDS.ALT_CHARS_ENABLED: {
        this.#altChars = true;
        break;
      }
      case COMMANDS.ALT_CHARS_DISABLED: {
        this.#altChars = false;
        break;
      }
      case COMMANDS.ASCII_CHAR: {
        const byte = getCharByte(this.#argsBuffer);
        if (byte !== null) {
          this.#putByte(byte);
        } else {
          // dump raw command
        }
        break;
      }
      // @todo - Handle other commands
    }

    this.#clearCommand();
  }

  #clearCommand() {
    this.#commandBuffer = "";
    this.#argsBuffer = "";
  }

  get buffer() {
    return Buffer.from(this.#textBuffer.buffer);
  }
}

function getCharByte(arg: string) {
  if (/^[0-9a-f]{1,2}$/i.test(arg)) {
    return Number(`0x${arg}`);
  }

  return null;
}

function getPaletteColor(color: string) {
  if (/^[0-9a-f]$/i.test(color)) {
    return Number(`0x${color}`);
  }

  const named = NAMED_COLORS[color.trim().toLowerCase()];

  if (named !== undefined) {
    return named;
  }

  return null;
}

export function generateTextBufferData(text: string) {
  const driver = new TerminalDriver();

  for (const char of text) {
    driver.processChar(char);
  }

  return driver.buffer;
}
