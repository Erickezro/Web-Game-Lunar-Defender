// engine/loader.js
export default class Loader {
	constructor() {
		this.assets = {}; // { key: Image|Audio }
	}

	// Registrar una imagen en el manifest
	addImage(key, url) {
		return { type: 'image', key, url };
	}

	// Registrar audio en el manifest
	addAudio(key, url) {
		return { type: 'audio', key, url };
	}

	// Cargar todos los assets del manifest
	load(manifest = []) {
		const promises = manifest.map(item => {
			if (item.type === 'image') {
				// Carga de imágenes
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => {
						this.assets[item.key] = img;
						resolve(img);
					};
					img.onerror = reject;
					img.src = item.url;
				});
			}

			if (item.type === 'audio') {
				// Carga de audio
				return new Promise((resolve, reject) => {
					const audio = new Audio();
					audio.oncanplaythrough = () => {
						this.assets[item.key] = audio;
						resolve(audio);
					};
					audio.onerror = reject;
					audio.src = item.url;
				});
			}

			return Promise.resolve();
		});

		return Promise.all(promises).then(() => this.assets);
	}

	// Obtener un asset ya cargado
	get(key) {
		return this.assets[key];
	}
}
