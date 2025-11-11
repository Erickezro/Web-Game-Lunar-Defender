// TODO: clase base de entidad con update/render
// engine/entity.js
class Entity {
  constructor({ x = 0, y = 0, w = 0, h = 0, image = null, anchor = {x:0.5, y:0.5}, visible = true } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = image; // Image object or canvas
    this.anchor = anchor;
    this.visible = visible;
  }

  setImage(img) {
    this.image = img;
    if (!this.w && img) this.w = img.width || img.naturalWidth;
    if (!this.h && img) this.h = img.height || img.naturalHeight;
  }

  update(dt) {
    // override in subclasses
  }

  draw(ctx) {
    if (!this.visible) return;
    if (this.image) {
      const drawX = this.x - this.w * this.anchor.x;
      const drawY = this.y - this.h * this.anchor.y;
      ctx.drawImage(this.image, drawX, drawY, this.w, this.h);
    } else {
      // fallback visual
      ctx.fillStyle = '#f0f';
      ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    }
  }

  getBounds() {
    return {
      x: this.x - this.w * this.anchor.x,
      y: this.y - this.h * this.anchor.y,
      w: this.w,
      h: this.h
    };
  }
}

// Subclase/fábrica para el planeta
class PlanetEntity extends Entity {
  constructor({ canvas, image, scale = 0.6 } = {}) {
    const iw = image.width || image.naturalWidth;
    const ih = image.height || image.naturalHeight;
    const maxW = canvas.width * scale;
    const maxH = canvas.height * scale;
    const factor = Math.min(maxW / iw, maxH / ih);
    const w = iw * factor;
    const h = ih * factor;
    super({
      x: canvas.width / 2,
      y: canvas.height / 2,
      w, h, image, anchor: { x: 0.5, y: 0.5 }
    });
  }
}

if (typeof module !== 'undefined') module.exports = { Entity, PlanetEntity };
export { Entity, PlanetEntity };