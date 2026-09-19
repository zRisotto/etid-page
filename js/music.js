/**
 * ============================================================
 * MÓDULO: CONTROLADOR DE MÚSICA Y AUDIO POR SECCIONES
 * ============================================================
 * - Inicio (Loader/Lluvia Matrix): Pastel Ghost - When You Sleep.mp3 (loop)
 * - Sección 1 (Hero): NewJeans - Cool With You (.mp3
 * - Sección 2 (Carta): Deftones_ Entombed.mp3
 * - Sección 3 (Evolución): Strawberry Guy - What Would I Do.mp3
 * - Sección 4 (Recuerdos): Gorillaz Empire Ants .mp3
 * - Sección 5 (Deseo/Velas): Silencio ambiental para soplar las velas
 * - SFX Velas completadas: FF VII victory theme.mp3
 * - Transiciones suaves de volumen (crossfading) al hacer scroll arriba y abajo.
 */

(function () {
  const TRACKS = {
    loader: 'assets/Songs/Pastel Ghost - When You Sleep.mp3',
    hero: 'assets/Songs/NewJeans - Cool With You (.mp3',
    letter: 'assets/Songs/Deftones_ Entombed.mp3',
    growth: 'assets/Songs/Strawberry Guy - What Would I Do.mp3',
    gallery: 'assets/Songs/Gorillaz Empire Ants .mp3',
    wish: null // Sin música de fondo para la sección de velas
  };

  const SFX_VICTORY = 'assets/SFX/FF VII victory theme.mp3';
  const TARGET_VOLUME = 0.72;
  const FADE_DURATION = 1800; // 1.8 segundos de crossfade suave

  // Almacén de instancias HTMLAudioElement
  const audioElements = {};
  let currentTrackKey = null;
  let isMuted = false;
  let hasUserInteracted = false;
  let isSiteActive = false;
  let activeFades = new Map(); // audio -> animation/interval ID

  /**
   * Crea o devuelve una instancia de Audio configurada para una clave
   */
  function getAudio(key) {
    if (!key || !TRACKS[key]) return null;
    if (!audioElements[key]) {
      const audio = new Audio(encodeURI(TRACKS[key]));
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.load();
      audioElements[key] = audio;
    }
    return audioElements[key];
  }

  /**
   * Modifica suavemente el volumen de un elemento de audio
   */
  function fadeAudio(audio, startVol, targetVol, duration, onComplete) {
    if (!audio) return;

    // Cancelar cualquier fade previo en este audio
    if (activeFades.has(audio)) {
      clearInterval(activeFades.get(audio));
      activeFades.delete(audio);
    }

    audio.volume = Math.max(0, Math.min(1, startVol));
    const stepTime = 50;
    const steps = Math.max(1, Math.floor(duration / stepTime));
    const volDelta = (targetVol - startVol) / steps;
    let currentStep = 0;

    const intervalId = setInterval(() => {
      currentStep++;
      const nextVol = Math.max(0, Math.min(1, startVol + volDelta * currentStep));
      audio.volume = isMuted ? 0 : nextVol;

      if (currentStep >= steps) {
        clearInterval(intervalId);
        activeFades.delete(audio);
        audio.volume = isMuted ? 0 : targetVol;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }, stepTime);

    activeFades.set(audio, intervalId);
  }

  /**
   * Inicia la música de la pantalla de carga (Pastel Ghost)
   */
  function playLoaderMusic() {
    if (isSiteActive) return;

    const loaderAudio = getAudio('loader');
    if (!loaderAudio) return;

    currentTrackKey = 'loader';

    loaderAudio.play().then(() => {
      // Solo subir el volumen si seguimos dentro de la pantalla de carga
      if (!isSiteActive && currentTrackKey === 'loader') {
        fadeAudio(loaderAudio, loaderAudio.volume, TARGET_VOLUME, 1200);
      } else {
        loaderAudio.pause();
        loaderAudio.volume = 0;
        loaderAudio.currentTime = 0;
      }
    }).catch(() => {
      // Si el navegador bloqueó el autoplay sin interacción,
      // se activará con el listener de gestos iniciales
    });
  }

  // Listener global para desbloquear audio en la primera interacción del usuario
  function handleFirstUserInteraction(e) {
    if (hasUserInteracted) return;

    // Detectar si el usuario interactuó con un botón para avanzar o entrar al sitio principal
    const isEntering = e && e.target && (
      e.target.closest('#enter-btn') ||
      e.target.closest('#skip-btn') ||
      e.target.closest('#loading-number')
    );

    hasUserInteracted = true;

    // Si aún está en la pantalla de carga y NO está entrando al sitio, reproducir Pastel Ghost
    if (!isSiteActive && !isEntering) {
      playLoaderMusic();
    }
  }

  window.addEventListener('pointerdown', handleFirstUserInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstUserInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstUserInteraction, { passive: true });

  /**
   * Transiciona suavemente de la pantalla de carga a la sección Hero
   */
  function transitionFromLoader() {
    isSiteActive = true;
    hasUserInteracted = true;
    const prevAudio = getAudio('loader');
    const heroAudio = getAudio('hero');

    // Desvanecer música de carga
    if (prevAudio) {
      if (activeFades.has(prevAudio)) {
        clearInterval(activeFades.get(prevAudio));
        activeFades.delete(prevAudio);
      }

      // Si estaba efectivamente reproduciéndose y audible, desvanecer suavemente
      if (!prevAudio.paused && prevAudio.currentTime > 0 && prevAudio.volume > 0.02) {
        fadeAudio(prevAudio, prevAudio.volume, 0, 1800, () => {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        });
      } else {
        // Si no estaba sonando o apenas iniciaba, silenciar y pausar inmediatamente
        prevAudio.pause();
        prevAudio.volume = 0;
        prevAudio.currentTime = 0;
      }
    }

    // Iniciar y elevar NewJeans para la sección Hero
    currentTrackKey = 'hero';
    if (heroAudio) {
      heroAudio.currentTime = 0;
      heroAudio.play().then(() => {
        fadeAudio(heroAudio, 0, TARGET_VOLUME, 2200);
      }).catch(() => {
        // Si no se inició, se activará en el primer clic/scroll del sitio
        heroAudio.volume = TARGET_VOLUME;
      });
    }

    initScrollMusicWatcher();
    updateToggleBtnUI();
  }

  /**
   * Cambia de canción con crossfade suave según la sección visible
   */
  function transitionToSection(targetKey) {
    if (!isSiteActive) return;
    if (targetKey === currentTrackKey) return;

    const prevAudio = getAudio(currentTrackKey);
    const nextAudio = getAudio(targetKey);
    currentTrackKey = targetKey;

    // Desvanecer canción saliente
    if (prevAudio && !prevAudio.paused) {
      fadeAudio(prevAudio, prevAudio.volume, 0, FADE_DURATION, () => {
        prevAudio.pause();
      });
    }

    // Si la nueva sección tiene canción, reproducir con fade-in
    if (nextAudio) {
      nextAudio.play().then(() => {
        fadeAudio(nextAudio, nextAudio.volume, TARGET_VOLUME, FADE_DURATION);
      }).catch(() => {});
    }

    updateToggleBtnUI();
  }

  /**
   * Monitorea el scroll para detectar en qué sección se encuentra el usuario
   */
  function initScrollMusicWatcher() {
    const sections = [
      { id: 'hero', key: 'hero' },
      { id: 'letter', key: 'letter' },
      { id: 'growth', key: 'growth' },
      { id: 'gallery', key: 'gallery' },
      { id: 'wish', key: 'wish' }
    ];

    const sectionElements = sections.map(s => ({
      el: document.getElementById(s.id),
      key: s.key
    })).filter(s => s.el !== null);

    let scrollTicking = false;

    function checkActiveSection() {
      if (!isSiteActive) return;
      const viewportCenter = window.innerHeight * 0.45;
      let dominantKey = 'hero';

      // Encontrar qué sección abarca el centro del viewport
      for (let i = 0; i < sectionElements.length; i++) {
        const rect = sectionElements[i].el.getBoundingClientRect();
        if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
          dominantKey = sectionElements[i].key;
          break;
        }
      }

      transitionToSection(dominantKey);
    }

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          checkActiveSection();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Comprobación inicial de posición
    setTimeout(checkActiveSection, 300);
  }

  /**
   * Reproduce el tema de victoria de Final Fantasy VII al apagar las velas
   */
  function playVictoryTheme() {
    // Atenuar o pausar música de fondo actual
    if (currentTrackKey) {
      const current = getAudio(currentTrackKey);
      if (current && !current.paused) {
        fadeAudio(current, current.volume, 0, 800, () => current.pause());
      }
    }

    try {
      const victoryAudio = new Audio(encodeURI(SFX_VICTORY));
      victoryAudio.volume = isMuted ? 0 : 0.9;
      victoryAudio.play().catch(err => {
        console.warn('[MusicController] No se pudo reproducir el SFX de victoria:', err);
      });
    } catch (e) {
      console.warn('[MusicController] Error en SFX:', e);
    }
  }

  /**
   * Alterna silencio (Mute / Unmute)
   */
  function toggleMute() {
    isMuted = !isMuted;
    Object.values(audioElements).forEach(audio => {
      if (audio) {
        if (isMuted) {
          audio.volume = 0;
        } else if (audio === getAudio(currentTrackKey) && !audio.paused) {
          audio.volume = TARGET_VOLUME;
        }
      }
    });
    updateToggleBtnUI();
  }

  /**
   * Actualiza el estado visual del botón flotante de audio
   */
  function updateToggleBtnUI() {
    const btn = document.getElementById('musicToggleBtn');
    if (!btn) return;

    if (isMuted) {
      btn.classList.add('is-muted');
      btn.setAttribute('aria-label', 'Activar música');
      btn.setAttribute('title', 'Activar música');
    } else {
      btn.classList.remove('is-muted');
      btn.setAttribute('aria-label', 'Silenciar música');
      btn.setAttribute('title', 'Silenciar música');
    }
  }

  // Objeto público del controlador
  window.MusicController = {
    playLoaderMusic,
    transitionFromLoader,
    transitionToSection,
    playVictoryTheme,
    toggleMute
  };
})();

/**
 * Inicializador del botón flotante de control de música
 */
function initMusicController() {
  const toggleBtn = document.getElementById('musicToggleBtn');
  if (toggleBtn && window.MusicController) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.MusicController.toggleMute();
    });
  }
}
