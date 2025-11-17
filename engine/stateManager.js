// TODO: implementar estados (menu, juego, pausa, gameover)
export const STATES = {
  MENU: 'menu',
  GAME: 'game',
  PAUSE: 'pause',
  GAME_OVER: 'gameover',
};

export class StateManager {
  constructor({ canvas, ctx } = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this._current = null;
    this._stack = [];
    this._registry = new Map();
  }

  // Registra estados por nombre: factory => (ctx) => new State(...)
  register(name, factory) {
    this._registry.set(name, factory);
    return this;
  }

  // Cambia al estado indicado (descarta el actual)
  change(nameOrState, payload = {}) {
    const next = typeof nameOrState === 'string'
      ? this._create(nameOrState, payload)
      : nameOrState;

    if (this._current?.onExit) this._current.onExit();
    this._current = next;
    if (this._current?.onEnter) this._current.onEnter(payload);
    return this._current;
  }

  update(dt) {
    this._current?.update?.(dt);
  }

  render() {
    this._current?.render?.(this.ctx);
  }

  // Helpers de eventos (intenta varios nombres comunes)
  handleClick(ev) {
    const s = this._current;
    if (!s) return;
    if (s.handleClick) return s.handleClick(ev);
    if (s.onClick) return s.onClick(ev);
    if (s.onPointerDown) return s.onPointerDown(ev);
  }

  handleKeyDown(ev) {
    this._current?.onKeyDown?.(ev);
  }

  handleKeyUp(ev) {
    this._current?.onKeyUp?.(ev);
  }

  _create(name, payload) {
    const factory = this._registry.get(name);
    if (!factory) throw new Error(`Estado no registrado: ${name}`);
    return factory({ canvas: this.canvas, ctx: this.ctx, ...payload });
  }
}
