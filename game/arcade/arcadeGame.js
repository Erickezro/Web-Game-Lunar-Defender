import Loader from "../../engine/loader.js";
import { PlanetEntity, Entity } from "../../engine/entity.js";

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

		// Crear PlanetEntity usando dimensiones en píxeles CSS
		this.planet = new PlanetEntity({ canvas: { width: cssW, height: cssH }, image: this.planetImg, scale: 0.6 });

		// Inicializar posición del ratón al centro del planeta por defecto
		this.mouseX = this.planet.x;
		this.mouseY = this.planet.y;
	}

	_initAstronaut() {
		if (!this.astronautImg || !this.planet) return;

		// Ajustar tamaño relativo al planeta (usar propiedades w/h de PlanetEntity)
		const base = Math.min(this.planet.w, this.planet.h);
		const aScale = 0.13; // porcentaje del tamaño del planeta
		const iw = this.astronautImg.width;
		const ih = this.astronautImg.height;
		const scale = (base * aScale) / Math.max(iw, ih);

		this.astronaut = new Entity({
			x: this.planet.x,
			y: this.planet.y,
			w: iw * scale,
			h: ih * scale,
			image: this.astronautImg,
			anchor: { x: 0.5, y: 0.5 },
			angle: 0
		});
	}

	update(dt) {
		// Calcular ángulo del astronauta hacia el ratón
		if (this.planet) {
			const ang = Math.atan2(this.mouseY - this.planet.y, this.mouseX - this.planet.x);
			this.astronautAngle = ang;
			if (this.astronaut) this.astronaut.angle = ang;
		}
	}

	render(ctx) {
		ctx = ctx || this.ctx;

		const cssW = this.canvas.width / this.dpr;
		const cssH = this.canvas.height / this.dpr;

		ctx.clearRect(0, 0, cssW, cssH);

		if (!this.assetsLoaded) return;

		// Suavizado HD
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		// Dibujar planeta usando PlanetEntity.draw
		if (this.planet) this.planet.draw(ctx);

		// Dibujar astronauta centrado sobre el planeta (Entity.draw aplica rotación)
		if (this.astronaut) {
			this.astronaut.x = this.planet.x;
			this.astronaut.y = this.planet.y;
			this.astronaut.draw(ctx);
		}
	}

	_onMouseMove(e) {
		const rect = this.canvas.getBoundingClientRect();
		// usar coordenadas CSS (clientX/Y) - el canvas ya tiene transform aplicada
		this.mouseX = e.clientX - rect.left;
		this.mouseY = e.clientY - rect.top;
	}
}
