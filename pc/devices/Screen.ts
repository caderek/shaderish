export class Screen {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D | null;
  #width: number;
  #height: number;
  #integerScaling: boolean;
  #framebuffer: Uint8ClampedArray;
  #data: ImageData;
  #pixelRatio = devicePixelRatio ?? 1;

  constructor(
    framebuffer: Uint8ClampedArray,
    width: number,
    height: number,
    integerScaling = true,
  ) {
    this.#canvas = document.createElement("canvas");
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#canvas.classList.add("screen");
    this.#canvas.style.background = "#000";
    this.#canvas.style.setProperty("--base-width", String(width));
    this.#ctx = this.#canvas.getContext("2d", {
      willReadFrequently: false,
    });

    this.#width = width;
    this.#height = height;
    this.#integerScaling = integerScaling;
    this.#framebuffer = framebuffer;
    this.#data = new ImageData(this.#framebuffer, width);

    this.#scale();
    this.#registerHandlers();
  }

  #scale() {
    const ww = window.innerWidth * devicePixelRatio;
    const wh = window.innerHeight * devicePixelRatio;

    const scaleHorizontal = ww / this.#width;
    const scaleVertical = Math.max(1 * devicePixelRatio, wh / this.#height);
    const rawScale = Math.min(scaleHorizontal, scaleVertical);

    const dprScale =
      this.#integerScaling && rawScale > 1 ? Math.floor(rawScale) : rawScale;
    const scale = dprScale / devicePixelRatio;

    document.body.style.setProperty("--scale", String(scale));
  }

  #registerHandlers() {
    window.addEventListener("resize", (e) => {
      this.#scale();
    });
  }

  refresh() {
    this.#ctx?.putImageData(this.#data, 0, 0);
  }

  bind(node: HTMLElement) {
    node.appendChild(this.#canvas);
  }
}
