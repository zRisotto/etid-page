/**
 * ============================================================
 * MÓDULO: PASTEL, VELAS Y DESEO
 * ============================================================
 * Maneja los chispas (sprinkles) decorativos del pastel,
 * el apagado interactivo de las velas (por clic o teclado),
 * y la revelación del mensaje con explosión de confeti.
 */

function initCakeSprinkles() {
  const cake = document.getElementById('cake-body');
  if (!cake) return;

  const colors = ['#ffffff', '#FFC5D3', '#F0B860'];
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('span');
    dot.className = 'sprinkle';
    dot.style.left = (6 + Math.random() * 88) + '%';
    dot.style.top = (10 + Math.random() * 34) + '%';
    dot.style.background = colors[i % colors.length];
    dot.style.transform = `rotate(${Math.random() * 360}deg)`;
    cake.appendChild(dot);
  }
}

function initCandles() {
  const flames = Array.from(document.querySelectorAll('.flame'));
  const hint = document.getElementById('wish-hint');
  const message = document.getElementById('wish-message');
  const cakeScene = document.querySelector('.cake-scene');

  if (!flames.length || !cakeScene) return;

  let remaining = flames.length;

  function updateHint() {
    if (!hint) return;
    hint.textContent = remaining > 0
      ? `Faltan ${remaining} vela${remaining > 1 ? 's' : ''} por apagar`
      : '¡Deseo pedido!';
  }
  updateHint();

  function burstConfetti() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const colors = ['#FFC5D3', '#96C6E0', '#F0B860', '#ffffff'];
    for (let i = 0; i < 34; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const x = (Math.random() * 220 - 110) + 'px';
      const y = (Math.random() * -180 - 60) + 'px';
      const r = (Math.random() * 360) + 'deg';
      piece.style.setProperty('--x', x);
      piece.style.setProperty('--y', y);
      piece.style.setProperty('--r', r);
      piece.style.left = '50%';
      piece.style.top = '10%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      if (Math.random() > 0.6) piece.style.borderRadius = '50%';

      cakeScene.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  function revealWish() {
    if (message) message.classList.add('show');
    burstConfetti();
  }

  flames.forEach((flame) => {
    function extinguish() {
      if (flame.classList.contains('out')) return;
      flame.classList.add('out');
      remaining--;
      updateHint();
      if (remaining === 0) revealWish();
    }

    flame.addEventListener('click', extinguish);
    flame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        extinguish();
      }
    });
  });
}
