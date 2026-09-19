/**
 * ============================================================
 * MÓDULO: GALERÍA DE RECUERDOS (8 CARDS & SECUENCIA NOSTÁLGICA)
 * ============================================================
 * 1. Inicializa 8 tarjetas interactivas utilizando /assets/CARDS/8 MAIN.
 * 2. Permite volteo 3D para revelar dedicatorias en el reverso.
 * 3. Al voltear las 8 tarjetas, dispara automáticamente una secuencia
 *    emotiva y nostálgica recorriendo a ritmo de 1 segundo:
 *    /roblox -> /us -> /gus -> /beso -> retorno siempre a /main.
 * 4. Precarga todos los assets de /CARDS para máxima fluidez sin cortes.
 */

function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const config = window.BIRTHDAY_CONFIG || {};
  const albums = config.cardsAlbums || {
    main: [
      'assets/CARDS/8 MAIN/1.JPG',
      'assets/CARDS/8 MAIN/2.png',
      'assets/CARDS/8 MAIN/3.jpg',
      'assets/CARDS/8 MAIN/4.jpg',
      'assets/CARDS/8 MAIN/5.jpg',
      'assets/CARDS/8 MAIN/6.jpg',
      'assets/CARDS/8 MAIN/7.jpg',
      'assets/CARDS/8 MAIN/8.jpg'
    ],
    roblox: [
      'assets/CARDS/8 roblox/HnVideoEditor_2026_09_17_213841307.gif',
      'assets/CARDS/8 roblox/IMG-20250104-WA0017.jpg',
      'assets/CARDS/8 roblox/IMG-20250104-WA0026.jpg',
      'assets/CARDS/8 roblox/IMG-20250111-WA0006.jpg',
      'assets/CARDS/8 roblox/HnVideoEditor_2026_09_17_215009242.gif',
      'assets/CARDS/8 roblox/IMG-20250521-WA0081.jpg',
      'assets/CARDS/8 roblox/IMG-20250901-WA0024.jpg',
      'assets/CARDS/8 roblox/IMG-20260107-WA0043.jpg'
    ],
    us: [
      'assets/CARDS/8 us/HnVideoEditor_2026_09_17_213759202.gif',
      'assets/CARDS/8 us/IMG-20250421-WA0001.jpg',
      'assets/CARDS/8 us/IMG-20250621-WA0062.jpg',
      'assets/CARDS/8 us/IMG-20250718-WA0073.jpg',
      'assets/CARDS/8 us/IMG_20251108_195521.jpg',
      'assets/CARDS/8 us/IMG-20251108-WA0124.jpg',
      'assets/CARDS/8 us/IMG-20260202-WA0049.jpg',
      'assets/CARDS/8 us/IMG-20260503-WA0030.jpg'
    ],
    gus: [
      'assets/CARDS/8 GUS/HnVideoEditor_2026_09_17_213621291.gif',
      'assets/CARDS/8 GUS/IMG-20240208-WA0037.jpg',
      'assets/CARDS/8 GUS/IMG-20250123-WA0012.jpg',
      'assets/CARDS/8 GUS/IMG-20250203-WA0021.jpg',
      'assets/CARDS/8 GUS/IMG_20250512_211004.jpg',
      'assets/CARDS/8 GUS/IMG_20250712_211118.jpg',
      'assets/CARDS/8 GUS/IMG-20260103-WA0029.jpg',
      'assets/CARDS/8 GUS/IMG_20260217_180923_edit_1345323171532737.jpg'
    ],
    beso: [
      'assets/CARDS/8 beso/recuerdo 1.jpg',
      'assets/CARDS/8 beso/recuerdo 2.jpg',
      'assets/CARDS/8 beso/recuerdo 3.jpg',
      'assets/CARDS/8 beso/recuerdo 4.jpg',
      'assets/CARDS/8 beso/recuerdo 5.jpg',
      'assets/CARDS/8 beso/recuerdo 6.jpg',
      'assets/CARDS/8 beso/recuerdo 7.jpg',
      'assets/CARDS/8 beso/recuerdo 8.jpg'
    ]
  };

  const defaultCaptions = [
    'Una sonrisa que ilumina cualquier día',
    'Un recuerdo que vale la pena guardar para siempre',
    'Momentos inolvidables que se quedan en el corazón',
    'Esa risa tuya tan única y contagiosa',
    'Un día cualquiera hecho completamente especial a tu lado',
    'Celebrando este año contigo, ¡y por muchos más!',
    'Tus abrazos sinceros que reconfortan el alma',
    'Cada plática contigo donde las horas se pasan volando'
  ];

  const galleryItems = Array.isArray(config.gallery) && config.gallery.length === 8
    ? config.gallery
    : defaultCaptions.map((cap, i) => ({ caption: cap, label: `Recuerdo ${i + 1}` }));

  // Referencias a elementos de la interfaz
  const progressBadge = document.getElementById('gallery-progress-badge');
  const progressText = document.getElementById('gallery-progress-text');
  const memoryBanner = document.getElementById('memory-reel-banner');
  const memoryPill = document.getElementById('memory-reel-pill');
  const memoryTitle = document.getElementById('memory-reel-title');
  const memorySubtitle = document.getElementById('memory-reel-subtitle');

  // Estado del componente
  let isReelPlaying = false;
  const cardsElements = [];
  const cardImages = [];

  // ============================================================
  // 1. PRECARGA DE ASSETS EN SEGUNDO PLANO
  // ============================================================
  function preloadAllAssets() {
    try {
      Object.values(albums).forEach((album) => {
        if (Array.isArray(album)) {
          album.forEach((path) => {
            const preImg = new Image();
            preImg.src = encodeURI(path);
          });
        }
      });
    } catch (e) {
      console.warn('Error al precargar álbumes de tarjetas:', e);
    }
  }
  preloadAllAssets();

  // ============================================================
  // 2. EFECTOS SONOROS DE NOSTALGIA Y CAMPANILLAS (WEB AUDIO API)
  // ============================================================
  function playMemoryChime(freq = 587.33, type = 'sine', duration = 0.6) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      // Ignorar de forma segura si el navegador bloquea audio
    }
  }

  function playChimeScale(index) {
    const scale = [392, 440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];
    const freq = scale[index % scale.length];
    playMemoryChime(freq, 'triangle', 0.5);
  }

  // ============================================================
  // 3. CONSTRUCCIÓN DE LAS 8 TARJETAS CON '8 MAIN'
  // ============================================================
  grid.innerHTML = '';

  for (let i = 0; i < 8; i++) {
    const card = document.createElement('div');
    card.className = 'photo-card reveal-item';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Momento ${i + 1}`);
    card.style.setProperty('--card-index', i);

    const mainSrc = encodeURI(albums.main[i] || '');
    const caption = galleryItems[i]?.caption || defaultCaptions[i];

    card.innerHTML = `
      <div class="card-inner">
        <!-- Cara Frontal: Foto principal (8 MAIN) -->
        <div class="card-face card-front">
          <img src="${mainSrc}" alt="Momento ${i + 1}" class="card-photo" loading="eager">
          <div class="card-overlay">
            <span class="card-sparkle-subtle" aria-hidden="true">✨</span>
          </div>
        </div>

        <!-- Cara Trasera: Dedicatoria y postal nostálgica -->
        <div class="card-face card-back">
          <div class="card-back-ornament" aria-hidden="true">❦</div>
          <div class="card-back-body">
            <p>${caption}</p>
          </div>
          <div class="card-back-footer">
            <span>Edith</span>
            <span aria-hidden="true">♡</span>
            <span>21 Años</span>
          </div>
        </div>
      </div>
    `;

    // Guardar referencias
    const imgEl = card.querySelector('img.card-photo');
    cardImages.push(imgEl);
    cardsElements.push(card);

    // Eventos de interacción
    const toggleFlip = () => {
      if (isReelPlaying) return;
      card.classList.toggle('flipped');

      const isFlipped = card.classList.contains('flipped');
      if (isFlipped) {
        playChimeScale(i);
      }

      updateFlippedState();
    };

    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });

    grid.appendChild(card);
  }

  // ============================================================
  // 4. ACTUALIZACIÓN DEL CONTADOR DE TARJETAS VOLTEADAS
  // ============================================================
  function updateFlippedState() {
    if (isReelPlaying) return;

    const flippedCount = cardsElements.filter(c => c.classList.contains('flipped')).length;

    if (progressText) {
      if (flippedCount === 0) {
        progressText.textContent = 'Voltea las 8 tarjetas para descubrir una sorpresa (0/8)';
      } else if (flippedCount < 8) {
        progressText.textContent = `Voltea las 8 tarjetas para descubrir una sorpresa (${flippedCount}/8)`;
      } else {
        progressText.textContent = '¡Todas las tarjetas volteadas! ✨ Reviviendo recuerdos…';
      }
    }

    if (flippedCount === 8) {
      if (progressBadge) progressBadge.classList.add('is-complete');
      startEmotiveMemoryReel();
    } else {
      if (progressBadge) progressBadge.classList.remove('is-complete');
    }
  }

  // ============================================================
  // 5. SECUENCIA NOSTÁLGICA: /roblox -> /us -> /gus -> /beso -> MAIN
  // ============================================================
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function startEmotiveMemoryReel() {
    if (isReelPlaying) return;
    isReelPlaying = true;

    // Bloquear interacción en las tarjetas
    cardsElements.forEach(card => card.classList.add('is-locked'));

    // Breve pausa para contemplar las 8 tarjetas volteadas
    await sleep(700);

    // Mostrar el banner de nostalgia
    if (progressBadge) progressBadge.style.display = 'none';
    if (memoryBanner) {
      memoryBanner.classList.add('is-active');
      if (memoryPill) memoryPill.textContent = 'Cápsula del Tiempo ✨';
      if (memoryTitle) memoryTitle.textContent = 'Reviviendo cada momento contigo…';
      if (memorySubtitle) memorySubtitle.textContent = 'Cierra los ojos y siente este viaje en el tiempo ♡';
    }

    playMemoryChime(440, 'sine', 0.8);
    await sleep(900);

    // Definición de las 4 etapas intermedias
    const steps = [
      {
        key: 'roblox',
        pill: '1/4 • Nuestras tardes de juego',
        title: '🎮 Nuestras risas en Roblox',
        subtitle: 'Partidas, mundos compartidos y horas de pura diversión',
        album: albums.roblox
      },
      {
        key: 'us',
        pill: '2/4 • Momentos únicos',
        title: '✨ Tú y Yo',
        subtitle: 'Cada instante a tu lado se queda grabado en el corazón',
        album: albums.us
      },
      {
        key: 'gus',
        pill: '3/4 • Nuestro consentido',
        title: '🐾 El inolvidable Gus',
        subtitle: 'Compañero fiel de nuestros mejores días juntos',
        album: albums.gus
      },
      {
        key: 'beso',
        pill: '4/4 • Amor y ternura',
        title: '💋 Abrazos y besos que guardo siempre',
        subtitle: 'Todo el cariño más puro que siento por ti',
        album: albums.beso
      }
    ];

    // --- ETAPA 1: Transición hacia ROBLOX ---
    // Como las tarjetas están en su cara trasera (.flipped), actualizamos la foto frontal
    // y desvolteamos suavemente en cascada hacia el frente con roblox
    const robloxStep = steps[0];
    if (memoryPill) memoryPill.textContent = robloxStep.pill;
    if (memoryTitle) memoryTitle.textContent = robloxStep.title;
    if (memorySubtitle) memorySubtitle.textContent = robloxStep.subtitle;

    // Colocar fotos de roblox en la cara frontal
    cardsElements.forEach((card, idx) => {
      if (cardImages[idx] && robloxStep.album[idx]) {
        cardImages[idx].src = encodeURI(robloxStep.album[idx]);
      }
      card.classList.add('memory-active');
    });

    // Desvoltear en onda hacia el frente
    playMemoryChime(523.25, 'triangle', 0.7);
    for (let i = 0; i < cardsElements.length; i++) {
      cardsElements[i].classList.remove('flipped');
      await sleep(40);
    }

    // Dejar 2 segundos de transición para contemplar Roblox
    await sleep(2000);

    // --- ETAPAS 2, 3 y 4 (US, GUS, BESO) ---
    for (let s = 1; s < steps.length; s++) {
      const step = steps[s];

      // Actualizar encabezado del capítulo
      if (memoryPill) memoryPill.textContent = step.pill;
      if (memoryTitle) memoryTitle.textContent = step.title;
      if (memorySubtitle) memorySubtitle.textContent = step.subtitle;

      playMemoryChime(587.33 + (s * 40), 'sine', 0.6);

      // Transición cinematográfica con destello y giro 3D
      cardsElements.forEach((card, idx) => {
        setTimeout(() => {
          card.classList.add('is-transitioning');
          // A la mitad del giro cambiamos la imagen
          setTimeout(() => {
            if (cardImages[idx] && step.album[idx]) {
              cardImages[idx].src = encodeURI(step.album[idx]);
            }
          }, 240);
          // Al culminar el giro, retiramos la clase
          setTimeout(() => {
            card.classList.remove('is-transitioning');
          }, 500);
        }, idx * 40);
      });

      // Dejar 2 segundos de transición para apreciar las fotos y GIFs de este álbum
      await sleep(2000 + (8 * 40));
    }

    // --- RETORNO FINAL: SIEMPRE REGRESA A '8 MAIN' CON GRAN CIERRE ---
    const finalReturn = config.cardsFinalReturn || {
      title: '❤️ Por mil recuerdos más a tu lado',
      subtitle: 'Felices 21 años, mi hermosa Edith ✨'
    };

    if (memoryPill) memoryPill.textContent = 'Siempre Contigo ♡';
    if (memoryTitle) memoryTitle.textContent = finalReturn.title;
    if (memorySubtitle) memorySubtitle.textContent = finalReturn.subtitle;

    // Acorde musical armónico triunfal (C5, E5, G5, C6)
    playFinaleArpeggio();

    // Giro final en cascada regresando a las fotos de 8 MAIN
    cardsElements.forEach((card, idx) => {
      setTimeout(() => {
        card.classList.add('is-transitioning');
        setTimeout(() => {
          if (cardImages[idx] && albums.main[idx]) {
            cardImages[idx].src = encodeURI(albums.main[idx]);
          }
        }, 240);
        setTimeout(() => {
          card.classList.remove('is-transitioning');
          // Aplicar resplandor y halo especial del gran final
          card.classList.add('memory-finale');
        }, 500);
      }, idx * 40);
    });

    // Lluvia de confeti de corazones y estrellas para el gran final
    spawnGrandFinaleConfetti();

    // La escena final dura 3 segundos completos con todos sus efectos activos
    await sleep(3000);

    // Limpieza y restauración al estado interactivo
    cardsElements.forEach((card) => {
      card.classList.remove('memory-active');
      card.classList.remove('memory-finale');
      card.classList.remove('is-locked');
      card.classList.remove('flipped');
    });

    if (memoryBanner) memoryBanner.classList.remove('is-active');
    if (progressBadge) {
      progressBadge.style.display = 'inline-flex';
      progressBadge.classList.remove('is-complete');
    }
    if (progressText) {
      progressText.textContent = 'Voltea las 8 tarjetas para descubrir una sorpresa (0/8)';
    }

    isReelPlaying = false;
  }

  // ============================================================
  // 6. EFECTOS ESPECIALES DEL GRAN FINAL (AUDIO & CONFETI)
  // ============================================================
  function playFinaleArpeggio() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playMemoryChime(freq, idx === notes.length - 1 ? 'triangle' : 'sine', 0.75);
      }, idx * 130);
    });
  }

  function spawnGrandFinaleConfetti() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const memoryHeader = document.getElementById('gallery-memory-header');
    if (!memoryHeader) return;

    const symbols = ['♥', '♡', '💖', '✨', '✦', '🌸', '🎂', '✧'];
    const colors = ['#FFC5D3', '#F0B860', '#96C6E0', '#D4A5E8', '#ffffff', '#ff9ebb'];

    // Disparar en dos oleadas para cubrir elegantemente los 3 segundos
    [0, 600, 1400].forEach((waveDelay, waveIdx) => {
      setTimeout(() => {
        const count = 18;
        for (let i = 0; i < count; i++) {
          const p = document.createElement('span');
          p.className = 'memory-confetti-piece';
          p.textContent = symbols[(i + waveIdx) % symbols.length];
          p.style.color = colors[(i + waveIdx) % colors.length];
          p.style.position = 'absolute';
          p.style.left = (15 + Math.random() * 70) + '%';
          p.style.top = '50%';
          p.style.fontSize = (14 + Math.random() * 18) + 'px';
          p.style.pointerEvents = 'none';
          p.style.zIndex = '99';
          p.style.transition = `all ${1.6 + Math.random() * 0.8}s cubic-bezier(0.16, 1, 0.3, 1)`;
          p.style.opacity = '1';

          memoryHeader.appendChild(p);

          const destX = (Math.random() * 440 - 220) + 'px';
          const destY = (Math.random() * -240 - 50) + 'px';
          const destR = (Math.random() * 540 - 270) + 'deg';

          requestAnimationFrame(() => {
            p.style.transform = `translate(${destX}, ${destY}) rotate(${destR}) scale(${1.1 + Math.random() * 0.4})`;
            p.style.opacity = '0';
          });

          setTimeout(() => p.remove(), 2500);
        }
      }, waveDelay);
    });
  }
}
