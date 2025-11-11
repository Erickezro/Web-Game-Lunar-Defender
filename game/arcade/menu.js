export class MenuState {
  constructor({ canvas, ctx, startCallback }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.startCallback = startCallback;
  }

  update(dt) {}

  render(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Fondo semitransparente sobre tu imagen espacial
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, w, h);

  }

  onClick() {
    this.startCallback();
  }
}
