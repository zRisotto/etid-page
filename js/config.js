/**
 * ============================================================
 * CONFIGURACIÓN DE LA PÁGINA DE CUMPLEAÑOS
 * ============================================================
 * Aquí puedes editar fácilmente los textos, mensajes, fotos y recuerdos
 * para personalizar la sorpresa para Edith.
 */

window.BIRTHDAY_CONFIG = {
  // Información principal
  name: "Edith",
  age: 21,

  // Fotos para el deslizador "Edith de niña" (izquierda)
  childhoodPhotos: [
    'assets/edith chiquia/1.jpg',
    'assets/edith chiquia/2.jpg',
    'assets/edith chiquia/3.jpg',
    'assets/edith chiquia/4.jpg',
    'assets/edith chiquia/5.jpg'
  ],

  // Fotos para el deslizador "Edith hoy" (derecha)
  adultPhotos: [
    'assets/edith grande/1.jpg',
    'assets/edith grande/2.jpg',
    'assets/edith grande/3.jpg',
    'assets/edith grande/4.jpg',
    'assets/edith grande/5.jpg'
  ],

  // Galería de tarjetas con recuerdos y dedicatorias
  // Al tocar cada tarjeta, gira en 3D para revelar el mensaje
  gallery: [
    {
      label: "Recuerdo 1",
      colors: ["#FFC5D3", "#96C6E0"],
      caption: "Una sonrisa que ilumina cualquier día"
    },
    {
      label: "Recuerdo 2",
      colors: ["#96C6E0", "#F0B860"],
      caption: "Un recuerdo que vale la pena guardar para siempre"
    },
    {
      label: "Recuerdo 3",
      colors: ["#F0B860", "#FFC5D3"],
      caption: "Momentos inolvidables que se quedan en el corazón"
    },
    {
      label: "Recuerdo 4",
      colors: ["#FFC5D3", "#d9a7ff"],
      caption: "Esa risa tuya tan única y contagiosa"
    },
    {
      label: "Recuerdo 5",
      colors: ["#96C6E0", "#FFC5D3"],
      caption: "Un día cualquiera hecho completamente especial a tu lado"
    },
    {
      label: "Recuerdo 6",
      colors: ["#d9a7ff", "#96C6E0"],
      caption: "Celebrando este año contigo, ¡y por muchos más!"
    },
    {
      label: "Recuerdo 7",
      colors: ["#FFC5D3", "#F0B860"],
      caption: "Tus abrazos sinceros que reconfortan el alma"
    },
    {
      label: "Recuerdo 8",
      colors: ["#96C6E0", "#a1e5d5"],
      caption: "Cada plática contigo donde las horas se pasan volando"
    }
  ],

  // Colecciones de fotos y GIFs de la carpeta /assets/CARDS
  cardsAlbums: {
    main: [
      'assets/CARDS/8 MAIN/1.JPG',
      'assets/CARDS/8 MAIN/2.png',
      'assets/CARDS/8 MAIN/3.jpg',
      'assets/CARDS/8 MAIN/4.jpg',
      'assets/CARDS/8 MAIN/5.jpg',
      'assets/CARDS/8 MAIN/6.jpg',
      'assets/CARDS/8 MAIN/7.jpg',
      'assets/CARDS/8 MAIN/8.jpg'
    ],
    roblox: [
      'assets/CARDS/8 roblox/HnVideoEditor_2026_09_17_213841307.gif',
      'assets/CARDS/8 roblox/IMG-20250104-WA0017.jpg',
      'assets/CARDS/8 roblox/IMG-20250104-WA0026.jpg',
      'assets/CARDS/8 roblox/IMG-20250111-WA0006.jpg',
      'assets/CARDS/8 roblox/HnVideoEditor_2026_09_17_215009242.gif',
      'assets/CARDS/8 roblox/IMG-20250521-WA0081.jpg',
      'assets/CARDS/8 roblox/IMG-20250901-WA0024.jpg',
      'assets/CARDS/8 roblox/IMG-20260107-WA0043.jpg'
    ],
    us: [
      'assets/CARDS/8 us/HnVideoEditor_2026_09_17_213759202.gif',
      'assets/CARDS/8 us/IMG-20250421-WA0001.jpg',
      'assets/CARDS/8 us/IMG-20250621-WA0062.jpg',
      'assets/CARDS/8 us/IMG-20250718-WA0073.jpg',
      'assets/CARDS/8 us/IMG_20251108_195521.jpg',
      'assets/CARDS/8 us/IMG-20251108-WA0124.jpg',
      'assets/CARDS/8 us/IMG-20260202-WA0049.jpg',
      'assets/CARDS/8 us/IMG-20260503-WA0030.jpg'
    ],
    gus: [
      'assets/CARDS/8 GUS/HnVideoEditor_2026_09_17_213621291.gif',
      'assets/CARDS/8 GUS/IMG-20240208-WA0037.jpg',
      'assets/CARDS/8 GUS/IMG-20250123-WA0012.jpg',
      'assets/CARDS/8 GUS/IMG-20250203-WA0021.jpg',
      'assets/CARDS/8 GUS/IMG_20250512_211004.jpg',
      'assets/CARDS/8 GUS/IMG_20250712_211118.jpg',
      'assets/CARDS/8 GUS/IMG-20260103-WA0029.jpg',
      'assets/CARDS/8 GUS/IMG_20260217_180923_edit_1345323171532737.jpg'
    ],
    beso: [
      'assets/CARDS/8 beso/recuerdo 1.jpg',
      'assets/CARDS/8 beso/recuerdo 2.jpg',
      'assets/CARDS/8 beso/recuerdo 3.jpg',
      'assets/CARDS/8 beso/recuerdo 4.jpg',
      'assets/CARDS/8 beso/recuerdo 5.jpg',
      'assets/CARDS/8 beso/recuerdo 6.jpg',
      'assets/CARDS/8 beso/recuerdo 7.jpg',
      'assets/CARDS/8 beso/recuerdo 8.jpg'
    ]
  },

  // Secuencia emotiva de transición cuando las 8 tarjetas son volteadas
  cardsSequence: [
    {
      key: 'roblox',
      title: '🎮 Nuestras tardes en Roblox',
      subtitle: 'Risas, partidas juntos y momentos únicos'
    },
    {
      key: 'us',
      title: '✨ Tú y Yo',
      subtitle: 'Cada instante a tu lado se queda en el corazón'
    },
    {
      key: 'gus',
      title: '🐾 Nuestro adorado Gus',
      subtitle: 'Compañero de nuestros días más felices'
    },
    {
      key: 'beso',
      title: '💋 Abrazos y besos que guardo siempre',
      subtitle: 'Todo el cariño y la ternura del mundo'
    }
  ],

  // Mensaje al regresar a Main
  cardsFinalReturn: {
    title: '❤️ Por mil recuerdos más a tu lado',
    subtitle: 'Felices 21 años, mi hermosa Edith ✨'
  }
};
