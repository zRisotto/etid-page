/**
 * ============================================================
 * MÓDULO: SOBRE Y CARTA INTERACTIVA 3D
 * ============================================================
 * Controla la apertura tridimensional del sobre inspirado en carta-sobre.html:
 * levantamiento de solapa con efecto 3D, repliegue del sello de cera,
 * despliegue fluido de la carta con textura pautada y botón de cierre.
 */

function initEnvelope() {
  const scene = document.getElementById('envelopeScene');
  const envelope = document.getElementById('envelope');
  const closeBtn = document.getElementById('closeBtn');
  const hint = document.getElementById('envelope-hint');

  if (!envelope || !scene) return;

  function openLetter() {
    if (scene.classList.contains('open')) return;
    scene.classList.add('open');
    envelope.setAttribute('aria-expanded', 'true');
    if (hint) hint.textContent = '✕ Cerrar carta';
  }

  function closeLetter() {
    if (!scene.classList.contains('open')) return;
    scene.classList.remove('open');
    envelope.setAttribute('aria-expanded', 'false');
    if (hint) hint.textContent = 'Abre el sobre';
    envelope.focus();
  }

  envelope.addEventListener('click', (e) => {
    // Si ya está abierto y se hace clic en la carta interna, no cerrar abruptamente
    if (scene.classList.contains('open')) return;
    openLetter();
  });

  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!scene.classList.contains('open')) {
        openLetter();
      }
    } else if (e.key === 'Escape' && scene.classList.contains('open')) {
      e.preventDefault();
      closeLetter();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLetter();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scene.classList.contains('open')) {
      closeLetter();
    }
  });

  // Inicializar el pastel interactivo del collage de la carta
  initCollageCake();

  // Inicializar el disco interactivo de Persona 3
  initPersonaDisk();
}

/**
 * ============================================================
 * INTERACTIVIDAD DEL PASTEL EN EL COLLAGE (cake dots.png)
 * ============================================================
 * Efecto especial al hacer clic en el pastel de la sección 2:
 * - Animación squish / rebote elástico
 * - Emisión de partículas festivas (chispas, confeti, estrellitas, corazones)
 * - Campanita melódica alegre con Web Audio API
 * - Mensaje flotante de felicitación con frases cariñosas
 */
function initCollageCake() {
  const cakeBtn = document.getElementById('collageCakeBtn');
  if (!cakeBtn) return;

  const messages = [
    '¡Feliz cumpleaños Edith! 🎂✨',
    '¡Mordida, mordida! 🍰💖',
    '¡Pide un deseo especial! 🕯️🌟',
    '¡Pastelito para la más linda! 🎂🌸',
    '¡Que se cumplan todos tus sueños! 🎉✨'
  ];
  let msgIndex = 0;

  function playCakeChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Notas alegres de campanilla (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
      });
    } catch (_) {
      // Manejo silencioso ante políticas estrictas de audio
    }
  }

  function spawnParticles() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const glyphs = ['✨', '✧', '💖', '🎂', '🌸', '★', '🍰'];
    const colors = ['#FFC5D3', '#96C6E0', '#F0B860', '#d9a7ff', '#ffffff'];
    const total = 18;

    for (let i = 0; i < total; i++) {
      const p = document.createElement('span');
      p.className = 'cake-particle';

      const angle = (Math.PI * 2 * i) / total + (Math.random() * 0.4 - 0.2);
      const distance = 45 + Math.random() * 75;
      const tx = Math.cos(angle) * distance + 'px';
      const ty = Math.sin(angle) * distance - 20 + 'px';
      const tr = (Math.random() * 360 - 180) + 'deg';

      p.style.setProperty('--tx', tx);
      p.style.setProperty('--ty', ty);
      p.style.setProperty('--tr', tr);
      p.style.left = '50%';
      p.style.top = '40%';
      p.style.color = colors[i % colors.length];

      if (i % 2 === 0) {
        p.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      } else {
        p.style.width = (7 + Math.random() * 6) + 'px';
        p.style.height = (7 + Math.random() * 6) + 'px';
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        p.style.backgroundColor = colors[i % colors.length];
        p.style.display = 'block';
      }

      cakeBtn.appendChild(p);

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 1200);
    }
  }

  function showToastMessage() {
    const existing = cakeBtn.querySelector('.cake-toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cake-toast-message';
    toast.textContent = messages[msgIndex % messages.length];
    msgIndex++;
    cakeBtn.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 1700);
  }

  function triggerCakeEffect(e) {
    if (e) e.stopPropagation();

    // Reiniciar animación squish
    cakeBtn.classList.remove('is-animating');
    void cakeBtn.offsetWidth;
    cakeBtn.classList.add('is-animating');

    // Partículas, sonido y mensaje
    spawnParticles();
    showToastMessage();
    playCakeChime();
  }

  cakeBtn.addEventListener('click', triggerCakeEffect);
  cakeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerCakeEffect(e);
    }
  });
}

