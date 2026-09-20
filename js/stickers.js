/**
 * ============================================================
 * INTERACTIVIDAD DE MÁRGENES LATERALES (STICKER COLLAGE)
 * Precarga de audio, feedback visual y soporte para áreas transparentes
 * ============================================================
 */

(function () {
  'use strict';

  // Configuración de rutas y mapeo de efectos de sonido (SFX) en assets/SFX/
  const STICKER_SOUNDS = {
    // Personajes con audios disponibles en assets/SFX/
    'minion': 'assets/SFX/minion.mp3',
    'pim-gorro': 'assets/SFX/yay pim.mp3',
    'pim': 'assets/SFX/yay pim.mp3',
    'yakuza': 'assets/SFX/yakuza.mp3',
    'gyro': 'assets/SFX/gyro.mp3',
    'bruno': 'assets/SFX/bruno.mp3',
    'clark': 'assets/SFX/clark kent.mp3',
    'clark-kent': 'assets/SFX/clark kent.mp3',
    'hamudd': 'assets/SFX/hamud.mp3',
    'hamud': 'assets/SFX/hamud.mp3',
    'miku': 'assets/SFX/miku.mp3',

    // Mapeo preventivo para el resto si se agregan archivos con su nombre
    'tifa': 'assets/SFX/tifa.mp3',
    'jin': 'assets/SFX/jin.mp3',
    'annie': 'assets/SFX/annie.mp3',
    'tommy': 'assets/SFX/tommy.mp3',
    'ash': 'assets/SFX/ash.mp3',
    'noctis': 'assets/SFX/noctis.mp3'
  };

  // Claves que cuentan con archivo de audio verificado en assets/SFX/
  const ACTIVE_SFX_KEYS = new Set([
    'minion',
    'pim-gorro',
    'pim',
    'yakuza',
    'gyro',
    'bruno',
    'clark',
    'clark-kent',
    'hamudd',
    'hamud',
    'miku'
  ]);

  // Calibración de volumen individual para que todos suenen armoniosos
  const SOUND_VOLUMES = {
    'minion': 0.95,
    'pim-gorro': 0.9,
    'pim': 0.9,
    'yakuza': 0.92,
    'gyro': 0.95,
    'bruno': 0.95,
    'clark': 0.88,
    'clark-kent': 0.88,
    'hamudd': 0.88,
    'hamud': 0.88,
    'miku': 0.88
  };

  function getSoundPath(soundName) {
    if (!soundName) return null;
    return STICKER_SOUNDS[soundName] || `assets/SFX/${soundName}.mp3`;
  }

  // Caché de objetos Audio precargados
  const audioCache = new Map();

  /**
   * Precarga los archivos de audio existentes en segundo plano
   */
  function preloadAudioAssets() {
    ACTIVE_SFX_KEYS.forEach((soundKey) => {
      const soundPath = STICKER_SOUNDS[soundKey];
      if (!soundPath) return;
      try {
        const audio = new Audio(encodeURI(soundPath));
        audio.preload = 'auto';
        audioCache.set(soundKey, audio);
      } catch (err) {
        console.warn(`[Audio] Error al instanciar audio para ${soundKey}:`, err);
      }
    });
  }

  /**
   * Genera un efecto sonoro sintetizado armónico para personajes que aún no tienen archivo MP3
   */
  function playFallbackSynthesizedSound(characterKey) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const charThemes = {
        'tifa': [523.25, 659.25, 783.99],
        'jin': [440, 554.37, 659.25],
        'annie': [659.25, 880, 1046.50],
        'tommy': [349.23, 440, 523.25],
        'ash': [392, 587.33, 783.99],
        'noctis': [440, 659.25, 880]
      };

      const notes = charThemes[characterKey] || [523.25, 659.25, 783.99];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);

        gain.gain.setValueAtTime(0.18, now + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.065 + 0.36);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + 0.38);
      });
    } catch (_) {}
  }

  /**
   * Reproduce el sonido correspondiente al personaje
   * @param {string} soundName Nombre o clave del personaje
   */
  function playStickerSound(soundName) {
    if (!soundName) return;

    try {
      if (ACTIVE_SFX_KEYS.has(soundName)) {
        const soundPath = getSoundPath(soundName);
        if (soundPath) {
          const vol = SOUND_VOLUMES[soundName] || 0.9;
          const soundInstance = new Audio(encodeURI(soundPath));
          soundInstance.volume = vol;

          const playPromise = soundInstance.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              playFallbackSynthesizedSound(soundName);
            });
          }
          return;
        }
      }
    } catch (err) {
      console.warn(`[Audio Warning] Error al reproducir audio de ${soundName}:`, err);
    }

    playFallbackSynthesizedSound(soundName);
  }

  /**
   * Genera pequeñas notas musicales y chispas flotantes al pulsar un sticker
   */
  function spawnStickerNotes(stickerElement) {
    if (!stickerElement) return;

    const symbols = ['♪', '♫', '✦', '★', '✧'];
    const colors = ['#ff6b8b', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#10b981'];
    const count = 4;

    for (let i = 0; i < count; i++) {
      const note = document.createElement('span');
      note.className = 'sticker-note';
      note.textContent = symbols[i % symbols.length];
      note.style.color = colors[Math.floor(Math.random() * colors.length)];

      const angle = (Math.random() - 0.5) * 1.5 - Math.PI / 2;
      const dist = 40 + Math.random() * 45;
      const nx = `${Math.cos(angle) * dist}px`;
      const ny = `${Math.sin(angle) * dist}px`;
      const nr = `${(Math.random() - 0.5) * 60}deg`;

      note.style.setProperty('--nx', nx);
      note.style.setProperty('--ny', ny);
      note.style.setProperty('--nr', nr);
      note.style.left = '50%';
      note.style.top = '50%';

      stickerElement.appendChild(note);
      setTimeout(() => {
        if (note.parentNode) note.remove();
      }, 760);
    }
  }

  /**
   * Aplica feedback visual inmediato (rebote / escala)
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
    }, 350);
  }

  /**
   * Manejador de clic principal en un sticker
   * @param {HTMLElement} sticker
   */
  function handleStickerActivation(sticker) {
    if (!sticker) return;
    const soundName = sticker.getAttribute('data-sound');
    applyClickFeedback(sticker);
    spawnStickerNotes(sticker);
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

  /* ============================================================
   * STICKER DE NOMBRE INTERACTIVO (Edith -> Etid -> etad -> etud)
   * ============================================================ */
  const NAME_STICKERS = [
    { name: 'Edith', src: 'assets/nombres edith/Edith.png' },
    { name: 'Etid',  src: 'assets/nombres edith/Etid.png' },
    { name: 'etad',  src: 'assets/nombres edith/etad.png' },
    { name: 'etud',  src: 'assets/nombres edith/etud.png' }
  ];

  let currentNameIndex = 0;

  /**
   * Sonido sutil sintetizado tipo pop/burbuja usando Web Audio API
   */
  function playPopChirp() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Ignorar si el navegador restringe audio
    }
  }

  /**
   * Genera chispas/estrellas mágicas temporales alrededor del sticker de nombre
   */
  function spawnNameSparkles(button) {
    if (!button) return;
    const emojis = ['✨', '💖', '⭐', '🌸', '💫'];
    const count = 6;

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'hero-name-sparkle';
      sparkle.textContent = emojis[i % emojis.length];

      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 42 + Math.random() * 32;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const drot = `${Math.floor(Math.random() * 60 - 30)}deg`;

      sparkle.style.setProperty('--dx', `${dx.toFixed(1)}px`);
      sparkle.style.setProperty('--dy', `${dy.toFixed(1)}px`);
      sparkle.style.setProperty('--drot', drot);
      sparkle.style.left = '50%';
      sparkle.style.top = '50%';

      button.appendChild(sparkle);

      setTimeout(() => {
        sparkle.remove();
      }, 580);
    }
  }

  /**
   * Cicla secuencialmente los nombres: Edith -> Etid -> etad -> etud -> Edith
   */
  function cycleNameSticker() {
    const btn = document.getElementById('heroNameStickerBtn');
    const img = document.getElementById('heroNameStickerImg');
    if (!btn || !img) return;

    btn.classList.add('has-interacted');
    currentNameIndex = (currentNameIndex + 1) % NAME_STICKERS.length;
    const nextItem = NAME_STICKERS[currentNameIndex];

    // Reiniciar animación elástica
    btn.classList.remove('is-popping');
    void btn.offsetWidth;
    btn.classList.add('is-popping');

    // Actualizar imagen y atributos de accesibilidad
    img.src = nextItem.src;
    img.alt = nextItem.name;
    btn.setAttribute('aria-label', `Nombre: ${nextItem.name}`);

    playPopChirp();
    spawnNameSparkles(btn);

    setTimeout(() => {
      btn.classList.remove('is-popping');
    }, 440);
  }

  /**
   * Inicializa el sticker de nombre en el Hero
   */
  function initHeroNameSticker() {
    const btn = document.getElementById('heroNameStickerBtn');
    if (!btn) return;

    // Precargar todas las imágenes para cambio instantáneo
    NAME_STICKERS.forEach((item) => {
      const preloadImg = new Image();
      preloadImg.src = item.src;
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      cycleNameSticker();
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleNameSticker();
      }
    });
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

    initHeroNameSticker();
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
    cycleHeroName: cycleNameSticker,
    NAME_STICKERS: NAME_STICKERS
  };
})();
