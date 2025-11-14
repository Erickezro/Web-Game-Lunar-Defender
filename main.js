// Punto de entrada del juego (examen final)
import { MenuState } from "./game/arcade/menu.js";
import { ArcadeGameState } from "./game/arcade/arcadeGame.js";
import { StateManager, STATES } from "./engine/stateManager.js";
import Loader from "./engine/loader.js";

// === Canvas y contexto ===
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// === Administrador de estados ===
const stateManager = new StateManager({ canvas, ctx });

// Registrar los estados del juego
stateManager
  .register(STATES.MENU, ({ canvas, ctx }) => new MenuState({
    canvas,
    ctx,
    startCallback: () => stateManager.change(STATES.GAME),
  }))
  .register(STATES.GAME, ({ canvas, ctx }) => new ArcadeGameState({ canvas, ctx }));

// Iniciar en el menú
stateManager.change(STATES.MENU);



// ===== 🎵 Música de fondo =====
const musicSrc = "./assets/audio/Space Fighter Loop.mp3";
const bgMusic = new Audio(musicSrc);
bgMusic.loop = true;
bgMusic.volume = 0.5;

function isMusicMutedFromStorage() {
  try { return localStorage.getItem("musicMuted") === "true"; }
  catch { return false; }
}

function setMusicMuted(muted) {
  bgMusic.muted = !!muted;
  try { localStorage.setItem("musicMuted", muted ? "true" : "false"); } catch {}
  const btn = document.getElementById("opt-mute-music");
  if (btn) btn.textContent = muted ? "Musica OFF" : "Musica ON";
}

function toggleMusic() {
  setMusicMuted(!bgMusic.muted);
}

function ensureMusicPlaying() {
  if (bgMusic.paused && !bgMusic.muted) {
    bgMusic.play().catch(() => {
      // El navegador podría bloquear autoplay
    });
  }
}

// Inicia el estado de mute según localStorage
setTimeout(() => setMusicMuted(isMusicMutedFromStorage()), 0);

// === Permitir reproducir música al primer clic en cualquier parte ===
document.addEventListener("click", () => {
  ensureMusicPlaying();
}, { once: true });


// ===== 🔁 Bucle principal =====
let last = 0;
function loop(ts) {
  const dt = (ts - last) / 1000;
  last = ts;

  stateManager.update(dt);
  stateManager.render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);



// ===== 🧩 Conexión con la interfaz HTML (UI) =====
const uiPanel = document.getElementById("ui-panel");
const startBtn = document.getElementById("start-btn");
const optionsBtn = document.getElementById("options-btn");

// Panel de opciones y botones
const optionsPanel = document.getElementById("options-panel");
const optBackBtn = document.getElementById("opt-back");
const optMuteMusicBtn = document.getElementById("opt-mute-music");

// Panel de historia
const historyBtn = document.getElementById("history-btn");
const historyPanel = document.getElementById("history-panel");
const histBackBtn = document.getElementById("history-back");

// Panel de estadisticas
const statsBtn = document.getElementById("stats-btn");
const statsPanel = document.getElementById("stats-panel");
const statsBackBtn = document.getElementById("stats-back");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    stateManager.change(STATES.GAME);
    if (uiPanel) uiPanel.style.display = "none";
  });
}

if (optionsBtn) {
  optionsBtn.addEventListener("click", () => {
    if (uiPanel) uiPanel.style.display = "none";
    if (optionsPanel) optionsPanel.style.display = "flex";
  });
}

if (optBackBtn) {
  optBackBtn.addEventListener("click", () => {
    if (optionsPanel) optionsPanel.style.display = "none";
    if (uiPanel) uiPanel.style.display = "flex";
  });
}

if (optMuteMusicBtn) {
  optMuteMusicBtn.textContent = bgMusic.muted ? "Musica OFF" : "Musica ON";
  optMuteMusicBtn.addEventListener("click", () => {toggleMusic(), ensureMusicPlaying()});
}

if (historyBtn) {
  historyBtn.addEventListener("click", () => {
    if (uiPanel) uiPanel.style.display = "none";
    if (historyPanel) historyPanel.style.display = "flex";
  });
}

if (histBackBtn) {
  histBackBtn.addEventListener("click", () => {
    if (historyPanel) historyPanel.style.display = "none";
    if (uiPanel) uiPanel.style.display = "flex";
  });
}

if (statsBtn) {
  statsBtn.addEventListener("click", () => {
    if (uiPanel) uiPanel.style.display = "none";
    if (statsPanel) statsPanel.style.display = "flex";
  });
}

if (statsBackBtn) {
  statsBackBtn.addEventListener("click", () => {
    if (statsPanel) statsPanel.style.display = "none";
    if (uiPanel) uiPanel.style.display = "flex";
  });
}