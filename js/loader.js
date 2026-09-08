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
  if (!canvas) return { stop: () => {} };

  const ctx = canvas.getContext('2d');
  let w, h, fontSize, columns, drops;

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
    rafId = requestAnimationFrame(draw);
  }
  draw();

  return {
    stop: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    }
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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rain = initMatrixRain();
  let finished = false;

  function finishLoading() {
    if (finished) return;
    finished = true;
    rain.stop();
    loadingScreen.classList.add('wipe');
    document.body.classList.remove('locked');

    const site = document.getElementById('site');
    if (site) site.classList.add('revealed');

    if (typeof onLoaded === 'function') {
      onLoaded();
    }

    setTimeout(() => {
      loadingScreen.remove();
    }, prefersReducedMotion ? 50 : 950);
  }

  // Al llegar a 21, se queda estático y habilita las opciones para avanzar
  animateCounter(() => {
    if (labelEl) {
      labelEl.textContent = '¡Toca aquí para entrar a tu sorpresa! ✨';
    }

    if (numberEl) {
      numberEl.classList.add('ready');
      numberEl.setAttribute('role', 'button');
      numberEl.setAttribute('tabindex', '0');
      numberEl.setAttribute('aria-label', 'Toca el número 21 para entrar a la página');
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

    // Permitir clic en cualquier parte de la pantalla de carga para entrar cómodamente
    loadingScreen.style.cursor = 'pointer';
    loadingScreen.addEventListener('click', (e) => {
      // Evitar doble disparo si se clickea un botón interno
      finishLoading();
    });
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
