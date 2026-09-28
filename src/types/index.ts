export type ProductCategory = 'furniture' | 'ui' | 'rp';

export interface ProductMediaItem {
  id: string;
  type: 'image' | 'gif' | 'video';
  label: string; // Subtítulo mostrado bajo la miniatura (ej: 'Vista Principal', 'Ángulo Isométrico', 'Detalle de Texturas')
  url: string;
  previewUrl?: string;
}

export interface UploadedMediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'gif';
  sizeFormatted?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  image: string;
  gifUrl?: string;
  youtubeUrl?: string;
  gallery: string[];
  mediaGallery?: ProductMediaItem[];
  unturnedIds: string[];
  unityVersion: string;
  modType: 'Barricade' | 'Structure' | 'UI Skin' | 'RP Item' | 'Bundle';
  stockType: 'unlimited' | 'limited';
  stockCount?: number;
  rating: number;
  salesCount: number;
  features: string[];
  downloadFileName: string;
  tags: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DiscordProfile {
  id: string;
  username: string;
  discriminator?: string;
  avatar: string;
  isAuthorizedAdmin: boolean;
  linkedAt: string;
}

export type PaymentMethod = 'card' | 'paypal' | 'crypto' | 'steam_wallet';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  steamIdOrDiscord: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  totalAmount: number;
  date: string;
  status: 'Completado' | 'En Proceso' | 'Descargado' | 'Reembolsado';
  licenseKey: string;
  downloadUrl: string;
  transactionRef: string;
}

export interface StaffWorkItem {
  id: string;
  title: string;
  role: string;
  year: string;
  description: string;
  image: string;
  category: string;
}

export interface StaffSeat {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  pin: string;
  lastActive: string;
  permissions: string[];
  bio?: string;
  specialty?: string;
  steamUrl?: string;
  redditUrl?: string;
  steamUsername?: string;
  redditUsername?: string;
  works?: StaffWorkItem[];
}

export interface StudioAuditLog {
  id: string;
  staffName: string;
  action: string;
  timestamp: string;
  target: string;
}

export type Currency = 'USD' | 'EUR' | 'ARS' | 'MXN';
