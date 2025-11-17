# 🌙 LUNAR DEFENDER

## Bienvenidos a mi proyecto

Este proyecto ha sido realizado por **Correa Adrián** y **Romero Erick**.  
![Lunar Defender Logo](./assets/img/lunar-defender-logo.png)

Un juego arcade de defensa espacial desarrollado con **HTML5 Canvas** y **JavaScript vanilla**. Defiende la luna de oleadas infinitas de enemigos espaciales en este emocionante shooter de acción.

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Controles](#controles)
- [Mecánicas del Juego](#mecánicas-del-juego)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Créditos](#créditos)

---

## 🎮 Descripción

**Lunar Defender** es un juego arcade tipo shooter donde el jugador controla a un astronauta que debe defender la luna de oleadas infinitas de enemigos espaciales. El juego presenta un sistema de niveles progresivos con dificultad creciente, múltiples tipos de enemigos y un sistema de puntuación persistente.

### Arquetipo del Juego
- **Tipo:** Arcade Shooter (Top-Down)
- **Género:** Acción, Defensa
- **Plataforma:** Web (HTML5 Canvas)

---

## ✨ Características

### Funcionalidad Principal
- ✅ **Game Loop optimizado** con `RequestAnimationFrame`
- ✅ **Sistema de Estados:** Menú, Juego, Pausa, Game Over
- ✅ **Loader de Assets** asíncrono (imágenes y audio)
- ✅ **High DPI Support** para pantallas retina

### Mecánicas de Juego
- 🎯 **3 Tipos de Enemigos:**
  - **Naves Espaciales:** Rápidas y ágiles (1 disparo)
  - **Meteoritos:** Resistentes con rotación (2 disparos)
  - **Satélites:** Velocidad media (1 disparo)
- 📈 **Sistema de Niveles Progresivos:** Cada 10 enemigos destruidos
- ⚡ **Dificultad Creciente:** Más enemigos y mayor velocidad por nivel
- 💯 **Sistema de Puntuación:** 10 pts (naves/satélites), 20 pts (meteoritos)
- ❤️ **Sistema de Vida:** La luna tiene 100 puntos de vida

### Audio
- 🎵 **Música de Fondo:** Loop espacial continuo
- 🔊 **Efectos de Sonido:** Disparos láser
- 🔇 **Controles de Audio:** Mute independiente para música y SFX

### Persistencia
- 💾 **LocalStorage:** Guarda automáticamente:
  - Puntuación más alta (High Score)
  - Nivel más alto alcanzado
  - Total de enemigos destruidos
  - Preferencias de audio

### UI/UX
- 🎨 **Interfaz Moderna:** Diseño futurista con fuente `Orbitron`
- 📊 **HUD en Tiempo Real:** Muestra la vida, puntuación y nivel
- 🎛️ **Menús Completos:** Principal, Opciones, Estadísticas, Historia, Controles
- 🏆 **Panel de Game Over:** Muestra estadísticas finales

---

## 💻 Requisitos

### Requisitos Mínimos
- **Navegador:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript:** Habilitado
- **Resolución:** 1024x768 o superior
- **Conexión:** No requiere internet (después de cargar)

### Requisitos Recomendados
- **Navegador:** Última versión de Chrome o Firefox
- **Resolución:** 1920x1080
- **Audio:** Altavoces o audífonos

---

## 🚀 Instalación y Ejecución

### Opción 1: Servidor Local (Recomendado)

```bash
# 1. Clonar o descargar el repositorio
git clone https://github.com/Erickezro/Web-Game-Lunar-Defender.git
cd Web-Game-Lunar-Defender


# 2. Abrir en el navegador
Visitar: http://localhost:8000


# Simplemente abrir index.html en tu navegador
# Nota: Algunos navegadores pueden bloquear la carga de assets por CORS

---

## 🎮 Controles

### Controles del Juego

| Acción                | Control         |
|-----------------------|-----------------|
| **Apuntar**           | Mover el mouse  |
| **Disparar**          | Click izquierdo |
| **Pausar/Reanudar**   | Tecla `P`       |

### Navegación de Menús

| Acción                | Control          |
|-----------------------|------------------|
| **Seleccionar opción**| Click en botones |
| **Iniciar juego**     | Botón "Iniciar"  |
| **Ver opciones**      | Botón "Opciones" |
| **Ver estadísticas**  | Botón "Stats"    |
| **Ver historia**      | Botón "Historia" |

### Opciones de Audio

- **Música ON/OFF:** Activa/desactiva la música de fondo
- **SFX ON/OFF:** Activa/desactiva los efectos de sonido
- Las preferencias se guardan automáticamente

---

## 🎯 Mecánicas del Juego

### Objetivo
Defender la luna de oleadas infinitas de enemigos espaciales. El juego termina cuando la vida de la luna llega a 0.

### Sistema de Niveles
- Comienzas en **Nivel 1**
- Cada **10 enemigos destruidos** subes de nivel
- Con cada nivel:
  - ⚡ Los enemigos aparecen más rápido
  - 🚀 Los enemigos se mueven más rápido
  - 💀 La dificultad aumenta progresivamente

### Tipos de Enemigos

#### 🚀 Naves Espaciales
- **Vida:** 1 disparo
- **Puntos:** 10
- **Comportamiento:** Se dirigen directamente a la luna
- **Variantes:** 7 tipos diferentes de naves

#### ☄️ Meteoritos
- **Vida:** 2 disparos
- **Puntos:** 20
- **Comportamiento:** Rotan mientras avanzan hacia la luna
- **Variantes:** 4 tipos diferentes de meteoritos

#### 🛰️ Satélites
- **Vida:** 1 disparo
- **Puntos:** 10
- **Comportamiento:** Velocidad media hacia la luna
- **Variantes:** 4 tipos diferentes de satélites

### Sistema de Daño
- Cada enemigo que toca la luna causa **10 puntos de daño**
- La luna comienza con **100 puntos de vida**
- El color del indicador de vida cambia según el porcentaje:
  - 🟢 Verde: >60% vida
  - 🟡 Amarillo: 30-60% vida
  - 🔴 Rojo: <30% vida

### Game Over
Cuando la vida llega a 0:
1. El juego se detiene
2. Se guardan las estadísticas
3. Se muestra panel con:
   - Puntuación final
   - Nivel alcanzado
   - Enemigos destruidos
4. Opciones: Reintentar o Volver al Menú

---

## 📁 Estructura del Proyecto


---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5 Canvas:** Renderizado gráfico
- **JavaScript ES6+:** Lógica del juego
  - Módulos ES6 (import/export)
  - Clases y herencia
  - Async/Await
- **CSS3:** Estilos y animaciones

### APIs Web
- **Canvas 2D Context:** Dibujo y transformaciones
- **Web Audio API:** Reproducción de audio
- **LocalStorage:** Persistencia de datos
- **RequestAnimationFrame:** Game loop optimizado

### Librerías
- **Google Fonts:** Fuente Orbitron (futurista)
- **Vanilla JS:** Sin frameworks externos

### Herramientas de Desarrollo
- **Git:** Control de versiones
- **VS Code:** Editor de código
- **Live Server:** Servidor de desarrollo

---

## 🎨 Assets y Recursos

### Imágenes
- **Sprites:** 28 imágenes PNG con transparencia
- **Fondo:** Imagen de campo estelar
- **Logo:** Diseño personalizado

### Audio
- **Música:** Loop espacial (MP3)
- **SFX:** Efecto láser (OGG)

### Fuentes
- **Orbitron:** Fuente futurista de Google Fonts
  - Pesos: 400, 500, 700, 900

---

## 📊 Rendimiento

### Optimizaciones Implementadas
- ✅ High DPI rendering (devicePixelRatio)
- ✅ Limpieza automática de entidades fuera de pantalla
- ✅ Carga asíncrona de assets
- ✅ Image smoothing optimizado
- ✅ Reutilización de objetos cuando es posible

### Métricas Esperadas
- **FPS:** >60 en hardware moderno
- **Tiempo de carga:** <2 segundos
- **Uso de memoria:** ~50-100 MB

---

## 🐛 Problemas Conocidos

- ⚠️ En algunos navegadores, el audio puede no reproducirse automáticamente hasta el primer click del usuario (política de autoplay)
- ⚠️ El juego no está optimizado para dispositivos móviles (requiere mouse)

---

## 🔮 Futuras Mejoras

### Planeadas
- [ ] Controles táctiles para móviles
- [ ] Power-ups (escudo, disparo múltiple, ralentización)
- [ ] Más tipos de enemigos
- [ ] Jefes finales (boss fights)
- [ ] Sistema de logros
- [ ] Tabla de clasificación online

### Bonus (Opcional)
- [ ] Modo multijugador cooperativo
- [ ] Minimapa
- [ ] PWA (Progressive Web App)
- [ ] Diferentes planetas para defender

---

**¡Gracias por jugar Lunar Defender! 🌙🚀**
