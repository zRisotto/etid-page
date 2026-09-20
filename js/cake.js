/**
 * ============================================================
 * MÓDULO: PASTEL, VELAS Y DESEO
 * ============================================================
 * Maneja las 21 velas interactivas, los chispas decorativos del pastel,
 * el apagado por clic/toque o teclado, efectos de sonido y humo,
 * conteo regresivo y la revelación del mensaje con explosión de confeti.
 */

function initCakeSprinkles() {
  const cake = document.getElementById('cake-body');
  if (!cake) return;

  const colors = ['#ffffff', '#FFC5D3', '#F0B860', '#96C6E0', '#D4A5E8'];
  for (let i = 0; i < 22; i++) {
    const dot = document.createElement('span');
    dot.className = 'sprinkle';
    dot.style.left = (4 + Math.random() * 92) + '%';
    dot.style.top = (16 + Math.random() * 36) + '%';
    dot.style.background = colors[i % colors.length];
    dot.style.transform = `rotate(${Math.random() * 360}deg)`;
    cake.appendChild(dot);
  }
}

function initCandles() {
  const candles = Array.from(document.querySelectorAll('.candle'));
  const flames = Array.from(document.querySelectorAll('.flame'));
  const hint = document.getElementById('wish-hint');
  const message = document.getElementById('wish-message');
  const cakeScene = document.querySelector('.cake-scene');

  if (!candles.length || !cakeScene) return;

  let remaining = candles.length;

  function updateHint() {
    if (!hint) return;
    if (remaining === 0) {
      hint.textContent = '¡Deseo pedido! ✦ ¡Que se cumpla siempre! ✦';
    } else if (remaining === 1) {
      hint.textContent = '¡Falta 1 vela por apagar! ✦';
    } else {
      hint.textContent = `Faltan ${remaining} velas por apagar`;
    }
  }
  updateHint();

  function playExtinguishSound(index) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Sonido de campana suave ascendente a medida que se apagan velas
      const baseFreq = 392; // Sol (G4)
      const scaleOffsets = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36, 38, 40, 43, 45, 48];
      const extinguishedCount = candles.length - remaining;
      const offset = scaleOffsets[extinguishedCount % scaleOffsets.length];
      const freq = baseFreq * Math.pow(2, offset / 12);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {
      // Silencioso ante restricciones de audio del navegador
    }
  }

  function playCelebrationFanfare() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Arpegio ascendente brillante y triunfal (Do mayor con novena)
      const chord = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
      const now = ctx.currentTime;
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);
      });
    } catch (_) {
      // Silencioso ante restricciones de audio
    }
  }

  function spawnSmoke(candle) {
    const smoke = document.createElement('span');
    smoke.className = 'smoke-puff';
    candle.appendChild(smoke);
    setTimeout(() => {
      if (smoke.parentNode) smoke.parentNode.removeChild(smoke);
    }, 900);
  }

  function spawnCelebrationShockwave() {
    const shockwave = document.createElement('div');
    shockwave.className = 'cake-shockwave';
    cakeScene.appendChild(shockwave);

    const aura = document.createElement('div');
    aura.className = 'cake-celebration-aura';
    cakeScene.appendChild(aura);

    setTimeout(() => {
      if (shockwave.parentNode) shockwave.remove();
    }, 1600);
  }

  function spawnCelebrationBalloons() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const balloonSvgs = [
      // Globo rosa perlado
      `<svg viewBox="0 0 32 46" width="34" height="48">
        <defs>
          <radialGradient id="balPink" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#fff5f8"/>
            <stop offset="45%" stop-color="#ff9ebb"/>
            <stop offset="100%" stop-color="#d64d7c"/>
          </radialGradient>
        </defs>
        <ellipse cx="16" cy="18" rx="14" ry="17" fill="url(#balPink)"/>
        <polygon points="16,35 13,38 19,38" fill="#d64d7c"/>
        <path d="M16,38 Q19,41 15,45" stroke="#c07090" fill="none" stroke-width="1.3"/>
      </svg>`,
      // Globo azul cielo
      `<svg viewBox="0 0 32 46" width="34" height="48">
        <defs>
          <radialGradient id="balBlue" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#f0f9ff"/>
            <stop offset="45%" stop-color="#9cd4f8"/>
            <stop offset="100%" stop-color="#3b82f6"/>
          </radialGradient>
        </defs>
        <ellipse cx="16" cy="18" rx="14" ry="17" fill="url(#balBlue)"/>
        <polygon points="16,35 13,38 19,38" fill="#3b82f6"/>
        <path d="M16,38 Q14,41 17,45" stroke="#5b92b8" fill="none" stroke-width="1.3"/>
      </svg>`,
      // Globo dorado
      `<svg viewBox="0 0 32 46" width="34" height="48">
        <defs>
          <radialGradient id="balGold" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#fffde7"/>
            <stop offset="45%" stop-color="#fcd34d"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </radialGradient>
        </defs>
        <ellipse cx="16" cy="18" rx="14" ry="17" fill="url(#balGold)"/>
        <polygon points="16,35 13,38 19,38" fill="#f59e0b"/>
        <path d="M16,38 Q18,42 14,45" stroke="#d97706" fill="none" stroke-width="1.3"/>
      </svg>`,
      // Corazón radiante
      `<svg viewBox="0 0 32 32" width="30" height="30">
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff758f"/>
            <stop offset="100%" stop-color="#e01e5a"/>
          </linearGradient>
        </defs>
        <path d="M16 28 C16 28 3 19 3 10 C3 5 7 2 11.5 2 C14.5 2 15.5 3.8 16 4.5 C16.5 3.8 17.5 2 20.5 2 C25 2 29 5 29 10 C29 19 16 28 16 28 Z" fill="url(#heartGrad)"/>
      </svg>`,
      // Estrella mágica
      `<svg viewBox="0 0 24 24" width="28" height="28">
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="50%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <path d="M12 2l2.6 6.5 7 .5-5.3 4.6 1.7 6.9-6-3.7-6 3.7 1.7-6.9-5.3-4.6 7-.5z" fill="url(#starGrad)"/>
      </svg>`
    ];

    const total = 18;

    for (let i = 0; i < total; i++) {
      const b = document.createElement('span');
      b.className = 'cake-floating-balloon';
      b.innerHTML = balloonSvgs[i % balloonSvgs.length];

      const spreadX = (Math.random() - 0.5) * 360;
      const sway1 = `${(Math.random() - 0.5) * 50}px`;
      const sway2 = `${(Math.random() - 0.5) * 70}px`;
      const sway3 = `${(Math.random() - 0.5) * 60}px`;
      const rot1 = `${(Math.random() - 0.5) * 26}deg`;
      const rot2 = `${(Math.random() - 0.5) * 32}deg`;
      const duration = `${3.4 + Math.random() * 2.2}s`;
      const delay = `${i * 0.11}s`;

      b.style.left = `calc(50% + ${spreadX}px)`;
      b.style.top = '35%';
      b.style.setProperty('--sway-1', sway1);
      b.style.setProperty('--sway-2', sway2);
      b.style.setProperty('--sway-3', sway3);
      b.style.setProperty('--rot-1', rot1);
      b.style.setProperty('--rot-2', rot2);
      b.style.setProperty('--duration', duration);
      b.style.animationDelay = delay;

      cakeScene.appendChild(b);
      setTimeout(() => {
        if (b.parentNode) b.remove();
      }, 6000);
    }
  }

  function burstCakeConfettiWave(multiplier = 1.0, upwardBias = 1.0) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const colors = ['#FFC5D3', '#96C6E0', '#F0B860', '#D4A5E8', '#ffffff', '#ff6b8b', '#38bdf8', '#fbbf24'];
    const glyphs = ['★', '✦', '✧', '♥', '✨'];
    // Reducido de 55 a 20-30 para aligerar la carga del procesador
    const count = Math.round((window.innerWidth < 768 ? 20 : 30) * multiplier);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';

      const angle = Math.random() * Math.PI * 2;
      const distance = (80 + Math.random() * 260) * multiplier;
      const x = `${Math.cos(angle) * distance}px`;
      const y = `${(Math.sin(angle) * distance * 0.65 - (110 + Math.random() * 140) * upwardBias)}px`;
      const r = `${(Math.random() - 0.5) * 720}deg`;

      piece.style.setProperty('--x', x);
      piece.style.setProperty('--y', y);
      piece.style.setProperty('--r', r);
      piece.style.left = '50%';
      piece.style.top = '25%';

      const isSymbol = Math.random() < 0.28;
      const isRibbon = !isSymbol && Math.random() < 0.45;

      if (isSymbol) {
        piece.classList.add('confetti-piece--star');
        piece.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        piece.style.color = colors[Math.floor(Math.random() * colors.length)];
      } else if (isRibbon) {
        piece.classList.add('confetti-piece--ribbon');
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      } else {
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        if (Math.random() > 0.4) piece.style.borderRadius = '50%';
      }

      piece.style.animationDuration = `${1.2 + Math.random() * 0.7}s`;
      cakeScene.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  function burstGrandConfettiShow() {
    // 1. Ola 1 inmediata: explosión centrada en el pastel
    burstCakeConfettiWave(1.3, 1.3);

    // 2. Cañón de pantalla completa desde los costados inferiores (HeroSurprise)
    if (window.HeroSurprise && typeof window.HeroSurprise.startGrandConfettiBurst === 'function') {
      window.HeroSurprise.startGrandConfettiBurst();
    }

    // 3. Ola 2 a los 550ms: lluvia dorada y cintas
    setTimeout(() => {
      burstCakeConfettiWave(1.1, 1.1);
    }, 550);

    // 4. Ola 3 a los 1200ms: estrellitas y corazones flotantes
    setTimeout(() => {
      burstCakeConfettiWave(0.85, 0.9);
    }, 1200);
  }

  function revealWish() {
    cakeScene.classList.add('is-celebrating');

    // 1. Shockwave y resplandor festivo del pastel
    spawnCelebrationShockwave();

    // 2. Gran espectáculo de confeti multifase (fuegos de confeti)
    burstGrandConfettiShow();

    // 3. Globos y corazones flotantes hacia el cielo
    spawnCelebrationBalloons();

    // 4. Revelación emotiva del mensaje
    if (message) {
      message.classList.add('show');
    }

    // 5. Música de victoria de Final Fantasy VII + fanfarria de campanillas
    playCelebrationFanfare();
    if (window.MusicController && typeof window.MusicController.playVictoryTheme === 'function') {
      window.MusicController.playVictoryTheme();
    }
  }

  candles.forEach((candle, idx) => {
    const flame = candle.querySelector('.flame');
    if (!flame) return;

    function extinguish() {
      if (flame.classList.contains('out')) return;
      flame.classList.add('out');
      candle.classList.add('is-out');
      candle.setAttribute('aria-label', `Vela ${idx + 1} apagada`);
      remaining--;
      updateHint();
      spawnSmoke(candle);
      playExtinguishSound(idx);
      if (remaining === 0) revealWish();
    }

    candle.addEventListener('click', extinguish);
    candle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        extinguish();
      }
    });
  });
}
