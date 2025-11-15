export class MenuState {
  constructor({ canvas, ctx, startCallback }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.startCallback = startCallback;
    
    // Referencias a los elementos del DOM
    this.uiPanel = document.getElementById("ui-panel");
    this.healthDisplay = document.getElementById("health-display");
    this.scoreDisplay = document.getElementById("score-display");
    
    // Mostrar el panel del menú y ocultar los displays del juego
    this.show();
  }
  
  // Método para mostrar el menú
  show() {
    if (this.uiPanel) this.uiPanel.style.display = "flex";
    if (this.healthDisplay) this.healthDisplay.style.display = "none";
    if (this.scoreDisplay) this.scoreDisplay.style.display = "none";
  }
  
  // Método para ocultar el menú
  hide() {
    if (this.uiPanel) this.uiPanel.style.display = "none";
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
