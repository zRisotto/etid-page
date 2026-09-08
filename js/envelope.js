/**
 * ============================================================
 * MÓDULO: SOBRE Y CARTA INTERACTIVA
 * ============================================================
 * Controla la animación tridimensional de apertura del sobre,
 * el retiro del sello y el despliegue de la carta de felicitación.
 */

function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const paper = document.getElementById('letter-paper');
  const hint = document.getElementById('envelope-hint');

  if (!envelope || !paper || !hint) return;

  function toggle() {
    const isOpen = envelope.classList.toggle('open');
    envelope.setAttribute('aria-expanded', String(isOpen));
    hint.textContent = isOpen ? 'Toca para cerrar' : 'Toca para abrir';

    if (isOpen) {
      paper.classList.add('show');
    } else {
      paper.classList.remove('show');
    }
  }

  envelope.addEventListener('click', toggle);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}
