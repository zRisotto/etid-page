/**
 * ============================================================
 * MÓDULO: GALERÍA DE RECUERDOS (FLIP 3D)
 * ============================================================
 * Renderiza dinámicamente las tarjetas de fotos a partir de la
 * configuración en config.js y maneja el efecto de volteo tridimensional.
 */

function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const defaultPalettes = [
    ['#FFC5D3', '#96C6E0'],
    ['#96C6E0', '#F0B860'],
    ['#F0B860', '#FFC5D3'],
    ['#FFC5D3', '#d9a7ff'],
    ['#96C6E0', '#FFC5D3'],
    ['#d9a7ff', '#96C6E0'],
    ['#FFC5D3', '#F0B860'],
    ['#96C6E0', '#a1e5d5'],
    ['#a1e5d5', '#FFC5D3'],
    ['#F0B860', '#96C6E0'],
    ['#d9a7ff', '#FFC5D3'],
    ['#96C6E0', '#d9a7ff']
  ];

  const defaultCaptions = [
    'Una sonrisa que ilumina el día',
    'Un recuerdo que vale la pena guardar',
    'Momentos que se quedan para siempre',
    'Una risa inolvidable',
    'Un día cualquiera, hecho especial',
    'Este año, y muchos más',
    'Tus abrazos sinceros que reconfortan el alma',
    'Cada plática contigo donde las horas se pasan volando',
    'Esa chispa en tus ojos cuando hablas de lo que amas',
    'Cómplices en las risas, anécdotas y en todo lo bonito',
    'Tu ternura y esa luz tan linda que siempre transmites',
    'Por todas las historias increíbles que nos faltan por vivir'
  ];

  const items = (window.BIRTHDAY_CONFIG && Array.isArray(window.BIRTHDAY_CONFIG.gallery))
    ? window.BIRTHDAY_CONFIG.gallery
    : defaultPalettes.map((pair, i) => ({
        colors: pair,
        caption: defaultCaptions[i],
        label: `Foto ${i + 1}`,
        image: ''
      }));

  grid.innerHTML = '';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'photo-card reveal-item';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Ver recuerdo ${i + 1}: ${item.caption || item.label || ''}`);
    card.style.setProperty('--card-index', i);

    const pair = item.colors || defaultPalettes[i % defaultPalettes.length];
    const hasImage = Boolean(item.image && item.image.trim() !== '');

    const frontContent = hasImage
      ? `<img src="${item.image}" alt="${item.label || 'Recuerdo'}" class="card-photo" onerror="this.parentElement.classList.remove('has-image'); this.remove();" loading="lazy">
         <div class="card-overlay"><span class="card-overlay-label">${item.label || `Foto ${i + 1}`}</span></div>`
      : `<span class="card-icon" aria-hidden="true">📷</span>
         <span class="card-label">${item.label || `Foto ${i + 1}`}</span>`;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front ${hasImage ? 'has-image' : ''}" style="--g1:${pair[0]};--g2:${pair[1]}">
          ${frontContent}
        </div>
        <div class="card-face card-back">
          <p>${item.caption || 'Un momento para recordar'}</p>
        </div>
      </div>
    `;

    const flip = () => card.classList.toggle('flipped');
    card.addEventListener('click', flip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });

    grid.appendChild(card);
  });
}
