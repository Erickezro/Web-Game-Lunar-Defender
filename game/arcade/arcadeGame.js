import Loader from "../../engine/loader.js";
import { PlanetEntity, Entity } from "../../engine/entity.js";

// Clase para los enemigos
class Enemy extends Entity {
	constructor({ x, y, targetX, targetY, speed = 80, image, type = "ship" }) {
		super({ x, y, w: 0, h: 0, image, anchor: { x: 0.5, y: 0.5 } });
		
		this.type = type; // "ship", "meteor", "satellite"
		this.health = type === "meteor" ? 2 : 1; // Los meteoritos necesitan 2 disparos
		
		// Calcular dirección normalizada hacia la luna
		const dx = targetX - x;
		const dy = targetY - y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		
		this.vx = (dx / dist) * speed;
		this.vy = (dy / dist) * speed;
		
		// Ángulo hacia donde apunta el enemigo
		this.angle = Math.atan2(dy, dx);
		
		// Añadir rotación continua para meteoritos
		if (type === "meteor") {
			this.rotationSpeed = (Math.random() - 0.5) * 2; // Rotación aleatoria
		}
		
		this.active = true;
	}
	
	update(dt) {
		if (!this.active) return;
		
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		
		// Rotar meteoritos
		if (this.type === "meteor") {
			this.angle += this.rotationSpeed * dt;
		}
	}
	
