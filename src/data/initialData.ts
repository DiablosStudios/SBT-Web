import { Product, StaffSeat, Order, StudioAuditLog, Currency, UploadedMediaItem } from '../types';
import heroImg from '../assets/images/sbt_hero_furniture_1790300040626.jpg';
import furnitureImg from '../assets/images/unturned_furniture_pack_1790300054245.jpg';
import rpImg from '../assets/images/unturned_rp_pack_1790300068112.jpg';
import uiImg from '../assets/images/unturned_ui_pack_1790300080874.jpg';
import bmExactLogo from '../assets/images/bm_exact_logo.svg';
import bmOwnerLocalPhoto from '../assets/images/BM.png';

const bmOwnerPhotoUrl = 'https://i.postimg.cc/vTzt1gqN/BM.png';

export { heroImg, furnitureImg, rpImg, uiImg, bmOwnerPhotoUrl as ownerAvatarImg, bmOwnerLocalPhoto, bmExactLogo };

export const INITIAL_UPLOADED_MEDIA: UploadedMediaItem[] = [
  {
    id: 'media-1',
    name: 'sbt_hero_furniture.jpg',
    url: heroImg,
    type: 'image',
    sizeFormatted: '184 KB',
    createdAt: '26/09/2026'
  },
  {
    id: 'media-2',
    name: 'unturned_furniture_pack.jpg',
    url: furnitureImg,
    type: 'image',
    sizeFormatted: '210 KB',
    createdAt: '26/09/2026'
  },
  {
    id: 'media-3',
    name: 'bm_exact_logo.svg',
    url: bmExactLogo,
    type: 'image',
    sizeFormatted: '12 KB',
    createdAt: '26/09/2026'
  },
  {
    id: 'media-4',
    name: 'bm_owner_avatar.png',
    url: bmOwnerPhotoUrl,
    type: 'image',
    sizeFormatted: '300x169',
    createdAt: '28/09/2026'
  },
  {
    id: 'media-5',
    name: 'juan_avatar.jpg',
    url: 'https://avatars.fastly.steamstatic.com/c9b7a115618d561fce20a08554d2a0e9ca697282_full.jpg',
    type: 'image',
    sizeFormatted: '184x184',
    createdAt: '28/09/2026'
  },
  {
    id: 'media-6',
    name: 'mario_avatar.gif',
    url: 'https://shared.fastly.steamstatic.com/community_assets/images/items/2599270/6ff395bd40a219619f4cfa17b2a79d34a4f14476.gif',
    type: 'image',
    sizeFormatted: '72 KB (GIF)',
    createdAt: '28/09/2026'
  }
];