/**
 * ============================================================
 * INTERACTIVIDAD DEL DISCO PERSONA 3 (persona 3disk.png)
 * ============================================================
 * Al hacer clic:
 * - Alterna / cambia la canción de la sección de la carta a "Color Your Night.mp3"
 * - Activa rotación de vinilo con resplandor azul Persona 3 (.is-playing)
 * - Muestra un mensaje flotante elegante informando de la pista
 * - Emite partículas musicales (notas y estrellas azules)
 */
function initPersonaDisk() {
  const diskBtn = document.getElementById('personaDiskBtn');
  if (!diskBtn) return;

  const COLOR_YOUR_NIGHT = 'assets/Songs/Color Your Night.mp3';

  function spawnMusicParticles() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const glyphs = ['♪', '♫', '♬', '✨', '💙', '⭐'];
    const colors = ['#38bdf8', '#60a5fa', '#93c5fd', '#ffffff', '#FFC5D3'];
    const total = 14;

    for (let i = 0; i < total; i++) {
      const p = document.createElement('span');
      p.className = 'disk-music-particle';

      const angle = (Math.PI * 2 * i) / total + (Math.random() * 0.4 - 0.2);
      const distance = 45 + Math.random() * 65;
      const tx = Math.cos(angle) * distance + 'px';
      const ty = Math.sin(angle) * distance - 25 + 'px';
      const tr = (Math.random() * 180 - 90) + 'deg';

      p.style.setProperty('--tx', tx);
      p.style.setProperty('--ty', ty);
      p.style.setProperty('--tr', tr);
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.color = colors[i % colors.length];
      p.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

      diskBtn.appendChild(p);

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 1250);
    }
  }

  function showDiskToast(message) {
    const existing = diskBtn.querySelector('.disk-toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'disk-toast-message';
    toast.textContent = message;
    diskBtn.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2000);
  }

  function handleDiskClick(e) {
    if (e) e.stopPropagation();

    // Animación táctil de pulsación
    diskBtn.classList.remove('is-pressed');
    void diskBtn.offsetWidth;
    diskBtn.classList.add('is-pressed');

    if (window.MusicController && typeof window.MusicController.toggleSectionTrack === 'function') {
      const isNowColorYourNight = window.MusicController.toggleSectionTrack('letter', COLOR_YOUR_NIGHT);

      if (isNowColorYourNight) {
        diskBtn.classList.add('is-playing');
        showDiskToast('🎵 Color Your Night — Persona 3');
      } else {
        diskBtn.classList.remove('is-playing');
        showDiskToast('🎵 Deftones — Entombed');
      }
    } else if (window.MusicController && typeof window.MusicController.changeSectionTrack === 'function') {
      window.MusicController.changeSectionTrack('letter', COLOR_YOUR_NIGHT, true);
      diskBtn.classList.add('is-playing');
      showDiskToast('🎵 Color Your Night — Persona 3');
    }

    spawnMusicParticles();
  }

  diskBtn.addEventListener('click', handleDiskClick);
  diskBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDiskClick(e);
    }
  });
}

