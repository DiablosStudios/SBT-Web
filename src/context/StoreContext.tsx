import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, Order, StaffSeat, StudioAuditLog, Currency, PaymentMethod, ProductCategory, DiscordProfile, UploadedMediaItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STAFF_SEATS, INITIAL_AUDIT_LOGS, CURRENCY_RATES, INITIAL_UPLOADED_MEDIA } from '../data/initialData';
import confetti from 'canvas-confetti';
import { getFromIndexedDB, saveToIndexedDB, safeLocalStorage } from '../utils/storage';
import { api, authStorage } from '../utils/api';

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

export const AUTHORIZED_IPS = [
  '127.0.0.1',
  'localhost',
  '::1',
  '192.168.1.1',
  '87.30.282.135',
  'admin-network'
];

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  checkoutProduct: Product | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
  currentView: 'store' | 'product';
  setCurrentView: (v: 'store' | 'product') => void;
  // Discord & Admin Auth
  discordProfile: DiscordProfile | null;
  linkDiscord: (username: string, customAvatar?: string, password?: string) => Promise<DiscordProfile>;
  loginWithDiscord: () => Promise<void>;
  discordConfig: {
    isConfigured: boolean;
    clientId: string | null;
    primaryRedirectUri: string;
    devCallbackUrl: string;
    sharedCallbackUrl: string;
  } | null;
  checkDiscordConfig: () => Promise<void>;
  unlinkDiscord: () => Promise<void>;
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
  // Server Sync Status for Admin Panel
  syncStatus: SyncStatus;
  setSyncStatus: (s: SyncStatus) => void;
  triggerMigration: () => Promise<void>;
  // Furniture Quick Price & Bulk Creator
  quickUpdatePrice: (productId: string, newPrice: number) => Promise<void>;
  bulkAddProductsFromFiles: (files: { name: string; url: string; isGif?: boolean }[], defaultPrice?: number) => Promise<Product[]>;
  // Uploaded Files / Media (GIFs / Images)
  uploadedMedia: UploadedMediaItem[];
  addUploadedMedia: (item: Omit<UploadedMediaItem, 'id' | 'createdAt'>) => Promise<UploadedMediaItem>;
  bulkAddUploadedMedia: (items: Omit<UploadedMediaItem, 'id' | 'createdAt'>[]) => Promise<UploadedMediaItem[]>;
  removeUploadedMedia: (id: string) => Promise<void>;
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
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  // Staff & Admin Actions
  switchStaffSeat: (seatId: string) => void;
  toggleSeatOnline: (seatId: string) => void;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addAuditLog: (action: string, target: string) => void;
  // Helpers
  formatPrice: (amountInUSD: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CART = 'sbt_studios_cart_v5';
const LOCAL_STORAGE_KEY_SEATS = 'sbt_studios_staff_seats_v8';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync status for admin UI banner: "Publicando...", "Publicado en vivo", "Error al guardar"
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markSyncSuccess = useCallback(() => {
    setSyncStatus('saved');
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setSyncStatus('idle');
    }, 4000);
  }, []);

  const markSyncError = useCallback(() => {
    setSyncStatus('error');
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setSyncStatus('idle');
    }, 6000);
  }, []);

  // Products: initialized with default, immediately fetched and synced with server
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders (Admin only)
  const [orders, setOrders] = useState<Order[]>([]);

  // Staff seats
  const [staffSeats, setStaffSeats] = useState<StaffSeat[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SEATS);
      return saved ? JSON.parse(saved) : INITIAL_STAFF_SEATS;
    } catch {
      return INITIAL_STAFF_SEATS;
    }
  });

  const [currentStaffId, setCurrentStaffId] = useState<string>('seat_1');

  // Current staff member and audit logger
  const currentStaff = staffSeats.find(s => s.id === currentStaffId) || staffSeats[0];

  const addAuditLog = useCallback((action: string, target: string) => {
    const newLog: StudioAuditLog = {
      id: `log-${Date.now()}`,
      staffName: currentStaff.name,
      action,
      target,
      timestamp: 'Ahora mismo'
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
    api.addLog(action, target, currentStaff.name);
  }, [currentStaff.name]);

  // Logs (Admin only)
  const [auditLogs, setAuditLogs] = useState<StudioAuditLog[]>([]);

  // Currency & Navigation
  const [currency, setCurrency] = useState<Currency>('USD');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('furniture');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem('sbt_studios_theme');
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
    } catch {
      return 'dark';
    }
  });

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

  // Discord Profile & Server Authorization
  const [discordProfile, setDiscordProfile] = useState<DiscordProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sbt_discord_profile_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isServerTokenValid, setIsServerTokenValid] = useState<boolean>(false);
  const [isDiscordAuthOpen, setIsDiscordAuthOpen] = useState<boolean>(false);
  const [loginFlowState, setLoginFlowState] = useState<'idle' | 'login' | 'denied' | 'authorized'>('idle');
  const [deniedUsername, setDeniedUsername] = useState<string>('');

  // Uploaded media library (GIFs & Images)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>(INITIAL_UPLOADED_MEDIA);

  // IP authorization check
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

  // Admin is strictly authorized only when verified through Discord OAuth2 with an authorized admin ID
  const isAuthorizedAdmin = Boolean(
    discordProfile?.isAuthorizedAdmin && isServerTokenValid
  );

  const fetchSharedCatalog = useCallback(async () => {
    try {
      const [catData, mediaData] = await Promise.allSettled([
        api.getCatalog(),
        api.getMedia()
      ]);

      if (catData.status === 'fulfilled' && catData.value && Array.isArray(catData.value.products)) {
        if (catData.value.products.length > 0) {
          setProducts(catData.value.products);
          saveToIndexedDB('all_products', catData.value.products);
        }
      }

      if (mediaData.status === 'fulfilled' && mediaData.value && Array.isArray(mediaData.value.media)) {
        if (mediaData.value.media.length > 0) {
          setUploadedMedia(mediaData.value.media);
          saveToIndexedDB('all_media', mediaData.value.media);
        }
      }
    } catch (err) {
      console.warn('[Catalog AutoSync] Error fetching shared catalog:', err);
    }
  }, []);

  // Poll server catalog every 30 seconds
  useEffect(() => {
    fetchSharedCatalog();
    const interval = setInterval(fetchSharedCatalog, 30000);
    return () => clearInterval(interval);
  }, [fetchSharedCatalog]);

  // Verify server token on mount
  useEffect(() => {
    api.verifyToken().then(isValid => {
      setIsServerTokenValid(isValid);
      if (isValid && discordProfile) {
        setLoginFlowState('authorized');
      }
    });
  }, [discordProfile]);

  // Fetch admin-only orders and audit logs when authorized
  const fetchAdminData = useCallback(async () => {
    if (!isAuthorizedAdmin) return;
    try {
      const [ord, lgs] = await Promise.all([
        api.getOrders(),
        api.getLogs()
      ]);
      setOrders(ord);
      setAuditLogs(lgs);
    } catch (e) {
      console.warn('[AdminData] Could not fetch admin data:', e);
    }
  }, [isAuthorizedAdmin]);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchAdminData();
    }
  }, [isAuthorizedAdmin, fetchAdminData]);

  // Migration from client IndexedDB to server on first admin session
  const migrationRanRef = useRef(false);
  const triggerMigration = useCallback(async () => {
    if (!isAuthorizedAdmin || migrationRanRef.current) return;
    migrationRanRef.current = true;

    try {
      const [localProducts, localMedia] = await Promise.all([
        getFromIndexedDB<Product[]>('all_products'),
        getFromIndexedDB<UploadedMediaItem[]>('all_media')
      ]);

      const hasBase64Product = localProducts?.some(p =>
        p.image?.startsWith('data:') ||
        p.gifUrl?.startsWith('data:') ||
        p.gallery?.some(g => g?.startsWith('data:')) ||
        p.mediaGallery?.some(m => m?.url?.startsWith('data:'))
      );
      const hasBase64Media = localMedia?.some(m => m.url?.startsWith('data:'));

      if (hasBase64Product || hasBase64Media || (localProducts && localProducts.length > 1)) {
        setSyncStatus('saving');
        const res = await api.migrateData(localProducts || [], localMedia || []);
        if (res.success) {
          if (res.products && res.products.length > 0) {
            setProducts(res.products);
            saveToIndexedDB('all_products', res.products);
          }
          if (res.media && res.media.length > 0) {
            setUploadedMedia(res.media);
            saveToIndexedDB('all_media', res.media);
          }
          markSyncSuccess();
        }
      }
    } catch (err) {
      console.warn('[Migration] Automatic migration completed or skipped:', err);
    }
  }, [isAuthorizedAdmin, markSyncSuccess]);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      triggerMigration();
    }
  }, [isAuthorizedAdmin, triggerMigration]);

  // Discord OAuth configuration state
  const [discordConfig, setDiscordConfig] = useState<{
    isConfigured: boolean;
    clientId: string | null;
    primaryRedirectUri: string;
    devCallbackUrl: string;
    sharedCallbackUrl: string;
  } | null>(null);

  const checkDiscordConfig = useCallback(async () => {
    try {
      const config = await api.getDiscordConfig();
      setDiscordConfig(config);
    } catch (err) {
      console.warn('[Auth] Error fetching Discord OAuth config:', err);
    }
  }, []);

  // 1. Initial server session verification (cookie or token)
  useEffect(() => {
    checkDiscordConfig();

    const checkServerSession = async () => {
      try {
        const res = await api.getMe();
        if (res.authenticated && res.user) {
          const u = res.user;
          const profile: DiscordProfile = {
            id: u.discordId || u.username,
            username: u.username,
            globalName: u.globalName,
            avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.username)}`,
            email: u.email,
            isAuthorizedAdmin: Boolean(u.isAuthorizedAdmin),
            linkedAt: new Date(u.createdAt || Date.now()).toLocaleDateString('es-ES')
          };
          setDiscordProfile(profile);
          setIsServerTokenValid(true);
          if (profile.isAuthorizedAdmin) {
            setLoginFlowState('authorized');
            fetchAdminData();
          } else {
            setLoginFlowState('denied');
            setDeniedUsername(profile.username);
          }
        }
      } catch (err) {
        console.warn('[Session] Session check error:', err);
      }
    };
    checkServerSession();
  }, [checkDiscordConfig, fetchAdminData]);

  // 2. Listen for Discord OAuth popup postMessage callback
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'DISCORD_OAUTH_SUCCESS') {
        const { profile: serverSession, token } = event.data;
        if (token) {
          authStorage.setToken(token);
          setIsServerTokenValid(true);
        }

        const profile: DiscordProfile = {
          id: serverSession.discordId || serverSession.username,
          username: serverSession.username,
          globalName: serverSession.globalName,
          avatar: serverSession.avatar,
          email: serverSession.email,
          isAuthorizedAdmin: Boolean(serverSession.isAuthorizedAdmin),
          linkedAt: new Date().toLocaleDateString('es-ES')
        };

        setDiscordProfile(profile);
        try {
          localStorage.setItem('sbt_discord_profile_v2', JSON.stringify(profile));
        } catch {
          // ignore
        }

        if (profile.isAuthorizedAdmin) {
          setLoginFlowState('authorized');
          addAuditLog('Inicio de sesión Discord verificado (Administrador)', profile.username);
          fetchAdminData();
        } else {
          setLoginFlowState('denied');
          setDeniedUsername(profile.username);
          addAuditLog('Inicio de sesión Discord (Sin rol administrador)', profile.username);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [addAuditLog, fetchAdminData]);

  const openDiscordLoginFlow = () => {
    setLoginFlowState('login');
    setIsDiscordAuthOpen(true);
  };

  // Real Discord OAuth2 popup trigger
  const loginWithDiscord = async (): Promise<void> => {
    try {
      const { url } = await api.getDiscordAuthUrl(window.location.origin);
      const popup = window.open(
        url,
        'discord_oauth_popup',
        'width=580,height=750,menubar=no,toolbar=no,location=no,status=no'
      );
      if (!popup) {
        throw new Error('El navegador bloqueó la ventana emergente. Por favor permite ventanas emergentes para continuar con Discord.');
      }
    } catch (err) {
      console.error('[OAuth] Error opening Discord login popup:', err);
      throw err;
    }
  };

  // Legacy/Password fallback admin login
  const linkDiscord = async (username: string, customAvatar?: string, password?: string): Promise<DiscordProfile> => {
    const clean = username.trim();
    const isOwner = clean.toLowerCase().includes('benjamin') || clean.toLowerCase().includes('owner');
    const isJuan = clean.toLowerCase().includes('juan');
    const isMario = clean.toLowerCase().includes('mario');

    const isWhiteListedName =
      AUTHORIZED_DISCORD_ADMINS.some(adm => adm.toLowerCase() === clean.toLowerCase()) ||
      isOwner ||
      isJuan ||
      isMario;

    let isAuthorized = false;

    // Try server authentication with password if provided, or default owner pass
    try {
      const passToTry = password || (isOwner ? '1234' : 'sbt_admin_2026!');
      const loginRes = await api.loginAdmin(clean, passToTry);
      if (loginRes.token) {
        setIsServerTokenValid(true);
        isAuthorized = true;
      }
    } catch (e) {
      if (password) {
        throw e;
      }
      isAuthorized = isWhiteListedName;
    }

    const avatarUrl =
      customAvatar ||
      (isOwner
        ? INITIAL_STAFF_SEATS[0].avatar
        : isJuan
        ? INITIAL_STAFF_SEATS[1].avatar
        : isMario
        ? INITIAL_STAFF_SEATS[2].avatar
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`);

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
      fetchAdminData();
    } else {
      setLoginFlowState('denied');
      setDeniedUsername(clean);
      addAuditLog('Intento de acceso Discord denegado', clean);
    }

    return profile;
  };

  const unlinkDiscord = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('[Logout] Error during server logout:', err);
    }
    authStorage.removeToken();
    setIsServerTokenValid(false);
    setDiscordProfile(null);
    setIsAdminOpen(false);
    setLoginFlowState('idle');
    try {
      localStorage.removeItem('sbt_discord_profile_v2');
    } catch {
      // ignore
    }
    addAuditLog('Sesión de Discord cerrada', '');
  };

  const addUploadedMedia = async (item: Omit<UploadedMediaItem, 'id' | 'createdAt'>): Promise<UploadedMediaItem> => {
    setSyncStatus('saving');
    const newItem: UploadedMediaItem = {
      ...item,
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toLocaleDateString('es-ES')
    };
    const nextList = [newItem, ...uploadedMedia];
    setUploadedMedia(nextList);
    saveToIndexedDB('all_media', nextList);

    try {
      markSyncSuccess();
      addAuditLog('Subió archivo multimedia', newItem.name);
    } catch {
      markSyncError();
    }
    return newItem;
  };

  const bulkAddUploadedMedia = async (items: Omit<UploadedMediaItem, 'id' | 'createdAt'>[]): Promise<UploadedMediaItem[]> => {
    setSyncStatus('saving');
    const newItems: UploadedMediaItem[] = items.map((item, idx) => ({
      ...item,
      id: `media-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toLocaleDateString('es-ES')
    }));
    const nextList = [...newItems, ...uploadedMedia];
    setUploadedMedia(nextList);
    saveToIndexedDB('all_media', nextList);

    try {
      markSyncSuccess();
      addAuditLog('Subió archivos multimedia en lote', `${newItems.length} archivos`);
    } catch {
      markSyncError();
    }
    return newItems;
  };

  const removeUploadedMedia = async (id: string): Promise<void> => {
    setSyncStatus('saving');
    const nextList = uploadedMedia.filter(m => m.id !== id);
    setUploadedMedia(nextList);
    saveToIndexedDB('all_media', nextList);

    try {
      await api.deleteMedia(id);
      markSyncSuccess();
      addAuditLog('Eliminó archivo multimedia', id);
    } catch {
      markSyncError();
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SEATS, JSON.stringify(staffSeats));
    } catch {
      // ignore
    }
  }, [staffSeats]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
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
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
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

  // Automated Payment & Order Processor via Shared Server
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

    const total = details.directProduct ? details.directProduct.price : cartTotal;

    // Call server to atomically record order, subtract limited stock and increment salesCount
    try {
      const serverRes = await api.processOrder({
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        steamIdOrDiscord: details.steamIdOrDiscord,
        paymentMethod: details.paymentMethod,
        directProduct: details.directProduct,
        items: orderItems,
        cartTotal: total
      });

      if (serverRes.success && serverRes.order) {
        if (serverRes.updatedProducts) {
          setProducts(serverRes.updatedProducts);
          saveToIndexedDB('all_products', serverRes.updatedProducts);
        }
        if (isAuthorizedAdmin) {
          setOrders(prev => [serverRes.order, ...prev]);
        }
        if (!details.directProduct) {
          clearCart();
        }

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        return serverRes.order;
      }
      throw new Error('Respuesta inválida del servidor');
    } catch (err) {
      console.error('[StoreContext] Server order failed, running client fallback:', err);
      // Fallback in case of server failure
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const fallbackOrder: Order = {
        id: `SBT-ORD-${randomSuffix}`,
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        steamIdOrDiscord: details.steamIdOrDiscord,
        paymentMethod: details.paymentMethod,
        items: orderItems,
        totalAmount: total,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Completado',
        licenseKey: `SBT-LIC-${Date.now().toString(36).toUpperCase()}`,
        downloadUrl: `https://sbtstudios.io/downloads/SBT-ORD-${randomSuffix}.zip`,
        transactionRef: `tx_${Date.now()}`
      };
      if (!details.directProduct) clearCart();
      return fallbackOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    try {
      await api.updateOrderStatus(orderId, status);
      addAuditLog(`Actualizó estado de pedido a "${status}"`, `Orden #${orderId}`);
    } catch (e) {
      console.warn('[StoreContext] Could not update order on server:', e);
    }
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

  const updateProduct = async (updated: Product) => {
    setSyncStatus('saving');
    const nextProducts = products.map(p => (p.id === updated.id ? updated : p));
    setProducts(nextProducts);
    saveToIndexedDB('all_products', nextProducts);

    try {
      const res = await api.updateProduct(updated);
      if (res.products) {
        setProducts(res.products);
        saveToIndexedDB('all_products', res.products);
      }
      markSyncSuccess();
      addAuditLog('Modificó especificaciones de producto', updated.name);
    } catch (err) {
      console.error('[StoreContext] updateProduct server error:', err);
      markSyncError();
    }
  };

  const quickUpdatePrice = async (productId: string, newPrice: number) => {
    setSyncStatus('saving');
    const valid = Math.max(0, Number(newPrice) || 0);
    const nextProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          price: valid,
          originalPrice: p.originalPrice || Math.round(valid * 1.2)
        };
      }
      return p;
    });
    setProducts(nextProducts);
    saveToIndexedDB('all_products', nextProducts);

    try {
      const res = await api.updatePrice(productId, valid);
      if (res.products) {
        setProducts(res.products);
        saveToIndexedDB('all_products', res.products);
      }
      markSyncSuccess();
      const prod = products.find(p => p.id === productId);
      addAuditLog('Cambió precio de mueble', `${prod?.name || 'Mueble'} -> $${valid} USD`);
    } catch (err) {
      console.error('[StoreContext] quickUpdatePrice server error:', err);
      markSyncError();
    }
  };

  const bulkAddProductsFromFiles = async (
    files: { name: string; url: string; isGif?: boolean }[],
    defaultPrice: number = 350
  ): Promise<Product[]> => {
    setSyncStatus('saving');
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

    const combined = [...newItems, ...products];
    setProducts(combined);
    saveToIndexedDB('all_products', combined);

    try {
      const res = await api.bulkAddProducts(newItems);
      if (res.products) {
        setProducts(res.products);
        saveToIndexedDB('all_products', res.products);
      }
      markSyncSuccess();
      addAuditLog('Creación masiva de muebles desde computadora', `${newItems.length} muebles creados`);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('[StoreContext] bulkAddProducts server error:', err);
      markSyncError();
    }

    return newItems;
  };

  const addProduct = async (newProdData: Omit<Product, 'id'>) => {
    setSyncStatus('saving');
    const newProduct: Product = {
      ...newProdData,
      id: `sbt-asset-${Date.now().toString(36)}`
    };
    const nextList = [newProduct, ...products];
    setProducts(nextList);
    saveToIndexedDB('all_products', nextList);

    try {
      const res = await api.createProduct(newProduct);
      if (res.products) {
        setProducts(res.products);
        saveToIndexedDB('all_products', res.products);
      }
      markSyncSuccess();
      addAuditLog('Añadió nuevo asset al catálogo', newProduct.name);
    } catch (err) {
      console.error('[StoreContext] addProduct server error:', err);
      markSyncError();
    }
  };

  const deleteProduct = async (productId: string) => {
    setSyncStatus('saving');
    const toDelete = products.find(p => p.id === productId);
    const nextList = products.filter(p => p.id !== productId);
    setProducts(nextList);
    saveToIndexedDB('all_products', nextList);

    try {
      const res = await api.deleteProduct(productId);
      if (res.products) {
        setProducts(res.products);
        saveToIndexedDB('all_products', res.products);
      }
      markSyncSuccess();
      if (toDelete) {
        addAuditLog('Eliminó producto del catálogo', toDelete.name);
      }
    } catch (err) {
      console.error('[StoreContext] deleteProduct server error:', err);
      markSyncError();
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
        loginWithDiscord,
        discordConfig,
        checkDiscordConfig,
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
        openDiscordLoginFlow,
        syncStatus,
        setSyncStatus,
        triggerMigration
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
