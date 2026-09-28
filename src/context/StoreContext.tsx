import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, StaffSeat, StudioAuditLog, Currency, PaymentMethod, ProductCategory, DiscordProfile, UploadedMediaItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STAFF_SEATS, INITIAL_AUDIT_LOGS, CURRENCY_RATES, INITIAL_UPLOADED_MEDIA } from '../data/initialData';
import confetti from 'canvas-confetti';
import { getFromIndexedDB, saveToIndexedDB, safeLocalStorage } from '../utils/storage';

// =========================================================================
// ACCESO PRIVADO: LISTAS DE PERSONAS AUTORIZADAS EN CÓDIGO POR IP Y DISCORD
// =========================================================================

// 1. Usuarios específicos de Discord autorizados para ver el panel de administración
export const AUTHORIZED_DISCORD_ADMINS = [
  'benjamin',
  'benjamin (owner)',
  'benjaminmaig6',
  'benjaminmaig6@gmail.com',
  'benjamin#0001',
  'juan',
  'juan_sbt',
  'juan_sbt#2026',
  'mario',
  'mario_sbt',
  'mario_sbt#2026',
  'owner',
  'sbt_admin'
];

// 2. Personas autorizadas por IP dentro del código
export const AUTHORIZED_IPS = [
  '127.0.0.1',
  'localhost',
  '::1',
  '192.168.1.1',
  '87.30.282.135',
  'admin-network'
];

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  staffSeats: StaffSeat[];
  currentStaff: StaffSeat;
  auditLogs: StudioAuditLog[];
  currency: Currency;
  activeCategory: ProductCategory;
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAdminOpen: boolean;
  checkoutProduct: Product | null; // for direct "Buy Now"
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
  currentView: 'store' | 'product';
  setCurrentView: (v: 'store' | 'product') => void;
  // Discord & Admin Auth
  discordProfile: DiscordProfile | null;
  linkDiscord: (username: string, customAvatar?: string) => DiscordProfile;
  unlinkDiscord: () => void;
  isAuthorizedAdmin: boolean;
  isDiscordAuthOpen: boolean;
  setIsDiscordAuthOpen: (open: boolean) => void;
  isIpAuthorized: boolean;
  setIsIpAuthorized: (auth: boolean) => void;
  loginFlowState: 'idle' | 'login' | 'denied' | 'authorized';
  setLoginFlowState: (s: 'idle' | 'login' | 'denied' | 'authorized') => void;
  deniedUsername: string;
  setDeniedUsername: (u: string) => void;
  openDiscordLoginFlow: () => void;
  // Furniture Quick Price & Bulk Creator
  quickUpdatePrice: (productId: string, newPrice: number) => void;
  bulkAddProductsFromFiles: (files: { name: string; url: string; isGif?: boolean }[], defaultPrice?: number) => Product[];
  // Uploaded Files / Media (GIFs / Images)
  uploadedMedia: UploadedMediaItem[];
  addUploadedMedia: (item: Omit<UploadedMediaItem, 'id' | 'createdAt'>) => UploadedMediaItem;
  bulkAddUploadedMedia: (items: Omit<UploadedMediaItem, 'id' | 'createdAt'>[]) => UploadedMediaItem[];
  removeUploadedMedia: (id: string) => void;
  // Setters
  setCurrency: (c: Currency) => void;
  setActiveCategory: (cat: ProductCategory) => void;
  setSearchQuery: (q: string) => void;
  setSelectedProduct: (p: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  setCheckoutProduct: (p: Product | null) => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  // Order & Checkout
  processOrder: (details: {
    customerName: string;
    customerEmail: string;
    steamIdOrDiscord: string;
    paymentMethod: PaymentMethod;
    directProduct?: Product | null;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  // Staff & Admin Actions
  switchStaffSeat: (seatId: string) => void;
  toggleSeatOnline: (seatId: string) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  addAuditLog: (action: string, target: string) => void;
  // Helpers
  formatPrice: (amountInUSD: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PRODUCTS = 'sbt_studios_products_v5';
const LOCAL_STORAGE_KEY_ORDERS = 'sbt_studios_orders_v5';
const LOCAL_STORAGE_KEY_CART = 'sbt_studios_cart_v5';
const LOCAL_STORAGE_KEY_SEATS = 'sbt_studios_staff_seats_v6';
const LOCAL_STORAGE_KEY_LOGS = 'sbt_studios_logs_v5';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map(p => {
          if (!p.mediaGallery || p.mediaGallery.length === 0) {
            return {
              ...p,
              mediaGallery: [
                { id: `${p.id}-mg-1`, type: 'image' as const, label: 'Vista Principal', url: p.image, previewUrl: p.image },
                { id: `${p.id}-mg-2`, type: 'image' as const, label: 'Ángulo Isométrico', url: p.gallery?.[1] || p.image, previewUrl: p.gallery?.[1] || p.image },
                { id: `${p.id}-mg-3`, type: 'image' as const, label: 'Detalle de Texturas', url: p.gallery?.[2] || p.image, previewUrl: p.gallery?.[2] || p.image },
                ...(p.gifUrl ? [{ id: `${p.id}-mg-gif`, type: 'gif' as const, label: 'Animación GIF', url: p.gifUrl, previewUrl: p.gifUrl }] : []),
                ...(p.youtubeUrl ? [{ id: `${p.id}-mg-yt`, type: 'video' as const, label: 'Video YouTube', url: p.youtubeUrl, previewUrl: p.image }] : [])
              ]
            };
          }
          return p;
        });
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Staff seats (fixed max 3 people)
  const [staffSeats, setStaffSeats] = useState<StaffSeat[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SEATS);
      return saved ? JSON.parse(saved) : INITIAL_STAFF_SEATS;
    } catch {
      return INITIAL_STAFF_SEATS;
    }
  });

  const [currentStaffId, setCurrentStaffId] = useState<string>('seat_1');

  // Logs
  const [auditLogs, setAuditLogs] = useState<StudioAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Currency & Navigation
  const [currency, setCurrency] = useState<Currency>('USD');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('furniture');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem('sbt_studios_theme');
      return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Current View: 'store' vs 'product' (dedicated full standalone page)
  const [currentView, setCurrentView] = useState<'store' | 'product'>('store');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('sbt_studios_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Discord Profile & Private Access Authorization
  const [discordProfile, setDiscordProfile] = useState<DiscordProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sbt_discord_profile_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isDiscordAuthOpen, setIsDiscordAuthOpen] = useState<boolean>(false);
  const [loginFlowState, setLoginFlowState] = useState<'idle' | 'login' | 'denied' | 'authorized'>('idle');
  const [deniedUsername, setDeniedUsername] = useState<string>('');

  const openDiscordLoginFlow = () => {
    setLoginFlowState('login');
    setIsDiscordAuthOpen(true);
  };

  // Uploaded media library (GIFs & Images)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('sbt_studios_media_v2');
      return saved ? JSON.parse(saved) : INITIAL_UPLOADED_MEDIA;
    } catch {
      return INITIAL_UPLOADED_MEDIA;
    }
  });

  useEffect(() => {
    saveToIndexedDB('all_media', uploadedMedia);
    try {
      localStorage.setItem('sbt_studios_media_v2', JSON.stringify(uploadedMedia));
    } catch (e) {
      // Ignore quota exceeded error; data is safe in IndexedDB
    }
  }, [uploadedMedia]);

  const addUploadedMedia = (item: Omit<UploadedMediaItem, 'id' | 'createdAt'>): UploadedMediaItem => {
    const newItem: UploadedMediaItem = {
      ...item,
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toLocaleDateString('es-ES')
    };
    setUploadedMedia(prev => [newItem, ...prev]);
    addAuditLog('Subió archivo multimedia', newItem.name);
    return newItem;
  };

  const bulkAddUploadedMedia = (items: Omit<UploadedMediaItem, 'id' | 'createdAt'>[]): UploadedMediaItem[] => {
    const newItems: UploadedMediaItem[] = items.map((item, idx) => ({
      ...item,
      id: `media-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toLocaleDateString('es-ES')
    }));
    setUploadedMedia(prev => [...newItems, ...prev]);
    addAuditLog('Subió archivos multimedia en lote', `${newItems.length} archivos`);
    return newItems;
  };

  const removeUploadedMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== id));
    addAuditLog('Eliminó archivo multimedia', id);
  };

  // IP authorization (configured in code via AUTHORIZED_IPS)
  const [isIpAuthorized, setIsIpAuthorized] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return AUTHORIZED_IPS.some(ip => ip.toLowerCase() === hostname.toLowerCase());
      }
      return false;
    } catch {
      return false;
    }
  });

  // Derived authorization: authorized if linked Discord account is admin OR IP authorized
  const isAuthorizedAdmin = Boolean(
    discordProfile?.isAuthorizedAdmin || isIpAuthorized
  );

  const linkDiscord = (username: string, customAvatar?: string): DiscordProfile => {
    const clean = username.trim();
    const isOwner = clean.toLowerCase().includes('benjamin') || clean.toLowerCase().includes('owner');
    const isJuan = clean.toLowerCase().includes('juan');
    const isMario = clean.toLowerCase().includes('mario');

    const isAuthorized = AUTHORIZED_DISCORD_ADMINS.some(
      adm => adm.toLowerCase() === clean.toLowerCase()
    ) || isOwner || isJuan || isMario;

    const avatarUrl = customAvatar || (
      isOwner ? INITIAL_STAFF_SEATS[0].avatar :
      isJuan ? INITIAL_STAFF_SEATS[1].avatar :
      isMario ? INITIAL_STAFF_SEATS[2].avatar :
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`
    );

    const profile: DiscordProfile = {
      id: `discord-${Date.now()}`,
      username: clean,
      avatar: avatarUrl,
      isAuthorizedAdmin: isAuthorized,
      linkedAt: new Date().toLocaleDateString('es-ES')
    };

    setDiscordProfile(profile);
    try {
      localStorage.setItem('sbt_discord_profile_v2', JSON.stringify(profile));
    } catch {
      // ignore
    }

    if (isAuthorized) {
      setLoginFlowState('authorized');
      addAuditLog('Cuenta de Discord autorizada vinculada', clean);
    } else {
      setLoginFlowState('denied');
      setDeniedUsername(clean);
      addAuditLog('Intento de acceso Discord denegado', clean);
    }

    return profile;
  };

  const unlinkDiscord = () => {
    setDiscordProfile(null);
    setLoginFlowState('idle');
    try {
      localStorage.removeItem('sbt_discord_profile_v2');
    } catch {
      // ignore
    }
    addAuditLog('Cuenta de Discord desvinculada', '');
  };

  // Load persisted products and media from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    getFromIndexedDB<Product[]>('all_products').then(savedProducts => {
      if (isMounted && savedProducts && Array.isArray(savedProducts) && savedProducts.length > 0) {
        setProducts(savedProducts);
      }
    });

    getFromIndexedDB<UploadedMediaItem[]>('all_media').then(savedMedia => {
      if (isMounted && savedMedia && Array.isArray(savedMedia) && savedMedia.length > 0) {
        setUploadedMedia(savedMedia);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with IndexedDB & LocalStorage
  useEffect(() => {
    saveToIndexedDB('all_products', products);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {
      // LocalStorage quota reached; products are safely preserved in IndexedDB
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SEATS, JSON.stringify(staffSeats));
    } catch {
      // ignore
    }
  }, [staffSeats]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  const currentStaff = staffSeats.find(s => s.id === currentStaffId) || staffSeats[0];

  const addAuditLog = (action: string, target: string) => {
    const newLog: StudioAuditLog = {
      id: `log-${Date.now()}`,
      staffName: currentStaff.name,
      action,
      target,
      timestamp: 'Ahora mismo'
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Automated Payment & Order Processor
  const processOrder = async (details: {
    customerName: string;
    customerEmail: string;
    steamIdOrDiscord: string;
    paymentMethod: PaymentMethod;
    directProduct?: Product | null;
  }): Promise<Order> => {
    const orderItems: CartItem[] = details.directProduct
      ? [{ product: details.directProduct, quantity: 1 }]
      : [...cart];

    const total = details.directProduct
      ? details.directProduct.price
      : cartTotal;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SBT-ORD-${randomSuffix}`;
    const codeKey = `SBT-LIC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      customerName: details.customerName,
      customerEmail: details.customerEmail,
      steamIdOrDiscord: details.steamIdOrDiscord,
      paymentMethod: details.paymentMethod,
      items: orderItems,
      totalAmount: total,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completado',
      licenseKey: codeKey,
      downloadUrl: `https://sbtstudios.io/downloads/${orderId}.zip`,
      transactionRef: `tx_autocashier_${Date.now()}`
    };

    // Update orders
    setOrders(prev => [newOrder, ...prev]);

    // Update sales count and limited stock on products
    setProducts(prev =>
      prev.map(prod => {
        const matchingItem = orderItems.find(i => i.product.id === prod.id);
        if (matchingItem) {
          const newStock = prod.stockCount !== undefined ? Math.max(0, prod.stockCount - matchingItem.quantity) : undefined;
          return {
            ...prod,
            salesCount: prod.salesCount + matchingItem.quantity,
            stockCount: newStock
          };
        }
        return prod;
      })
    );

    // If it was regular cart, clear cart
    if (!details.directProduct) {
      clearCart();
    }

    addAuditLog('Venta automatizada procesada exitosamente', `Orden ${orderId} (${details.customerEmail})`);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    addAuditLog(`Actualizó estado de pedido a "${status}"`, `Orden #${orderId}`);
  };

  const switchStaffSeat = (seatId: string) => {
    setCurrentStaffId(seatId);
    setStaffSeats(prev =>
      prev.map(s => (s.id === seatId ? { ...s, isOnline: true, lastActive: 'Ahora mismo' } : s))
    );
  };

  const toggleSeatOnline = (seatId: string) => {
    setStaffSeats(prev =>
      prev.map(s => (s.id === seatId ? { ...s, isOnline: !s.isOnline } : s))
    );
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    addAuditLog('Modificó especificaciones de producto', updated.name);
  };

  const quickUpdatePrice = (productId: string, newPrice: number) => {
    const valid = Math.max(0, Number(newPrice) || 0);
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            price: valid,
            originalPrice: p.originalPrice || Math.round(valid * 1.2)
          };
        }
        return p;
      })
    );
    const prod = products.find(p => p.id === productId);
    addAuditLog('Cambió precio de mueble', `${prod?.name || 'Mueble'} -> $${valid} USD`);
  };

  const bulkAddProductsFromFiles = (
    files: { name: string; url: string; isGif?: boolean }[],
    defaultPrice: number = 350
  ): Product[] => {
    const newItems: Product[] = files.map((file, idx) => {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const title = capitalized || `Mueble SBT #${products.length + idx + 1}`;
      const id = `sbt-bulk-${Date.now().toString(36)}-${idx}`;
      const unturnedCode = (60300 + products.length + idx).toString();

      return {
        id,
        name: title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: 'furniture',
        subcategory: 'Mobiliario Nórdico Exclusivo',
        price: defaultPrice,
        originalPrice: Math.round(defaultPrice * 1.2),
        description: `Mobiliario personalizado de Unturned 3.0 con texturas PBR, colisiones perfeccionadas y licencia de servidor perpetua.`,
        longDescription: `Pieza de mobiliario lista para servidor Unturned 3.0. Fabricado por SBT Studios bajo estándares de alta fidelidad, shaders calibrados y colisiones sin bugs de movimiento.`,
        image: file.url,
        gifUrl: file.isGif ? file.url : undefined,
        gallery: [file.url],
        mediaGallery: [
          {
            id: `${id}-mg-1`,
            type: file.isGif ? 'gif' : 'image',
            label: 'Vista Principal',
            url: file.url,
            previewUrl: file.url
          }
        ],
        unturnedIds: [unturnedCode],
        unityVersion: 'Unity 2021.3.29f1 (LTS)',
        modType: 'Barricade',
        stockType: 'unlimited',
        rating: 5.0,
        salesCount: 0,
        features: ['Animación interactiva', 'Colisiones optimizadas', 'Licencia perpetua de servidor'],
        downloadFileName: `${title.replace(/\s+/g, '_')}_v1.unitypackage`,
        tags: ['Muebles', 'Unturned', 'SBT Studios'],
        featured: true
      };
    });

    setProducts(prev => [...newItems, ...prev]);
    addAuditLog('Creación masiva de muebles desde computadora', `${newItems.length} muebles creados`);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    return newItems;
  };

  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `sbt-asset-${Date.now().toString(36)}`
    };
    setProducts(prev => [newProduct, ...prev]);
    addAuditLog('Añadió nuevo asset al catálogo', newProduct.name);
  };

  const deleteProduct = (productId: string) => {
    const toDelete = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (toDelete) {
      addAuditLog('Eliminó producto del catálogo', toDelete.name);
    }
  };

  const formatPrice = (amountInUSD: number): string => {
    const { rate, symbol, prefix } = CURRENCY_RATES[currency];
    const converted = amountInUSD * rate;
    if (currency === 'ARS') {
      return `${symbol} ${Math.round(converted).toLocaleString('es-AR')} ${prefix}`;
    }
    return `${symbol}${converted.toFixed(2)} ${prefix}`;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        staffSeats,
        currentStaff,
        auditLogs,
        currency,
        activeCategory,
        searchQuery,
        selectedProduct,
        isCartOpen,
        isCheckoutOpen,
        isAdminOpen,
        checkoutProduct,
        theme,
        toggleTheme,
        setTheme,
        currentView,
        setCurrentView,
        setCurrency,
        setActiveCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAdminOpen,
        setCheckoutProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        processOrder,
        updateOrderStatus,
        switchStaffSeat,
        toggleSeatOnline,
        updateProduct,
        quickUpdatePrice,
        bulkAddProductsFromFiles,
        uploadedMedia,
        addUploadedMedia,
        bulkAddUploadedMedia,
        removeUploadedMedia,
        addProduct,
        deleteProduct,
        addAuditLog,
        formatPrice,
        discordProfile,
        linkDiscord,
        unlinkDiscord,
        isAuthorizedAdmin,
        isDiscordAuthOpen,
        setIsDiscordAuthOpen,
        isIpAuthorized,
        setIsIpAuthorized,
        loginFlowState,
        setLoginFlowState,
        deniedUsername,
        setDeniedUsername,
        openDiscordLoginFlow
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
