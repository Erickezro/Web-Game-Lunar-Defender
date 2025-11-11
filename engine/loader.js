// TODO: preloading de assets (imagenes, audio)
// engine/loader.js
class Loader {
  constructor() {
    this.assets = {};        // { key: Image|Audio }
    this._progressCb = null;
  }

  addImage(key, url) {
    return { type: 'image', key, url };
  }

  addAudio(key, url) {
    return { type: 'audio', key, url };
  }

  onProgress(cb) {
    this._progressCb = cb;
  }

  load(manifest = []) {
    const total = manifest.length;
    let loaded = 0;
    const promises = manifest.map(item => {
      if (item.type === 'image') {
        return new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => {
            this.assets[item.key] = img;
            loaded++;
            if (this._progressCb) this._progressCb(loaded, total, item.key);
            res(img);
          };
          img.onerror = (e) => {
            console.error('Failed to load image', item.url, e);
            loaded++;
            if (this._progressCb) this._progressCb(loaded, total, item.key, true);
            // fallback: create a placeholder canvas as image proxy
            const placeholder = document.createElement('canvas');
            placeholder.width = 128; placeholder.height = 128;
            const ctx = placeholder.getContext('2d');
            ctx.fillStyle = '#900'; ctx.fillRect(0,0,128,128);
            ctx.fillStyle = '#fff'; ctx.fillText('img err',10,64);
            this.assets[item.key] = placeholder;
            res(placeholder);
          };
          img.src = item.url;
        });
      } else if (item.type === 'audio') {
        return new Promise((res, rej) => {
          const audio = new Audio();
          audio.oncanplaythrough = () => {
            this.assets[item.key] = audio;
            loaded++;
            if (this._progressCb) this._progressCb(loaded, total, item.key);
            res(audio);
          };
          audio.onerror = (e) => {
            console.warn('Failed to load audio', item.url, e);
            loaded++;
            if (this._progressCb) this._progressCb(loaded, total, item.key, true);
            this.assets[item.key] = null;
            res(null);
          };
          audio.src = item.url;
          // optional: audio.load();
        });
      } else {
        return Promise.resolve();
      }
    });

    return Promise.all(promises).then(() => this.assets);
  }

  get(key) {
    return this.assets[key];
  }

  // Dibuja la imagen del key centrada en el canvas como splash.
  showSplash(ctx, key, { width = ctx.canvas.width, height = ctx.canvas.height, scale = 1 } = {}) {
    const img = this.get(key);
    if (!img) return;
    const iw = img.width || img.naturalWidth || ctx.canvas.width;
    const ih = img.height || img.naturalHeight || ctx.canvas.height;
    const scaleFactor = Math.min((width*scale) / iw, (height*scale) / ih);
    const drawW = iw * scaleFactor;
    const drawH = ih * scaleFactor;
    const x = (width - drawW) / 2;
    const y = (height - drawH) / 2;
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, x, y, drawW, drawH);
  }
}

// Export para usarlo en el proyecto
if (typeof module !== 'undefined') module.exports = Loader;
export default Loader;