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
			this.loader.addImage("planet05", "./assets/img/planet05.png"),
			this.loader.addImage("astronaut", "./assets/img/spaceAstronauts_012.png")
		];

		this.loader.load(manifest).then(() => {
			this.planetImg = this.loader.get("planet05");
			this.astronautImg = this.loader.get("astronaut");
			this._initPlanet();
			this._initAstronaut();
			this.assetsLoaded = true;
		});

		// Mouse tracking (coordenadas en píxeles CSS)
		this.mouseX = 0;
		this.mouseY = 0;
		this.astronautAngle = 0;

		this._onMouseMove = this._onMouseMove.bind(this);
		this.canvas.addEventListener("mousemove", this._onMouseMove);
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

		// Inicializar posición del ratón al centro del planeta por defecto
		this.mouseX = this.planet.x;
		this.mouseY = this.planet.y;
	}

	_initAstronaut() {
		if (!this.astronautImg || !this.planet) return;

		// Ajustar tamaño relativo al planeta
		const base = Math.min(this.planet.width, this.planet.height);
		const aScale = 0.13; //%  del tamaño del planeta
		const iw = this.astronautImg.width;
		const ih = this.astronautImg.height;
		const scale = (base * aScale) / Math.max(iw, ih);

		this.astronaut = {
			img: this.astronautImg,
			width: iw * scale,
			height: ih * scale,
			x: this.planet.x,
			y: this.planet.y
		};
	}

	update(dt) {
		// Calcular ángulo del astronauta hacia el ratón
		if (this.planet) {
			this.astronautAngle = Math.atan2(this.mouseY - this.planet.y, this.mouseX - this.planet.x);
		}
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

		// Dibujar astronauta centrado sobre el planeta y rotado hacia el ratón
		if (this.astronaut && this.astronaut.img) {
			const a = this.astronaut;
			// Actualizar posición para que siga el centro del planeta
			a.x = p.x;
			a.y = p.y;

			ctx.save();
			ctx.translate(a.x, a.y);
			ctx.rotate(this.astronautAngle);
			ctx.drawImage(a.img, -a.width / 2, -a.height / 2, a.width, a.height);
			ctx.restore();
		}
	}

	_onMouseMove(e) {
		const rect = this.canvas.getBoundingClientRect();
		// usar coordenadas CSS (clientX/Y) - el canvas ya tiene transform aplicada
		this.mouseX = e.clientX - rect.left;
		this.mouseY = e.clientY - rect.top;
	}
}
