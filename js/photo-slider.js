/**
 * ============================================================
 * MÓDULO: DESLIZADORES DUALES DE FOTOS (CRECIMIENTO / RECUERDOS)
 * ============================================================
 * Maneja los dos carruseles de fotos (Edith niña vs. Edith hoy)
 * con autoavance, navegación táctil, resguardo ante fotos faltantes
 * y animación de texto íntimo con IntersectionObserver.
 */

function createSlider(containerId, photos, placeholderText) {
  const el = document.getElementById(containerId);
  if (!el) return null;

  let current = 0;
  let timer = null;

  el.innerHTML = `
    <div class="pj-track"></div>
    <button class="pj-arrow prev" aria-label="Foto anterior" type="button">‹</button>
    <button class="pj-arrow next" aria-label="Foto siguiente" type="button">›</button>
  `;

  const track = el.querySelector('.pj-track');

  photos.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'pj-slide';
    slide.dataset.placeholder = placeholderText;

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Foto de Edith ${i + 1}`;
    img.loading = 'lazy';
    img.onerror = () => slide.classList.add('is-missing');

    slide.appendChild(img);
    track.appendChild(slide);
  });

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'pj-dots';

  photos.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'pj-dot';
    dot.setAttribute('aria-label', `Ir a la foto ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  el.insertAdjacentElement('afterend', dotsWrap);

  const slides = track.querySelectorAll('.pj-slide');
  const dots = dotsWrap.querySelectorAll('.pj-dot');

  function render() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(i) {
    current = (i + photos.length) % photos.length;
    render();
    restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  const prevBtn = el.querySelector('.pj-arrow.prev');
  const nextBtn = el.querySelector('.pj-arrow.next');

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let touchX = null;
  el.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
    clearInterval(timer);
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 40) {
      goTo(current + (delta < 0 ? 1 : -1));
    } else {
      restart();
    }
    touchX = null;
  }, { passive: true });

  const glowWrap = el.closest('.growth-frame-glow') || el;
  glowWrap.addEventListener('mouseenter', () => clearInterval(timer));
  glowWrap.addEventListener('mouseleave', restart);

  render();
  restart();

  return { goTo, restart };
}

function initGrowthSliders() {
  const defaultChildhood = [
    'fotos/edith-nina-1.jpg',
    'fotos/edith-nina-2.jpg',
    'fotos/edith-nina-3.jpg',
    'fotos/edith-nina-4.jpg',
    'fotos/edith-nina-5.jpg'
  ];

  const defaultAdult = [
    'fotos/edith-hoy-1.jpg',
    'fotos/edith-hoy-2.jpg',
    'fotos/edith-hoy-3.jpg',
    'fotos/edith-hoy-4.jpg',
    'fotos/edith-hoy-5.jpg'
  ];

  const cfg = window.BIRTHDAY_CONFIG || {};
  const childhoodPhotos = (Array.isArray(cfg.childhoodPhotos) && cfg.childhoodPhotos.length)
    ? cfg.childhoodPhotos
    : defaultChildhood;

  const adultPhotos = (Array.isArray(cfg.adultPhotos) && cfg.adultPhotos.length)
    ? cfg.adultPhotos
    : defaultAdult;

  createSlider('sliderNina', childhoodPhotos, 'Coloca aquí una foto de Edith de niña');
  createSlider('sliderHoy', adultPhotos, 'Coloca aquí una foto reciente de Edith');

  // Revelar texto íntimo y subrayado animado al entrar al viewport
  const textCol = document.getElementById('textCol');
  if (textCol) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          textCol.classList.add('is-visible');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });

    io.observe(textCol);
  }
}
