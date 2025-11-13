import Loader from "../../engine/loader.js";

export class ArcadeGameState {
	constructor({ canvas, ctx } = {}) {
		this.canvas = canvas;
		this.ctx = ctx;

		// High DPI (para que no se pixelee)
		this.dpr = window.devicePixelRatio || 1;
		const cssW = this.canvas.clientWidth || window.innerWidth;
		const cssH = this.canvas.clientHeight || window.innerHeight;

		this.canvas.width = Math.round(cssW * this.dpr);
		this.canvas.height = Math.round(cssH * this.dpr);

		this.canvas.style.width = cssW + "px";
		this.canvas.style.height = cssH + "px";

		// Coord en píxeles CSS
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.ctx.imageSmoothingEnabled = true;

		// Loader
		this.loader = new Loader();
		this.assetsLoaded = false;

		const manifest = [
			this.loader.addImage("planet05", "./assets/img/planet05.png")
		];

		this.loader.load(manifest).then(() => {
			this.planetImg = this.loader.get("planet05");
			this._initPlanet();
			this.assetsLoaded = true;
		});
	}

	// Configura tamaño y posición
	_initPlanet() {
		const cssW = this.canvas.width / this.dpr;
		const cssH = this.canvas.height / this.dpr;

		// Tamaño recomendado: 40% del lado menor
		const size = Math.min(cssW, cssH) * 0.6;

		this.planet = {
			x: cssW / 2,
			y: cssH / 2,
			width: size,
			height: size,
			img: this.planetImg
		};
	}

	update(dt) {
		// Nada por ahora
	}

	render(ctx) {
		ctx = ctx || this.ctx;

		const cssW = this.canvas.width / this.dpr;
		const cssH = this.canvas.height / this.dpr;

		ctx.clearRect(0, 0, cssW, cssH);

		if (!this.assetsLoaded) return;

		const p = this.planet;
		const img = p.img;

		// Mantener proporción real de la imagen
		const iw = img.width;
		const ih = img.height;

		const scale = Math.min(p.width / iw, p.height / ih);
		const drawW = iw * scale;
		const drawH = ih * scale;

		const drawX = p.x - drawW / 2;
		const drawY = p.y - drawH / 2;

		// Suavizado HD
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		// Dibujar planeta centrado
		ctx.drawImage(img, drawX, drawY, drawW, drawH);
	}
}
