/**
 * ============================================================
 * MÓDULO: EFECTOS Y TRANSICIÓN SORPRESA (HERO SECTION)
 * ============================================================
 * Gestiona la transición mágica desde la pantalla de carga (Matrix)
 * hacia la sección principal (Hero):
 * - Onda expansiva luminosa y flash de portal
 * - Chime armónico de celebración sintetizado (Web Audio API)
 * - Gran lluvia masiva y espectacular de confeti en tonos AZUL CLARO y ROSA CLARO
 * - Entrada dinámica con pop festivo y aura radiante para la foto de Edith
 * - Efectos de confeti y destellos flotantes PERSISTENTES y exclusivos del Hero
 * - Micro-interacciones al hacer clic/toque en la sección Hero
 * - Desactivación automática al hacer scroll fuera del Hero
 */

(function () {
  'use strict';

  // ============================================================
  // PALETA DE COLORES (AZUL CLARO Y ROSA CLARO VIBRANTE)
  // ============================================================
  const PALETTE = {
    lightBlue: [
      '#3BA0DA', // Azul celeste intenso festivo
      '#4CAEE3', // Azul cielo vivo
      '#6BC3EE', // Celeste luminoso
      '#8ED2F5', // Azul pastel brillante
      '#248FD3', // Azul saturado para contraste nítido
      '#A7E0FA'  // Azul nube claro
    ],
    lightPink: [
      '#FF5B85', // Rosa vivo destacado
      '#FF7E9F', // Rosa alegre festivo
      '#FF9CBD', // Rosa dulce pastel
      '#FFAEC4', // Frambuesa suave
      '#FF3B72', // Fucsia pastel vibrante
      '#FFB6C1'  // Rosa claro clásico
    ],
    accents: [
      '#FFFFFF', // Destello blanco puro
      '#FDE047', // Toque dorado brillante
      '#FFF0A5'  // Oro perla festivo
    ]
  };

  const SHAPES = ['ribbon', 'heart', 'star', 'dot'];

  // Variables globales
  let ambientCanvas = null;
  let ambientCtx = null;
  let transitionCanvas = null;
  let transitionCtx = null;
  let isHeroVisible = true;
  let ambientParticles = [];
  let burstParticles = [];
  let isAmbientRunning = false;
  let isBurstRunning = false;
  let animFrameAmbient = null;
  let animFrameBurst = null;
  let heroEl = null;

  // ============================================================
  // AUDIO SINTETIZADO: CHIME MÁGICO DE CELEBRACIÓN
  // ============================================================
  function playCelebrationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Arpegio pentatónico ascendente brillante (Mi Mayor: E5, G#5, B5, E6, G#6)
      const frequencies = [659.25, 830.61, 987.77, 1318.51, 1661.22];
      const now = ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.075;

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.26, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 1.35);
      });

      // Suave "pop" festivo de baja frecuencia
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(240, now);
      popOsc.frequency.exponentialRampToValueAtTime(55, now + 0.18);

      popGain.gain.setValueAtTime(0.34, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(now);
      popOsc.stop(now + 0.24);
    } catch (e) {
      // Ignorar bloqueos de audio del navegador
    }
  }

  // ============================================================
  // RUTINAS VECTORIALES DE DIBUJO (CANVAS)
  // ============================================================
  function drawHeartVector(ctx, size) {
    const s = size * 0.52;
    ctx.save();
    ctx.translate(0, -s * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.9, -s * 0.8, -s * 1.45, s * 0.35, 0, s * 1.4);
    ctx.bezierCurveTo(s * 1.45, s * 0.35, s * 0.9, -s * 0.8, 0, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawStarVector(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill();
  }

  function drawRibbonVector(ctx, w, h) {
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.fillRect(-w / 2, -h / 2, w * 0.38, h);
  }

  function clearCanvasBuffer(ctx, canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // ============================================================
  // GENERADOR DE PARTÍCULAS (AZUL CLARO & ROSA CLARO)
  // ============================================================
  function getRandomColor(type = 'all') {
    if (type === 'blue') return PALETTE.lightBlue[Math.floor(Math.random() * PALETTE.lightBlue.length)];
    if (type === 'pink') return PALETTE.lightPink[Math.floor(Math.random() * PALETTE.lightPink.length)];
    const isBlue = Math.random() < 0.48;
    const isPink = !isBlue && Math.random() < 0.90;
    if (isBlue) return PALETTE.lightBlue[Math.floor(Math.random() * PALETTE.lightBlue.length)];
    if (isPink) return PALETTE.lightPink[Math.floor(Math.random() * PALETTE.lightPink.length)];
    return PALETTE.accents[Math.floor(Math.random() * PALETTE.accents.length)];
  }

  function createConfettiPiece(x, y, vx, vy, options = {}) {
    const color = getRandomColor();
    const shape = options.shape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const size = options.size || (shape === 'ribbon' ? 16 + Math.random() * 12 : 20 + Math.random() * 14);

    return {
      x,
      y,
      vx,
      vy,
      gravity: options.gravity !== undefined ? options.gravity : 0.34,
      drag: options.drag !== undefined ? options.drag : 0.975,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.05 + Math.random() * 0.08,
      wobbleRadius: 2.2 + Math.random() * 3.5,
      rotationX: Math.random() * 360,
      rotationY: Math.random() * 360,
      rotationZ: Math.random() * 360,
      rotSpeedX: (Math.random() - 0.5) * 11,
      rotSpeedY: (Math.random() - 0.5) * 11,
      rotSpeedZ: (Math.random() - 0.5) * 8,
      size,
      width: shape === 'ribbon' ? size * (0.65 + Math.random() * 0.35) : size,
      height: size,
      color,
      shape,
      alpha: 1,
      decay: options.decay !== undefined ? options.decay : 0.0035 + Math.random() * 0.0028,
      ambient: options.ambient || false
    };
  }

  function drawParticle(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    const scaleX = Math.cos((p.rotationX * Math.PI) / 180);
    const scaleY = Math.sin((p.rotationY * Math.PI) / 180);
    ctx.rotate((p.rotationZ * Math.PI) / 180);
    ctx.scale(Math.abs(scaleX) < 0.16 ? 0.16 : scaleX, Math.abs(scaleY) < 0.16 ? 0.16 : scaleY);

    ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;

    if (p.shape === 'ribbon') {
      drawRibbonVector(ctx, p.width, p.height);
    } else if (p.shape === 'heart') {
      drawHeartVector(ctx, p.size);
    } else if (p.shape === 'star') {
      drawStarVector(ctx, p.size * 0.75);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ============================================================
  // 1. GRAN EXPLOSIÓN DE CONFETTI (TRANSICIÓN DE PANTALLA)
  // ============================================================
  function spawnDOMBurstConfetti(w, h) {
    const symbols = ['♥', '✦', '✨', '🌸', '♡', '✧'];
    const count = 48;
    const container = document.body;

    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const originX = isLeft ? '8vw' : '92vw';
      const originY = '92vh';

      const destX = isLeft
        ? `${15 + Math.random() * 65}vw`
        : `${20 + Math.random() * 65}vw`;
      const destY = `${8 + Math.random() * 75}vh`;

      const rot = `${(Math.random() - 0.5) * 720}deg`;
      const color = getRandomColor();
      const isSymbol = Math.random() < 0.55;

      const el = document.createElement('span');
      if (isSymbol) {
        el.className = 'hero-transition-piece hero-transition-piece--heart';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.color = color;
        el.style.setProperty('--size', `${18 + Math.random() * 16}px`);
      } else {
        el.className = 'hero-transition-piece hero-transition-piece--ribbon';
        el.style.backgroundColor = color;
        el.style.setProperty('--w', `${16 + Math.random() * 16}px`);
        el.style.setProperty('--h', `${8 + Math.random() * 7}px`);
      }

      el.style.setProperty('--originX', originX);
      el.style.setProperty('--originY', originY);
      el.style.setProperty('--destX', destX);
      el.style.setProperty('--destY', destY);
      el.style.setProperty('--rot', rot);
      el.style.setProperty('--scale', `${1 + Math.random() * 0.4}`);
      el.style.animationDelay = `${(i % 5) * 0.08}s`;

      container.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }
  }

  function startGrandConfettiBurst() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Disparar oleada DOM de alta fidelidad 3D
    spawnDOMBurstConfetti(w, h);

    if (!transitionCanvas) {
      transitionCanvas = document.createElement('canvas');
      transitionCanvas.id = 'hero-transition-canvas';
      transitionCanvas.setAttribute('aria-hidden', 'true');
      transitionCanvas.style.position = 'fixed';
      transitionCanvas.style.inset = '0';
      transitionCanvas.style.width = '100vw';
      transitionCanvas.style.height = '100vh';
      transitionCanvas.style.pointerEvents = 'none';
      transitionCanvas.style.zIndex = '10005';
      document.body.appendChild(transitionCanvas);
    }

    transitionCtx = transitionCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    transitionCanvas.width = Math.round(w * dpr);
    transitionCanvas.height = Math.round(h * dpr);
    transitionCtx.setTransform(1, 0, 0, 1, 0, 0);
    transitionCtx.scale(dpr, dpr);

    burstParticles = [];

    function addWave(powerMultiplier = 1.0) {
      const countLeft = Math.round(50 * powerMultiplier);
      for (let i = 0; i < countLeft; i++) {
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.65;
        const speed = (22 + Math.random() * 24) * powerMultiplier;
        burstParticles.push(
          createConfettiPiece(
            w * 0.05 + (Math.random() - 0.5) * 60,
            h * 0.92,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            { gravity: 0.36, drag: 0.968, decay: 0.003 + Math.random() * 0.0025 }
          )
        );
      }

      const countRight = Math.round(50 * powerMultiplier);
      for (let i = 0; i < countRight; i++) {
        const angle = (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.65;
        const speed = (22 + Math.random() * 24) * powerMultiplier;
        burstParticles.push(
          createConfettiPiece(
            w * 0.95 + (Math.random() - 0.5) * 60,
            h * 0.92,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            { gravity: 0.36, drag: 0.968, decay: 0.003 + Math.random() * 0.0025 }
          )
        );
      }

      const countCenter = Math.round(40 * powerMultiplier);
      for (let i = 0; i < countCenter; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (10 + Math.random() * 18) * powerMultiplier;
        const shape = Math.random() < 0.4 ? 'heart' : Math.random() < 0.75 ? 'star' : 'ribbon';
        burstParticles.push(
          createConfettiPiece(
            w * 0.5,
            h * 0.48,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 6,
            {
              gravity: 0.28,
              drag: 0.97,
              shape,
              size: 22 + Math.random() * 16,
              decay: 0.0035 + Math.random() * 0.003
            }
          )
        );
      }
    }

    addWave(1.0);
    setTimeout(() => {
      if (isBurstRunning) addWave(0.85);
    }, 250);

    isBurstRunning = true;

    function renderBurst() {
      if (!isBurstRunning || !transitionCtx) return;

      clearCanvasBuffer(transitionCtx, transitionCanvas);

      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];

        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleRadius;
        p.y += p.vy;

        p.rotationX += p.rotSpeedX;
        p.rotationY += p.rotSpeedY;
        p.rotationZ += p.rotSpeedZ;

        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > h + 120) {
          burstParticles.splice(i, 1);
        } else {
          drawParticle(transitionCtx, p);
        }
      }

      if (burstParticles.length > 0) {
        animFrameBurst = requestAnimationFrame(renderBurst);
      } else {
        isBurstRunning = false;
        if (transitionCanvas) {
          transitionCanvas.remove();
          transitionCanvas = null;
          transitionCtx = null;
        }
      }
    }

    if (animFrameBurst) cancelAnimationFrame(animFrameBurst);
    renderBurst();
  }

  // ============================================================
  // 2. EFECTOS AMBIENTALES PERSISTENTES (EXCLUSIVOS DEL HERO)
  // ============================================================
  function isHeroInViewport() {
    if (!heroEl) return true;
    const rect = heroEl.getBoundingClientRect();
    return rect.bottom > 50 && rect.top < window.innerHeight;
  }

  function initDOMAmbientConfetti(container) {
    if (!container || container.querySelector('.hero-float-piece')) return;
    const symbols = ['♥', '✦', '✨', '♡', '✧'];
    const total = 26;

    for (let i = 0; i < total; i++) {
      const el = document.createElement('span');
      const isSymbol = Math.random() < 0.55;
      const color = getRandomColor();
      const startX = `${5 + Math.random() * 90}%`;
      const sway = `${25 + Math.random() * 35}px`;
      const duration = `${7 + Math.random() * 6}s`;
      const delay = `${(i * 0.35).toFixed(2)}s`;
      const maxH = `${Math.min(window.innerHeight * 0.95, 820)}px`;

      if (isSymbol) {
        el.className = 'hero-float-piece hero-float-piece--heart';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.color = color;
        el.style.setProperty('--size', `${15 + Math.random() * 13}px`);
      } else {
        el.className = 'hero-float-piece hero-float-piece--ribbon';
        el.style.backgroundColor = color;
        el.style.setProperty('--w', `${13 + Math.random() * 11}px`);
        el.style.setProperty('--h', `${7 + Math.random() * 6}px`);
      }

      el.style.setProperty('--startX', startX);
      el.style.setProperty('--sway', sway);
      el.style.setProperty('--duration', duration);
      el.style.setProperty('--delay', delay);
      el.style.setProperty('--maxH', maxH);

      container.appendChild(el);
    }
  }

  function initAmbientHeroEffects() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    heroEl = document.getElementById('hero');
    if (!heroEl) return;

    let fxWrap = document.getElementById('hero-fx-container');
    if (!fxWrap) {
      fxWrap = document.createElement('div');
      fxWrap.id = 'hero-fx-container';
      fxWrap.className = 'hero-fx-container';
      fxWrap.setAttribute('aria-hidden', 'true');
      heroEl.prepend(fxWrap);
    }

    // Inicializar confeti DOM ambiental flotante y persistente
    initDOMAmbientConfetti(fxWrap);

    ambientCanvas = document.getElementById('hero-ambient-canvas');
    if (!ambientCanvas) {
      ambientCanvas = document.createElement('canvas');
      ambientCanvas.id = 'hero-ambient-canvas';
      ambientCanvas.className = 'hero-ambient-canvas';
      fxWrap.appendChild(ambientCanvas);
    }

    ambientCtx = ambientCanvas.getContext('2d');

    function resizeAmbient() {
      if (!ambientCanvas || !heroEl) return;
      const dpr = window.devicePixelRatio || 1;
      const w = heroEl.offsetWidth || window.innerWidth;
      const h = Math.min(window.innerHeight * 1.15, heroEl.offsetHeight || window.innerHeight);

      ambientCanvas.width = Math.round(w * dpr);
      ambientCanvas.height = Math.round(h * dpr);
      ambientCanvas.style.width = w + 'px';
      ambientCanvas.style.height = h + 'px';

      ambientCtx.setTransform(1, 0, 0, 1, 0, 0);
      ambientCtx.scale(dpr, dpr);
    }

    resizeAmbient();
    window.addEventListener('resize', resizeAmbient);

    // Partículas adicionales de canvas para densidad rica
    const count = window.innerWidth < 640 ? 30 : 45;
    ambientParticles = [];
    for (let i = 0; i < count; i++) {
      ambientParticles.push(createAmbientParticle(true));
    }

    window.addEventListener(
      'scroll',
      () => {
        const visible = isHeroInViewport();
        if (visible !== isHeroVisible) {
          isHeroVisible = visible;
          if (isHeroVisible && !isAmbientRunning) {
            startAmbientLoop();
          }
        }
      },
      { passive: true }
    );

    isHeroVisible = isHeroInViewport();
    startAmbientLoop();

    // Micro-interacción: toques o clics en el Hero generan mini-estallidos festivos
    heroEl.addEventListener('pointerdown', (e) => {
      if (e.target && e.target.closest('button, .sticker-item, a, .scroll-hint')) return;

      const rect = heroEl.getBoundingClientRect();
      const heroX = e.clientX - rect.left;
      const heroY = e.clientY - rect.top;
      spawnHeroTapParticles(heroX, heroY);
    });
  }

  function createAmbientParticle(randomY = false) {
    const shapeRand = Math.random();
    const shape = shapeRand < 0.45 ? 'ribbon' : shapeRand < 0.70 ? 'heart' : shapeRand < 0.88 ? 'star' : 'dot';
    const color = getRandomColor();
    const size = shape === 'ribbon' ? 14 + Math.random() * 12 : 18 + Math.random() * 14;
    const w = (heroEl && heroEl.offsetWidth) || window.innerWidth;
    const h = Math.min(window.innerHeight * 1.15, (heroEl && heroEl.offsetHeight) || window.innerHeight);

    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -25 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.9,
      vy: 0.85 + Math.random() * 1.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.04,
      wobbleRadius: 1.6 + Math.random() * 2.8,
      rotationX: Math.random() * 360,
      rotationY: Math.random() * 360,
      rotationZ: Math.random() * 360,
      rotSpeedX: (Math.random() - 0.5) * 4,
      rotSpeedY: (Math.random() - 0.5) * 4,
      rotSpeedZ: (Math.random() - 0.5) * 3,
      size,
      width: shape === 'ribbon' ? size * 0.65 : size,
      height: size,
      color,
      shape,
      alpha: 0.82 + Math.random() * 0.18,
      ambient: true
    };
  }

  function startAmbientLoop() {
    if (isAmbientRunning) return;
    isAmbientRunning = true;

    function renderAmbient() {
      if (!isHeroVisible || !ambientCtx || !ambientCanvas || !heroEl) {
        isAmbientRunning = false;
        return;
      }

      const w = heroEl.offsetWidth || window.innerWidth;
      const h = Math.min(window.innerHeight * 1.15, heroEl.offsetHeight || window.innerHeight);

      clearCanvasBuffer(ambientCtx, ambientCanvas);

      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];

        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleRadius;
        p.y += p.vy;

        p.rotationX += p.rotSpeedX;
        p.rotationY += p.rotSpeedY;
        p.rotationZ += p.rotSpeedZ;

        if (p.y > h + 30) {
          ambientParticles[i] = createAmbientParticle(false);
        } else if (p.x < -35) {
          p.x = w + 25;
        } else if (p.x > w + 35) {
          p.x = -25;
        }

        drawParticle(ambientCtx, p);
      }

      animFrameAmbient = requestAnimationFrame(renderAmbient);
    }

    renderAmbient();
  }

  // ============================================================
  // MINI-ESTALLIDO AL TOCAR EN EL HERO
  // ============================================================
  function spawnHeroTapParticles(x, y) {
    if (!ambientParticles) return;

    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4.5 + Math.random() * 6.5;
      const shape = Math.random() < 0.4 ? 'heart' : Math.random() < 0.75 ? 'star' : 'ribbon';

      const p = createConfettiPiece(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 2.0, {
        gravity: 0.24,
        drag: 0.93,
        shape,
        size: 18 + Math.random() * 14,
        decay: 0.012 + Math.random() * 0.008
      });

      ambientParticles.push(p);
    }

    if (!isAmbientRunning) {
      startAmbientLoop();
    }
  }

  // ============================================================
  // 3. TRANSICIÓN SORPRESA COMPLETA (ORQUESTACIÓN)
  // ============================================================
  function triggerSurpriseTransition() {
    playCelebrationChime();
    createShockwaveAndFlash();
    startGrandConfettiBurst();

    heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.classList.add('hero-surprise-active');

      const heroImg = heroEl.querySelector('.hero-img');
      const imgWrap = heroEl.querySelector('.hero-image-wrap');
      if (imgWrap && !imgWrap.querySelector('.hero-surprise-aura')) {
        const aura = document.createElement('div');
        aura.className = 'hero-surprise-aura';
        aura.setAttribute('aria-hidden', 'true');
        imgWrap.prepend(aura);
      }

      if (heroImg) {
        heroImg.classList.remove('hero-pop-animate');
        void heroImg.offsetWidth;
        heroImg.classList.add('hero-pop-animate');
      }

      const stickers = heroEl.querySelectorAll('.sticker-item');
      stickers.forEach((sticker, idx) => {
        setTimeout(() => {
          sticker.classList.add('sticker-joy');
          setTimeout(() => sticker.classList.remove('sticker-joy'), 1400);
        }, 150 + (idx % 7) * 90);
      });
    }

    initAmbientHeroEffects();
  }

  function createShockwaveAndFlash() {
    const flash = document.createElement('div');
    flash.className = 'loader-flash';
    document.body.appendChild(flash);

    const shockwave = document.createElement('div');
    shockwave.className = 'loader-shockwave';
    document.body.appendChild(shockwave);

    setTimeout(() => {
      flash.remove();
      shockwave.remove();
    }, 1200);
  }

  // Exponer API globalmente
  window.HeroSurprise = {
    triggerSurpriseTransition,
    initAmbientHeroEffects,
    spawnHeroTapParticles,
    startGrandConfettiBurst
  };
})();
