import Loader from "../../engine/loader.js";
import { PlanetEntity, Entity } from "../../engine/entity.js";

// Clase para los disparos
class Bullet extends Entity {
	constructor({ x, y, targetX, targetY, speed = 500, image }) {
		super({ x, y, w: 0, h: 0, image, anchor: { x: 0.5, y: 0.5 } });
		
		// Calcular dirección normalizada
		const dx = targetX - x;
		const dy = targetY - y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		
		this.vx = (dx / dist) * speed;
		this.vy = (dy / dist) * speed;
		
		// Ángulo hacia donde apunta el disparo
		this.angle = Math.atan2(dy, dx);
		
		this.active = true;
	}
	
	update(dt) {
		if (!this.active) return;
		
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	}
}

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
			this.loader.addImage("astronaut", "./assets/img/spaceAstronauts_012.png"),
			this.loader.addImage("shootEffect", "./assets/img/shootEffect.png"),
			this.loader.addAudio("laserSmall", "./assets/audio/laserSmall_000.ogg")
		];

		this.loader.load(manifest).then(() => {
			this.planetImg = this.loader.get("planet05");
			this.astronautImg = this.loader.get("astronaut");
			this.shootEffectImg = this.loader.get("shootEffect");
			this.laserSound = this.loader.get("laserSmall");
			this._initPlanet();
			this._initAstronaut();
			this.assetsLoaded = true;
		});

		// Mouse tracking (coordenadas en píxeles CSS)
		this.mouseX = 0;
		this.mouseY = 0;
		this.astronautAngle = 0;

		// Array para almacenar los disparos activos
		this.bullets = [];

		this._onMouseMove = this._onMouseMove.bind(this);
		this._onClick = this._onClick.bind(this);
		this.canvas.addEventListener("mousemove", this._onMouseMove);
		this.canvas.addEventListener("click", this._onClick);
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
		
		// Actualizar todos los disparos
		const cssW = this.canvas.width / this.dpr;
		const cssH = this.canvas.height / this.dpr;
		
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			bullet.update(dt);
			
			// Eliminar disparos fuera de pantalla
			if (bullet.x < -100 || bullet.x > cssW + 100 || 
			    bullet.y < -100 || bullet.y > cssH + 100) {
				this.bullets.splice(i, 1);
			}
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
		
		// Dibujar todos los disparos
		for (const bullet of this.bullets) {
			bullet.draw(ctx);
		}
	}

	_onMouseMove(e) {
		const rect = this.canvas.getBoundingClientRect();
		// usar coordenadas CSS (clientX/Y) - el canvas ya tiene transform aplicada
		this.mouseX = e.clientX - rect.left;
		this.mouseY = e.clientY - rect.top;
	}
	
	_onClick(e) {
		if (!this.assetsLoaded || !this.planet || !this.shootEffectImg) return;
		
		const rect = this.canvas.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;
		
		// Crear nuevo disparo desde la posición del astronauta hacia el click
		const bullet = new Bullet({
			x: this.planet.x,
			y: this.planet.y,
			targetX: clickX,
			targetY: clickY,
			speed: 500,
			image: this.shootEffectImg
		});
		
		// Ajustar tamaño del disparo (similar al astronauta)
		const base = Math.min(this.planet.w, this.planet.h);
		const bulletScale = 0.06;
		const iw = this.shootEffectImg.width;
		const ih = this.shootEffectImg.height;
		const scale = (base * bulletScale) / Math.max(iw, ih);
		
		bullet.w = iw * scale;
		bullet.h = ih * scale;
		
		this.bullets.push(bullet);
		
		// Reproducir sonido de disparo
		if (this.laserSound) {
			this.laserSound.currentTime = 0; // Reiniciar si ya estaba sonando
			this.laserSound.play().catch(e => console.log('Error reproduciendo audio:', e));
		}
	}
}
