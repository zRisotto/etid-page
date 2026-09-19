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
      hint.textContent = '¡Deseo pedido! ✨🎂';
    } else if (remaining === 1) {
      hint.textContent = 'Falta 1 vela por apagar ✨';
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

      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.09 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.95);
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

  function burstConfetti() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const colors = ['#FFC5D3', '#96C6E0', '#F0B860', '#D4A5E8', '#ffffff'];
    for (let i = 0; i < 48; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const x = (Math.random() * 260 - 130) + 'px';
      const y = (Math.random() * -220 - 70) + 'px';
      const r = (Math.random() * 360) + 'deg';
      piece.style.setProperty('--x', x);
      piece.style.setProperty('--y', y);
      piece.style.setProperty('--r', r);
      piece.style.left = '50%';
      piece.style.top = '10%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      if (Math.random() > 0.5) piece.style.borderRadius = '50%';

      cakeScene.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  function revealWish() {
    cakeScene.classList.add('is-celebrating');
    if (message) message.classList.add('show');
    burstConfetti();

    // Reproducir tema de victoria de Final Fantasy VII
    if (window.MusicController && typeof window.MusicController.playVictoryTheme === 'function') {
      window.MusicController.playVictoryTheme();
    } else {
      playCelebrationFanfare();
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
