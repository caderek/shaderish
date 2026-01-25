export class Vec2 extends Float32Array {
  constructor(a, b, buffer, ptr) {
    super(buffer, ptr, 2);
    this[0] = a;
    this[1] = b;
  }

  get x() {
    return this[0];
  }

  get y() {
    return this[1];
  }

  xy(target) {
    target[0] = this[0];
    target[1] = this[1];
    return target;
  }

  yx(target) {
    target[0] = this[1];
    target[1] = this[0];
    return target;
  }

  xx(target) {
    target[0] = this[0];
    target[1] = this[0];
    return target;
  }

  yy(target) {
    target[0] = this[1];
    target[1] = this[1];
    return target;
  }

  static create(buffer, ptr, ...args) {
    if (args.length === 0) {
      return new Vec2(0, 0, buffer, ptr);
    }

    // @todo Add case when it's a one arg, but a Vec2
    if (args.length === 1) {
      return new Vec2(args[0], args[0], buffer, ptr);
    }

    if (args.length === 2) {
      return new Vec2(args[0], args[1], buffer, ptr);
    }

    throw new Error(`Vec2 can accept max two numbers`);
  }

  static byteSize = 4 * 2;
}

export class Vec4 extends Float32Array {
  constructor(a, b, c, d, buffer, ptr) {
    super(buffer, ptr, 4);
    this[0] = a;
    this[1] = b;
    this[2] = c;
    this[3] = d;
  }

  get x() {
    return this[0];
  }

  get y() {
    return this[1];
  }

  get z() {
    return this[2];
  }

  get w() {
    return this[3];
  }

  xy(target) {
    target[0] = this[0];
    target[1] = this[1];
    return target;
  }

  yx(target) {
    target[0] = this[1];
    target[1] = this[0];
    return target;
  }

  xx(target) {
    target[0] = this[0];
    target[1] = this[0];
    return target;
  }

  yy(target) {
    target[0] = this[0];
    target[1] = this[0];
    return target;
  }

  static create(buffer, ptr, ...args) {
    if (args.length === 0) {
      return new Vec4(0, 0, 0, 0, buffer, ptr);
    }

    // @todo Add case when it's a one arg, but a Vec2
    if (args.length === 1) {
      return new Vec4(args[0], args[0], args[0], args[0], buffer, ptr);
    }

    if (args.length === 4) {
      return new Vec4(args[0], args[1], args[2], args[3], buffer, ptr);
    }

    throw new Error(`Vec4 can accept max four numbers`);
  }

  static byteSize = 4 * 4;
}
