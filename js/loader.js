/**
 * ============================================================
 * MÓDULO: PANTALLA DE CARGA (LOADER)
 * ============================================================
 * Maneja la lluvia matrix de corazones, el contador ascendente
 * hasta el 21, y espera estático la interacción del usuario
 * (clic o toque) para avanzar a la sorpresa.
 */

function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return { stop: () => {}, spawnBurst: () => {} };

  const ctx = canvas.getContext('2d');
  let w, h, fontSize, columns, drops;
  const bursts = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    fontSize = window.innerWidth < 640 ? 15 : 20;
    columns = Math.ceil(w / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.random() * -60);
  }
  resize();
  window.addEventListener('resize', resize);

  const glyph = '♥';
  let rafId;

  function spawnBurst(cx, cy) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.4 + Math.random() * 2.2;
      bursts.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        alpha: 1,
        size: 13 + Math.random() * 8
      });
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(18, 14, 26, 0.16)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = fontSize + 'px monospace';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(255, 197, 211, 0.65)';
    ctx.shadowBlur = 7;

    for (let i = 0; i < drops.length; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const alpha = 0.35 + Math.random() * 0.55;
      ctx.fillStyle = `rgba(255, 197, 211, ${alpha})`;
      ctx.fillText(glyph, x, y);

      if (y > h && Math.random() > 0.975) {
        drops[i] = Math.random() * -20;
      }
      drops[i] += 0.9;
    }

    // Dibujar y actualizar destellos interactivos al tocar la pantalla
    for (let j = bursts.length - 1; j >= 0; j--) {
      const b = bursts[j];
      ctx.save();
      ctx.fillStyle = `rgba(255, 197, 211, ${b.alpha})`;
      ctx.shadowColor = '#FFC5D3';
      ctx.shadowBlur = 12;
      ctx.font = `${b.size}px monospace`;
      ctx.fillText('♥', b.x, b.y);
      ctx.restore();

      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.05;
      b.alpha -= 0.024;
      if (b.alpha <= 0) {
        bursts.splice(j, 1);
      }
    }

    rafId = requestAnimationFrame(draw);
  }
  draw();

  return {
    stop: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    },
    spawnBurst
  };
}

function animateCounter(onDone) {
  const numberEl = document.getElementById('loading-number');
  if (!numberEl) {
    if (typeof onDone === 'function') onDone();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReducedMotion ? 300 : 2600;
  const start = performance.now();
  const targetNumber = (window.BIRTHDAY_CONFIG && window.BIRTHDAY_CONFIG.age) || 21;

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(eased * targetNumber);
    numberEl.textContent = String(val);

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      numberEl.textContent = String(targetNumber);
      numberEl.classList.add('pulse');
      if (typeof onDone === 'function') onDone();
    }
  }
  requestAnimationFrame(tick);
}

function initLoader(onLoaded) {
  const loadingScreen = document.getElementById('loading-screen');
  const skipBtn = document.getElementById('skip-btn');
  const enterBtn = document.getElementById('enter-btn');
  const numberEl = document.getElementById('loading-number');
  const labelEl = document.getElementById('loading-label');

  if (!loadingScreen) return;

  // Iniciar canción ambiental de carga (Pastel Ghost en loop)
  if (window.MusicController && typeof window.MusicController.playLoaderMusic === 'function') {
    window.MusicController.playLoaderMusic();
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rain = initMatrixRain();
  let finished = false;

  function finishLoading() {
    if (finished) return;
    finished = true;
    rain.stop();
    loadingScreen.classList.add('wipe');
    document.body.classList.remove('locked');

    // Transición suave de audio hacia NewJeans (Sección 1: Hero)
    if (window.MusicController && typeof window.MusicController.transitionFromLoader === 'function') {
      window.MusicController.transitionFromLoader();
    }

    // Disparar transición y efectos sorpresa (confeti azul y rosa, onda expansiva, pop festivo)
    if (window.HeroSurprise && typeof window.HeroSurprise.triggerSurpriseTransition === 'function') {
      window.HeroSurprise.triggerSurpriseTransition();
    }

    const site = document.getElementById('site');
    if (site) site.classList.add('revealed');

    if (typeof onLoaded === 'function') {
      onLoaded();
    }

    setTimeout(() => {
      loadingScreen.remove();
    }, prefersReducedMotion ? 50 : 950);
  }

  // Interacción en la pantalla de carga: al tocar la lluvia matrix,
  // se activa la música de Pastel Ghost y se crea un destello de corazones #FFC5D3,
  // permitiendo disfrutar de la lluvia matrix en loop sin cerrarla prematuramente.
  loadingScreen.addEventListener('pointerdown', (e) => {
    if (finished) return;
    const isEntering = e.target && (
      e.target.closest('#enter-btn') ||
      e.target.closest('#skip-btn') ||
      (numberEl && numberEl.classList.contains('ready') && e.target.closest('#loading-number'))
    );
    if (isEntering) return;

    if (window.MusicController && typeof window.MusicController.playLoaderMusic === 'function') {
      window.MusicController.playLoaderMusic();
    }
    if (rain && typeof rain.spawnBurst === 'function') {
      rain.spawnBurst(e.clientX, e.clientY);
    }
  });

  // Al llegar a 21, se queda estático y habilita las opciones para avanzar
  animateCounter(() => {
    if (labelEl) {
      labelEl.textContent = 'Para ti con todo mi amor ✨';
    }

    if (numberEl) {
      numberEl.classList.add('ready');
      numberEl.setAttribute('role', 'button');
      numberEl.setAttribute('tabindex', '0');
      numberEl.setAttribute('aria-label', 'Entrar a la sorpresa de cumpleaños');
      numberEl.addEventListener('click', finishLoading);
      numberEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          finishLoading();
        }
      });
    }

    if (enterBtn) {
      enterBtn.classList.add('show');
      enterBtn.addEventListener('click', finishLoading);
    }

    if (skipBtn) {
      skipBtn.style.display = 'none';
    }
  });

  // Botón de saltar antes de que termine el conteo si el usuario lo desea
  if (skipBtn) {
    setTimeout(() => skipBtn.classList.add('show'), 800);
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishLoading();
    });
  }
}
