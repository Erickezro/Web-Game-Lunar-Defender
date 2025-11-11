export class ArcadeGameState {
  constructor({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  update(dt) {
    // aquí irá la lógica real del juego
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("🎮 Jugando... (lógica en desarrollo)", this.canvas.width /2, this.canvas.height /2);
  }
}