	// Método para recibir daño
	hit() {
		this.health--;
		if (this.health <= 0) {
			this.active = false;
			return true; // Enemigo destruido
		}
		return false; // Enemigo aún vivo
	}
}

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
			this.loader.addAudio("laserSmall", "./assets/audio/laserSmall_000.ogg"),
			
			// Imágenes de enemigos - naves
			this.loader.addImage("ship_A", "./assets/img/ship_A.png"),
			this.loader.addImage("ship_B", "./assets/img/ship_B.png"),
			this.loader.addImage("ship_C", "./assets/img/ship_C.png"),
			this.loader.addImage("ship_D", "./assets/img/ship_D.png"),
			this.loader.addImage("ship_E", "./assets/img/ship_E.png"),
			this.loader.addImage("ship_F", "./assets/img/ship_F.png"),
			this.loader.addImage("enemy_E", "./assets/img/enemy_E.png"),
			
			// Meteoritos
			this.loader.addImage("meteor_large", "./assets/img/meteor_large.png"),
			this.loader.addImage("meteor_small", "./assets/img/meteor_small.png"),
			this.loader.addImage("meteor_detailedLarge", "./assets/img/meteor_detailedLarge.png"),
			this.loader.addImage("meteor_detailedSmall", "./assets/img/meteor_detailedSmall.png"),
			
			// Satélites
			this.loader.addImage("satellite_A", "./assets/img/satellite_A.png"),
			this.loader.addImage("satellite_B", "./assets/img/satellite_B.png"),
			this.loader.addImage("satellite_C", "./assets/img/satellite_C.png"),
			this.loader.addImage("satellite_D", "./assets/img/satellite_D.png")
		];

		this.loader.load(manifest).then(() => {
			this.planetImg = this.loader.get("planet05");
			this.astronautImg = this.loader.get("astronaut");
			this.shootEffectImg = this.loader.get("shootEffect");
			this.laserSound = this.loader.get("laserSmall");
			
			// Guardar imágenes de enemigos en arrays
			this.shipImages = [
				this.loader.get("ship_A"),
				this.loader.get("ship_B"),
				this.loader.get("ship_C"),
				this.loader.get("ship_D"),
				this.loader.get("ship_E"),
				this.loader.get("ship_F"),
				this.loader.get("enemy_E")
			];
			
			this.meteorImages = [
				this.loader.get("meteor_large"),
				this.loader.get("meteor_small"),
				this.loader.get("meteor_detailedLarge"),
				this.loader.get("meteor_detailedSmall")
			];
			
			this.satelliteImages = [
				this.loader.get("satellite_A"),
				this.loader.get("satellite_B"),
				this.loader.get("satellite_C"),
				this.loader.get("satellite_D")
			];
			
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
		
		// Array para almacenar los enemigos activos
		this.enemies = [];
		
		// Sistema de spawn de enemigos
		this.enemySpawnTimer = 0;
		this.enemySpawnInterval = 2; // Segundos entre spawns (ajustable)
		this.enemySpeed = 80; // Velocidad base de enemigos
		
		// Sistema de niveles
		this.level = 1;
		this.enemiesDestroyedInLevel = 0;
		this.enemiesToNextLevel = 10; // Enemigos que hay que destruir para pasar de nivel
		this.totalEnemiesDestroyed = 0;
		
		// Display de nivel
		this.levelDisplay = document.getElementById("level-display");
		this.levelValue = document.getElementById("level-value");
		if (this.levelDisplay) {
			this.levelDisplay.style.display = "block";
		}
		this.updateLevelDisplay();
		
		// Estado del juego
		this.gameOver = false;

		this._onMouseMove = this._onMouseMove.bind(this);
		this._onClick = this._onClick.bind(this);
		this.canvas.addEventListener("mousemove", this._onMouseMove);
		this.canvas.addEventListener("click", this._onClick);

		// Sistema de vida
		this.health = 100;
		this.maxHealth = 100;
		this.healthDisplay = document.getElementById("health-display");
		this.healthValue = document.getElementById("health-value");
		
		// Mostrar el cuadro de vida cuando inicia el juego
		if (this.healthDisplay) {
			this.healthDisplay.style.display = "block";
		}
		this.updateHealthDisplay();

		// Sistema de score
		this.score = 0;
		this.scoreDisplay = document.getElementById("score-display");
		this.scoreValue = document.getElementById("score-value");
		
		// Mostrar el cuadro de score cuando inicia el juego
		if (this.scoreDisplay) {
			this.scoreDisplay.style.display = "block";
		}
		this.updateScoreDisplay();
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

	// Método para actualizar la visualización de vida
	updateHealthDisplay() {
		if (this.healthValue) {
			this.healthValue.textContent = Math.max(0, this.health);
			
			// Cambiar color según la vida restante
			const healthPercent = this.health / this.maxHealth;
			if (healthPercent > 0.6) {
				this.healthValue.style.color = "#00ff00";
				this.healthValue.style.textShadow = "0 0 10px rgba(0, 255, 0, 0.5)";
			} else if (healthPercent > 0.3) {
				this.healthValue.style.color = "#ffaa00";
				this.healthValue.style.textShadow = "0 0 10px rgba(255, 170, 0, 0.5)";
			} else {
				this.healthValue.style.color = "#ff0000";
				this.healthValue.style.textShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
			}
		}
	}
	
	// Método para recibir daño
	takeDamage(amount) {
		if (this.gameOver) return;
		
		this.health = Math.max(0, this.health - amount);
		this.updateHealthDisplay();
		
		if (this.health <= 0) {
			this._triggerGameOver();
		}
	}
	
	// Método para Game Over
	_triggerGameOver() {
		this.gameOver = true;
		this.paused = true;
		
		// Guardar estadísticas
		this._saveStats();
		
		// Mostrar panel de Game Over después de un breve delay
		setTimeout(() => {
			this._showGameOverPanel();
		}, 500);
	}
	
	// Guardar estadísticas en localStorage
	_saveStats() {
		try {
			// Obtener estadísticas actuales
			const stats = this._getStats();
			
			// Actualizar si es nuevo récord
			if (this.score > stats.highScore) {
				stats.highScore = this.score;
			}
			
			if (this.level > stats.highestLevel) {
				stats.highestLevel = this.level;
			}
			
			stats.totalEnemiesDestroyed += this.totalEnemiesDestroyed;
			
			// Guardar en localStorage
			localStorage.setItem("lunarDefenderStats", JSON.stringify(stats));
			
			// Actualizar panel de estadísticas
			this._updateStatsPanel();
		} catch (e) {
			console.error("Error guardando estadísticas:", e);
		}
	}
	
	// Obtener estadísticas guardadas
	_getStats() {
		try {
			const saved = localStorage.getItem("lunarDefenderStats");
			if (saved) {
				return JSON.parse(saved);
			}
		} catch (e) {
			console.error("Error leyendo estadísticas:", e);
		}
		
		// Valores por defecto
		return {
			highScore: 0,
			highestLevel: 0,
			totalEnemiesDestroyed: 0
		};
	}
	
	// Actualizar panel de estadísticas en el DOM
	_updateStatsPanel() {
		const stats = this._getStats();
		const statsText = document.querySelector(".stats-text");
		
		if (statsText) {
			statsText.innerHTML = `
				<p>Puntuación más alta: ${stats.highScore}</p>
				<p>Nivel más alto alcanzado: ${stats.highestLevel}</p>
				<p>Enemigos destruidos: ${stats.totalEnemiesDestroyed}</p>
			`;
		}
	}
	
	// Mostrar panel de Game Over
	_showGameOverPanel() {
		// Ocultar displays del juego
		if (this.healthDisplay) this.healthDisplay.style.display = "none";
		if (this.scoreDisplay) this.scoreDisplay.style.display = "none";
		if (this.levelDisplay) this.levelDisplay.style.display = "none";
		
		// Crear o mostrar panel de Game Over
		let gameOverPanel = document.getElementById("gameover-panel");
		
		if (!gameOverPanel) {
			// Crear panel si no existe
			gameOverPanel = document.createElement("div");
			gameOverPanel.id = "gameover-panel";
			gameOverPanel.className = "ui-panel gameover-panel";
			gameOverPanel.innerHTML = `
				<img src="./assets/img/lunar-defender-logo.png" alt="logo Lunar Defender"/>
				<h1 style="color: #ff4444; font-size: 48px; margin: 20px 0;">GAME OVER</h1>
				<div class="gameover-stats">
					<p style="font-size: 24px; margin: 10px 0;">Puntuación Final: <span style="color: #00ff00;">${this.score}</span></p>
					<p style="font-size: 20px; margin: 10px 0;">Nivel Alcanzado: <span style="color: #ffaa00;">${this.level}</span></p>
					<p style="font-size: 20px; margin: 10px 0;">Enemigos Destruidos: <span style="color: #00aaff;">${this.totalEnemiesDestroyed}</span></p>
				</div>
				<div style="width:100%; display:flex; gap: 12px; justify-content:center; margin-top: 24px;">
					<button id="gameover-restart" class="ui-button">Reintentar</button>
					<button id="gameover-menu" class="ui-button">Menú Principal</button>
				</div>
			`;
			document.body.appendChild(gameOverPanel);
			
			// Agregar event listeners
			document.getElementById("gameover-restart").addEventListener("click", () => {
				this._restartGame();
			});
			
			document.getElementById("gameover-menu").addEventListener("click", () => {
				this._returnToMenu();
			});
		} else {
			// Actualizar estadísticas en panel existente
			const statsDiv = gameOverPanel.querySelector(".gameover-stats");
			if (statsDiv) {
				statsDiv.innerHTML = `
					<p style="font-size: 24px; margin: 10px 0;">Puntuación Final: <span style="color: #00ff00;">${this.score}</span></p>
					<p style="font-size: 20px; margin: 10px 0;">Nivel Alcanzado: <span style="color: #ffaa00;">${this.level}</span></p>
					<p style="font-size: 20px; margin: 10px 0;">Enemigos Destruidos: <span style="color: #00aaff;">${this.totalEnemiesDestroyed}</span></p>
				`;
			}
		}
		
		gameOverPanel.style.display = "flex";
	}
	
	// Reiniciar el juego
	_restartGame() {
		// Ocultar panel de Game Over
		const gameOverPanel = document.getElementById("gameover-panel");
		if (gameOverPanel) gameOverPanel.style.display = "none";
		
		// Reiniciar variables del juego
		this.health = this.maxHealth;
		this.score = 0;
		this.level = 1;
		this.enemiesDestroyedInLevel = 0;
		this.totalEnemiesDestroyed = 0;
		this.gameOver = false;
		this.paused = false;
		
		// Limpiar enemigos y balas
		this.enemies = [];
		this.bullets = [];
		
		// Reiniciar intervalos de spawn
		this.enemySpawnInterval = 2;
		this.enemySpeed = 80;
		
		// Actualizar displays
		this.updateHealthDisplay();
		this.updateScoreDisplay();
		this.updateLevelDisplay();
		
		// Mostrar displays del juego
		if (this.healthDisplay) this.healthDisplay.style.display = "block";
		if (this.scoreDisplay) this.scoreDisplay.style.display = "block";
		if (this.levelDisplay) this.levelDisplay.style.display = "block";
	}
	
	// Volver al menú principal
	_returnToMenu() {
		// Ocultar panel de Game Over
		const gameOverPanel = document.getElementById("gameover-panel");
		if (gameOverPanel) gameOverPanel.style.display = "none";
		
		// Recargar la página para volver al menú
		window.location.reload();
	}
	
	// Método para curar/restaurar vida
	heal(amount) {
		this.health = Math.min(this.maxHealth, this.health + amount);
		this.updateHealthDisplay();

		// Pausa
		this.paused = false;
	}

	// ====== ⏸️ Pausa ======
	onKeyDown(ev) {
		// Toggle con 'P' o 'p'
		if (ev.key === 'p' || ev.key === 'P') {
			this.togglePause();
		}
	}

	togglePause() {
		this.paused = !this.paused;
	}

	// Método para actualizar la visualización del score
	updateScoreDisplay() {
		if (this.scoreValue) {
			this.scoreValue.textContent = this.score;
		}
	}
	
	// Método para añadir puntos al score
	addScore(points) {
		if (this.gameOver) return;
		
		this.score += points;
		this.updateScoreDisplay();
	}
	
	// Método para actualizar el display de nivel
	updateLevelDisplay() {
		if (this.levelValue) {
			this.levelValue.textContent = this.level;
		}
	}
	
	// Método para subir de nivel
	_levelUp() {
		this.level++;
		this.enemiesDestroyedInLevel = 0;
		this.updateLevelDisplay();
		
		// Aumentar dificultad
		// Reducir tiempo entre spawns (más enemigos)
		this.enemySpawnInterval = Math.max(0.5, this.enemySpawnInterval - 0.15);
		
		// Aumentar velocidad de enemigos
		this.enemySpeed += 10;
		
		// Mostrar mensaje de nivel
		this._showLevelUpMessage();
	}
	
	// Mostrar mensaje de subida de nivel
	_showLevelUpMessage() {
		// Crear elemento temporal para el mensaje
		const levelUpMsg = document.createElement("div");
		levelUpMsg.style.position = "fixed";
		levelUpMsg.style.top = "50%";
		levelUpMsg.style.left = "50%";
		levelUpMsg.style.transform = "translate(-50%, -50%)";
		levelUpMsg.style.fontSize = "48px";
		levelUpMsg.style.fontWeight = "bold";
		levelUpMsg.style.color = "#ffff00";
		levelUpMsg.style.textShadow = "0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.5)";
		levelUpMsg.style.zIndex = "9999";
		levelUpMsg.style.pointerEvents = "none";
		levelUpMsg.style.animation = "fadeInOut 2s ease-in-out";
		levelUpMsg.textContent = `¡NIVEL ${this.level}!`;
		
		document.body.appendChild(levelUpMsg);
		
		// Remover después de 2 segundos
		setTimeout(() => {
			if (levelUpMsg.parentNode) {
				levelUpMsg.parentNode.removeChild(levelUpMsg);
			}
		}, 2000);
	}
	
	// Método para establecer el score directamente
	setScore(value) {
		this.score = value;
		this.updateScoreDisplay();
	}
	
	// Método para reiniciar el score a 0
	resetScore() {
		this.score = 0;
		this.updateScoreDisplay();
	}

	update(dt) {
		if (this.paused || this.gameOver) return; // detener la lógica mientras está en pausa o game over
		
		if (!this.assetsLoaded) return;
		
		// Calcular ángulo del astronauta hacia el ratón
		if (this.planet) {
			const ang = Math.atan2(this.mouseY - this.planet.y, this.mouseX - this.planet.x);
			this.astronautAngle = ang;
			if (this.astronaut) this.astronaut.angle = ang;
		}
		
		const cssW = this.canvas.width / this.dpr;
		const cssH = this.canvas.height / this.dpr;
		
		// Sistema de spawn de enemigos
		this.enemySpawnTimer += dt;
		if (this.enemySpawnTimer >= this.enemySpawnInterval) {
			this.enemySpawnTimer = 0;
			this._spawnEnemy();
		}
		
		// Actualizar todos los enemigos
		for (let i = this.enemies.length - 1; i >= 0; i--) {
			const enemy = this.enemies[i];
			enemy.update(dt);
			
			// Verificar colisión con la luna
			if (this.planet && this._checkCollision(enemy, this.planet)) {
				this.takeDamage(10); // La luna recibe 10 de daño
				this.enemies.splice(i, 1);
				continue;
			}
			
			// Eliminar enemigos fuera de pantalla (muy lejos)
			if (enemy.x < -200 || enemy.x > cssW + 200 || 
			    enemy.y < -200 || enemy.y > cssH + 200) {
				this.enemies.splice(i, 1);
			}
		}
		
		// Actualizar todos los disparos
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			bullet.update(dt);
			
			// Verificar colisión con enemigos
			let bulletHit = false;
			for (let j = this.enemies.length - 1; j >= 0; j--) {
				const enemy = this.enemies[j];
				if (this._checkCollision(bullet, enemy)) {
					bulletHit = true;
					if (enemy.hit()) {
						// Enemigo destruido
						this.addScore(enemy.type === "meteor" ? 20 : 10);
						this.totalEnemiesDestroyed++;
						this.enemiesDestroyedInLevel++;
						
						// Verificar si se debe subir de nivel
						if (this.enemiesDestroyedInLevel >= this.enemiesToNextLevel) {
							this._levelUp();
						}
						
						this.enemies.splice(j, 1);
					}
					break;
				}
			}
			
			if (bulletHit) {
				this.bullets.splice(i, 1);
				continue;
			}
			
			// Eliminar disparos fuera de pantalla
			if (bullet.x < -100 || bullet.x > cssW + 100 || 
			    bullet.y < -100 || bullet.y > cssH + 100) {
				this.bullets.splice(i, 1);
			}
		}
	}
	
	// Método para verificar colisión entre dos entidades
	_checkCollision(entity1, entity2) {
		const dx = entity1.x - entity2.x;
		const dy = entity1.y - entity2.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		// Radio de colisión (promedio de ancho y alto / 2)
		const radius1 = (entity1.w + entity1.h) / 4;
		const radius2 = (entity2.w + entity2.h) / 4;
		
		return distance < (radius1 + radius2);
	}
	
	// Método para generar un enemigo
	_spawnEnemy() {
		if (!this.planet) return;
		
		const cssW = this.canvas.width / this.dpr;
		const cssH = this.canvas.height / this.dpr;
		
		// Elegir tipo de enemigo aleatoriamente
		const rand = Math.random();
		let enemyType, enemyImages;
		
		if (rand < 0.5) {
			enemyType = "ship";
			enemyImages = this.shipImages;
		} else if (rand < 0.8) {
			enemyType = "meteor";
			enemyImages = this.meteorImages;
		} else {
			enemyType = "satellite";
			enemyImages = this.satelliteImages;
		}
		
		// Elegir imagen aleatoria del tipo
		const randomImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];
		
		// Generar posición aleatoria en los bordes de la pantalla
		let spawnX, spawnY;
		const side = Math.floor(Math.random() * 4); // 0=arriba, 1=derecha, 2=abajo, 3=izquierda
		
		switch(side) {
			case 0: // Arriba
				spawnX = Math.random() * cssW;
				spawnY = -50;
				break;
			case 1: // Derecha
				spawnX = cssW + 50;
				spawnY = Math.random() * cssH;
				break;
			case 2: // Abajo
				spawnX = Math.random() * cssW;
				spawnY = cssH + 50;
				break;
			case 3: // Izquierda
				spawnX = -50;
				spawnY = Math.random() * cssH;
				break;
		}
		
		// Crear enemigo dirigido hacia la luna
		const enemy = new Enemy({
			x: spawnX,
			y: spawnY,
			targetX: this.planet.x,
			targetY: this.planet.y,
			speed: this.enemySpeed + Math.random() * 30, // Velocidad variable
			image: randomImage,
			type: enemyType
		});
		
		// Ajustar tamaño del enemigo
		const base = Math.min(this.planet.w, this.planet.h);
		const enemyScale = enemyType === "meteor" ? 0.08 : 0.10;
		const iw = randomImage.width;
		const ih = randomImage.height;
		const scale = (base * enemyScale) / Math.max(iw, ih);
		
		enemy.w = iw * scale;
		enemy.h = ih * scale;
		
		this.enemies.push(enemy);
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
		
		// Dibujar todos los enemigos
		for (const enemy of this.enemies) {
			enemy.draw(ctx);
		}
		
		// Dibujar todos los disparos
		for (const bullet of this.bullets) {
			bullet.draw(ctx);
		}

		// Overlay de pausa
		if (this.paused) {
			ctx.save();
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(0, 0, cssW, cssH);
			ctx.fillStyle = "#ffffff";
			ctx.font = "900 48px Orbitron, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("PAUSA", cssW / 2, cssH / 2);
			ctx.font = "500 20px Orbitron, sans-serif";
			ctx.fillText("Pulsa P para continuar", cssW / 2, cssH / 2 + 40);
			ctx.restore();
		}
	}

	_onMouseMove(e) {
		const rect = this.canvas.getBoundingClientRect();
		// usar coordenadas CSS (clientX/Y) - el canvas ya tiene transform aplicada
		this.mouseX = e.clientX - rect.left;
		this.mouseY = e.clientY - rect.top;
	}
	
	_onClick(e) {
		if (!this.assetsLoaded || !this.planet || !this.shootEffectImg || this.gameOver) return;
		
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
		
		// Reproducir sonido de disparo (si SFX no está muteado)
		if (this.laserSound && !window.isSfxMuted()) {
			this.laserSound.currentTime = 0; // Reiniciar si ya estaba sonando
			this.laserSound.play().catch(e => console.log('Error reproduciendo audio:', e));
		}
	}
}
