/**
 * ============================================================
 * INTERACTIVIDAD DE MÁRGENES LATERALES (STICKER COLLAGE)
 * Precarga de audio, feedback visual y soporte para áreas transparentes
 * ============================================================
 */

(function () {
  'use strict';

  // Configuración de rutas
  const SOUNDS_DIR = './sounds/';
  const SUPPORTED_SOUNDS = [
    'yakuza',
    'tommy',
    'pim-gorro',
    'annie',
    'jin',
    'tifa',
    'minion',
    'gyro',
    'ash',
    'bruno',
    'clark',
    'hamudd',
    'noctis',
    'miku'
  ];

  // Caché de objetos Audio precargados
  const audioCache = new Map();

  /**
   * Precarga todos los archivos de audio en segundo plano
   */
  function preloadAudioAssets() {
    SUPPORTED_SOUNDS.forEach((soundName) => {
      try {
        const audio = new Audio(`${SOUNDS_DIR}${soundName}.mp3`);
        audio.preload = 'auto';
        audioCache.set(soundName, audio);
      } catch (err) {
        console.warn(`[Audio] Error al instanciar audio para ${soundName}:`, err);
      }
    });
  }

  /**
   * Reproduce el sonido correspondiente al personaje
   * @param {string} soundName Nombre del archivo de audio (sin extensión)
   */
  function playStickerSound(soundName) {
    if (!soundName) return;

    try {
      let baseAudio = audioCache.get(soundName);
      if (!baseAudio) {
        baseAudio = new Audio(`${SOUNDS_DIR}${soundName}.mp3`);
        audioCache.set(soundName, baseAudio);
      }

      // Clonamos el nodo para soportar pulsaciones consecutivas sin cortar el sonido anterior
      const soundInstance = baseAudio.cloneNode();
      soundInstance.volume = 0.85;

      const playPromise = soundInstance.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // El navegador puede bloquear el audio hasta la primera interacción o si el archivo no existe aún
          console.info(
            `[Audio Info] Nota: "${soundName}.mp3" aún no se encuentra en ${SOUNDS_DIR} o requiere interacción previa.`,
            err.message
          );
        });
      }
    } catch (err) {
      console.warn(`[Audio Warning]`, err);
    }
  }

  /**
   * Aplica feedback visual inmediato (rebote / escala 0.95)
   * @param {HTMLElement} stickerElement El contenedor del sticker
   */
  function applyClickFeedback(stickerElement) {
    if (!stickerElement) return;

    stickerElement.classList.remove('is-clicked');
    // Forzamos reflow para permitir reanimar en clics sucesivos
    void stickerElement.offsetWidth;
    stickerElement.classList.add('is-clicked');

    setTimeout(() => {
      stickerElement.classList.remove('is-clicked');
    }, 320);
  }

  /**
   * Manejador de clic principal en un sticker
   * @param {HTMLElement} sticker
   */
  function handleStickerActivation(sticker) {
    const soundName = sticker.getAttribute('data-sound');
    applyClickFeedback(sticker);
    playStickerSound(soundName);
  }

  /**
   * Solución avanzada para clics en áreas transparentes de PNGs superpuestos:
   * Si el usuario hace clic sobre una zona con opacidad 0 de una imagen frontal,
   * el evento se delega al personaje que esté visiblemente detrás.
   */
  function setupTransparentPixelHitDetection() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    document.addEventListener('click', function (e) {
      const targetImg = e.target.closest('.sticker-img');
      if (!targetImg || !ctx) return;

      const sticker = targetImg.closest('.sticker-item');
      if (!sticker) return;

      try {
        const rect = targetImg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Proporción entre coordenadas renderizadas y tamaño natural del PNG
        const scaleX = targetImg.naturalWidth / rect.width;
        const scaleY = targetImg.naturalHeight / rect.height;
        const naturalX = Math.floor(clickX * scaleX);
        const naturalY = Math.floor(clickY * scaleY);

        if (
          naturalX >= 0 &&
          naturalX < targetImg.naturalWidth &&
          naturalY >= 0 &&
          naturalY < targetImg.naturalHeight
        ) {
          ctx.clearRect(0, 0, 1, 1);
          ctx.drawImage(targetImg, naturalX, naturalY, 1, 1, 0, 0, 1, 1);
          const pixel = ctx.getImageData(0, 0, 1, 1).data;
          const alpha = pixel[3]; // Valor alfa de 0 a 255

          // Si el píxel es totalmente transparente (alpha < 15), buscar elemento visible detrás
          if (alpha < 15) {
            e.stopPropagation();
            // Desactivar temporalmente el sticker actual
            const originalPointerEvents = sticker.style.pointerEvents;
            sticker.style.pointerEvents = 'none';

            // Localizar el elemento que está debajo
            const underElements = document.elementsFromPoint(e.clientX, e.clientY);
            const behindSticker = underElements.find(
              (el) => el.closest('.sticker-item') && el.closest('.sticker-item') !== sticker
            );

            sticker.style.pointerEvents = originalPointerEvents;

            if (behindSticker) {
              const targetBehind = behindSticker.closest('.sticker-item');
              handleStickerActivation(targetBehind);
              return;
            }
          }
        }
      } catch (err) {
        // En entornos sin acceso a canvas (CORS local file://), falla limpiamente al handler estándar
      }
    }, true);
  }

  /**
   * Inicialización de eventos en los stickers
   */
  function initStickerInteractions() {
    const stickers = document.querySelectorAll('.sticker-item');

    stickers.forEach((sticker) => {
      // Evento de clic en ratón / tap en táctil
      sticker.addEventListener('click', function (e) {
        handleStickerActivation(this);
      });

      // Soporte de accesibilidad por teclado (Enter o Espacio)
      sticker.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStickerActivation(this);
        }
      });
    });

    preloadAudioAssets();
    setupTransparentPixelHitDetection();
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickerInteractions);
  } else {
    initStickerInteractions();
  }

  // Exponer API global opcional por si se requiere invocar programáticamente
  window.StickerCollage = {
    playSound: playStickerSound,
    preload: preloadAudioAssets,
  };
})();
