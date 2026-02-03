export class Screen {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D | null;
  #width: number;
  #height: number;
  #framebuffer: Uint8ClampedArray;
  #data: ImageData;

  constructor(framebuffer: Uint8ClampedArray, width: number, height: number) {
    this.#canvas = document.createElement("canvas");
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#canvas.classList.add("screen");
    this.#canvas.style.background = "black";
    this.#ctx = this.#canvas.getContext("2d", {
      willReadFrequently: false,
    });

    this.#width = width;
    this.#height = height;
    this.#framebuffer = framebuffer;
    this.#data = new ImageData(this.#framebuffer, width);
  }

  refresh() {
    this.#ctx?.putImageData(this.#data, 0, 0);
  }

  bind(node: HTMLElement) {
    node.appendChild(this.#canvas);
  }
}