export const INITIAL_STAFF_SEATS: StaffSeat[] = [
  {
    id: 'seat_1',
    name: 'Benjamin (Owner)',
    role: 'Lead 3D Artist & Director',
    email: 'benjaminmaig6@gmail.com',
    avatar: bmOwnerPhotoUrl,
    isOnline: true,
    pin: '1234',
    lastActive: 'Ahora mismo',
    permissions: ['all', 'inventory', 'orders', 'financials'],
    specialty: 'Modelado 3D de Muebles Nórdicos & Dirección de Arte',
    bio: 'Fundador y modelador principal de SBT Studios. Especialista en arquitectura escandinava de bajo poligonaje, optimización de colisiones físicas y texturizado para Unturned.',
    steamUrl: 'https://steamcommunity.com/id/benjamin_sbt',
    redditUrl: 'https://reddit.com/user/benjamin_sbt',
    steamUsername: 'benjamin_sbt',
    redditUsername: 'u/benjamin_sbt',
    works: [
      {
        id: 'work-b1',
        title: 'SBT Furnture minimalista',
        role: 'Director de Arte & Lead 3D Sculptor',
        year: '2026',
        category: 'Objetos / Muebles',
        description: 'Suite completa de mobiliario minimalista nórdico con sillón curvo de terciopelo, mesa de roble y lámpara interactiva.',
        image: heroImg
      },
      {
        id: 'work-b2',
        title: 'Executive Tactical Desk & Studio',
        role: 'Modelador 3D & Rigging',
        year: '2025',
        category: 'Mobiliario Corporativo',
        description: 'Escritorio con archiveros funcionales de 30 casillas e iluminación emisiva en pantallas dobles.',
        image: furnitureImg
      },
      {
        id: 'work-b3',
        title: 'Master Platform Bed & Spawn Framework',
        role: 'Desarrollador 3D',
        year: '2025',
        category: 'Unturned Barricades',
        description: 'Cama con sistema de anclaje de reaparición interactiva para bases de facción.',
        image: heroImg
      }
    ]
  },
  {
    id: 'seat_2',
    name: 'Juan',
    role: 'Desarrollador 3D & Unity Specialist',
    email: 'juan.modding@sbtstudios.io',
    avatar: 'https://avatars.fastly.steamstatic.com/c9b7a115618d561fce20a08554d2a0e9ca697282_full.jpg',
    isOnline: true,
    pin: '2345',
    lastActive: 'Hace 4 min',
    permissions: ['inventory', 'orders'],
    specialty: 'Mobiliario 3D, Animaciones y Shaders Unity',
    bio: 'Desarrollador 3D en SBT Studios. Especialista en topología limpia, texturizado estilizado y configuración de prefabs en Unity 2021 LTS para servidores de Unturned.',
    steamUrl: 'https://steamcommunity.com/id/juan_sbt',
    redditUrl: 'https://reddit.com/user/juan_sbt',
    steamUsername: 'juan_sbt',
    redditUsername: 'u/juan_sbt',
    works: [
      {
        id: 'work-j1',
        title: 'Mobiliario Escandinavo v2',
        role: 'Desarrollador 3D',
        year: '2026',
        category: 'Mobiliario / Objetos',
        description: 'Optimización de mallas y colisiones de alta precisión para muebles de oficina y rol.',
        image: furnitureImg
      }
    ]
  },
  {
    id: 'seat_3',
    name: 'Mario',
    role: 'Gestor de Pedidos & Optimización de Servidores',
    email: 'mario.rp@sbtstudios.io',
    avatar: 'https://shared.fastly.steamstatic.com/community_assets/images/items/2599270/6ff395bd40a219619f4cfa17b2a79d34a4f14476.gif',
    isOnline: false,
    pin: '3456',
    lastActive: 'Hace 28 min',
    permissions: ['orders', 'inventory'],
    specialty: 'Configuración de Servidores, Colisiones y Control de Calidad',
    bio: 'Especialista en integración y soporte de servidores para Unturned. Verifica la estabilidad física, empaquetado .dat y rendimiento en entornos multijugador.',
    steamUrl: 'https://steamcommunity.com/id/mario_sbt',
    redditUrl: 'https://reddit.com/user/mario_sbt',
    steamUsername: 'mario_sbt',
    redditUsername: 'u/mario_sbt',
    works: [
      {
        id: 'work-m1',
        title: 'Server Physics & Optimization Framework',
        role: 'Control de Calidad & QA',
        year: '2026',
        category: 'QA / Servidores',
        description: 'Auditoría de colisiones y balanceo de bajo consumo en servidores Unturned.',
        image: rpImg
      }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // ONLY REQUESTED PRODUCT: SBT Furnture minimalista ($350 USD)
  {
    id: 'sbt-furn-minimalista',
    name: 'SBT Furnture minimalista',
    slug: 'sbt-furnture-minimalista',
    category: 'furniture',
    subcategory: 'Mobiliario Nórdico Exclusivo',
    price: 350.00,
    originalPrice: 420.00,
    description: 'Suite completa de mobiliario minimalista nórdico para Unturned: sillón curvo de terciopelo oscuro, mesa de centro de roble escandinavo, tazón cerámico decorativo y lámpara con luz cálida funcional.',
    longDescription: 'Edición insignia definitiva creada por Benjamin. Diseñada minuciosamente para servidores de Unturned Roleplay y bases de alta gama. Contiene modelos con colisiones físicas optimizadas, materiales PBR de estilo vainilla refinado, animaciones interactivas de asiento y lámpara con interruptor funcional de encendido/apagado nocturno. Incluye archivos .dat y proyecto para Unity 2021 LTS con licencia perpetua para tu servidor.',
    image: heroImg,
    gallery: [
      heroImg,
      furnitureImg
    ],
    mediaGallery: [
      {
        id: 'mg-1',
        type: 'image',
        label: 'Vista Principal',
        url: heroImg,
        previewUrl: heroImg
      },
      {
        id: 'mg-2',
        type: 'image',
        label: 'Ángulo Isométrico',
        url: furnitureImg,
        previewUrl: furnitureImg
      },
      {
        id: 'mg-3',
        type: 'image',
        label: 'Detalle de Texturas',
        url: heroImg,
        previewUrl: heroImg
      }
    ],
    unturnedIds: ['60101 (Sillón Nórdico)', '60102 (Mesa Roble)', '60103 (Lámpara Piso)', '60104 (Bowl Cerámico)'],
    unityVersion: 'Unity 2021.3.29f1 (LTS)',
    modType: 'Barricade',
    stockType: 'unlimited',
    rating: 5.0,
    salesCount: 88,
    features: [
      'Animación de sentarse interactiva integrada',
      'Iluminación suave nocturna con shader funcional',
      'Colisiones físicas sin bugs de movimiento',
      'Listo para servidores Vanilla, OpenMod o RocketMod'
    ],
    downloadFileName: 'SBT_Furnture_Minimalista_v3.unitypackage',
    tags: ['Muebles', 'Minimalista', 'Nordic', 'SBT Studios', 'Lujo'],
    featured: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SBT-ORD-9102',
    customerName: 'Santiago Romero (Owner Clan Delta)',
    customerEmail: 'santiago.delta@gmail.com',
    steamIdOrDiscord: '76561198083921094',
    paymentMethod: 'card',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 }
    ],
    totalAmount: 350.00,
    date: '2026-09-24 17:45',
    status: 'Descargado',
    licenseKey: 'SBT-LIC-9102-DELTA-88A',
    downloadUrl: '#sbt-download-pkg-9102',
    transactionRef: 'tx_stripe_98a72b0c1e'
  }
];

export const INITIAL_AUDIT_LOGS: StudioAuditLog[] = [
  {
    id: 'log-1',
    staffName: 'Benjamin (Owner)',
    action: 'Fijó el paquete insignia "SBT Furnture minimalista" a 350 USD con licencia de servidor',
    timestamp: 'Ahora mismo',
    target: 'SBT Furnture minimalista'
  }
];

export const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string; prefix: string }> = {
  USD: { rate: 1, symbol: '$', prefix: 'USD' },
  EUR: { rate: 0.92, symbol: '€', prefix: 'EUR' },
  ARS: { rate: 1250, symbol: '$', prefix: 'ARS' },
  MXN: { rate: 19.5, symbol: '$', prefix: 'MXN' }
};
