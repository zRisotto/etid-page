/**
 * ============================================================
 * SCRIPT PRINCIPAL (ENTRY POINT)
 * ============================================================
 * Inicializa todos los módulos y orquesta la experiencia
 * interactiva cuando el documento HTML está listo.
 */

function initFloatingHearts() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const hero = document.getElementById('hero');
  if (!hero) return;

  const glyphs = ['♥', '♡'];
  const total = 5;

  for (let i = 0; i < total; i++) {
    const span = document.createElement('span');
    span.className = 'float-heart';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = glyphs[i % 2];
    span.style.left = (8 + Math.random() * 84) + '%';
    span.style.bottom = (Math.random() * 20) + '%';
    span.style.animationDelay = (Math.random() * 8) + 's';
    span.style.animationDuration = (7 + Math.random() * 5) + 's';
    hero.appendChild(span);
  }
}

/**
 * Controla la transición suave de los márgenes con textura vichy
 * al hacer scroll después del Hero hacia el contenido principal
 */
function initSideFlanks() {
  const flanks = document.querySelectorAll('.side-flank');
  const target = document.getElementById('flanked-content');
  if (!flanks.length || !target) return;

  function updateFlanks() {
    const rect = target.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Transición suave al aproximarse el contenido flanqueado
    const startPoint = windowH * 0.85;
    const endPoint = windowH * 0.25;
    const progress = Math.min(Math.max((startPoint - rect.top) / (startPoint - endPoint), 0), 1);

    const opacity = (progress * 0.92).toFixed(3);
    flanks.forEach((flank) => {
      flank.style.opacity = opacity;
    });
  }

  window.addEventListener('scroll', updateFlanks, { passive: true });
  window.addEventListener('resize', updateFlanks, { passive: true });
  updateFlanks();
}

/**
 * Revela suavemente cada una de las zonas del sitio al hacer scroll
 * con animaciones fluidas y transiciones armónicas entre etapas
 */
function initZoneTransitions() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zones = document.querySelectorAll('.zone-stage');
  if (!zones.length) return;

  if (prefersReducedMotion) {
    zones.forEach((zone) => zone.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  zones.forEach((zone) => {
    observer.observe(zone);
  });
}

/**
 * Observa y activa la animación de fade-in al scrollear
 * para elementos clave del sitio (títulos, tarjetas, carruseles, pastel)
 */
function initScrollFadeIn() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal-on-scroll, .photo-card, .zone-divider');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach(el => el.classList.add('is-inview'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes del sitio
  initEnvelope();
  if (typeof initGrowthSliders === 'function') {
    initGrowthSliders();
  }
  initGallery();
  initCakeSprinkles();
  initCandles();
  initSideFlanks();
  initZoneTransitions();
  initScrollFadeIn();
  if (typeof initMusicController === 'function') {
    initMusicController();
  }

  // Iniciar pantalla de carga; al finalizar se activan partículas de fondo y corazones
  initLoader(() => {
    initParticles();
    initFloatingHearts();
  });
});
