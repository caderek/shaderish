export class Vec2 {
	x;
	y;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(that) {
		return new Vec2(this.x + that.x, this.y + that.y);
	}

	sub(that) {
		return new Vec2(this.x - that.x, this.y - that.y);
	}

	mul(scalar) {
		return new Vec2(this.x * scalar, this.y * scalar);
	}

	get xy() {
		return new Vec2(this.x, this.y);
	}

	get uv() {
		return new Vec2(this.x, this.y);
	}

	get yx() {
		return new Vec2(this.y, this.x);
	}

	get vu() {
		return new Vec2(this.y, this.x);
	}

	get xx() {
		return new Vec2(this.x, this.x);
	}

	get yy() {
		return new Vec2(this.y, this.y);
	}

	get uu() {
		return new Vec2(this.x, this.x);
	}

	get vv() {
		return new Vec2(this.y, this.y);
	}
}
