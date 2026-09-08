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
 * al hacer scroll después de la sección de edad (21)
 */
function initSideFlanks() {
  const flanks = document.querySelectorAll('.side-flank');
  const target = document.getElementById('flanked-content');
  if (!flanks.length || !target) return;

  function updateFlanks() {
    const rect = target.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Transición suave: se activa gradualmente cuando el contenido posterior
    // a la sección de edad se aproxima al viewport, sin mostrarse en el hero
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

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes del sitio
  initEnvelope();
  initGallery();
  initCakeSprinkles();
  initCandles();
  initSideFlanks();

  // Iniciar pantalla de carga; al finalizar se activan partículas de fondo y corazones
  initLoader(() => {
    initParticles();
    initFloatingHearts();
  });
});
