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
    if (hint) hint.textContent = 'Toca la ✕ para cerrar';
  }

  function closeLetter() {
    if (!scene.classList.contains('open')) return;
    scene.classList.remove('open');
    envelope.setAttribute('aria-expanded', 'false');
    if (hint) hint.textContent = 'Toca el sobre para abrirlo';
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
}
