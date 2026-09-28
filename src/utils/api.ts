import { Product, Order, StudioAuditLog, UploadedMediaItem } from '../types';
import { safeLocalStorage } from './storage';

const TOKEN_KEY = 'sbt_admin_bearer_token_v1';

export const authStorage = {
  getToken: (): string | null => {
    return safeLocalStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    safeLocalStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    safeLocalStorage.removeItem(TOKEN_KEY);
  }
};

function getAuthHeaders(): HeadersInit {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // ------------------------------------
  // PUBLIC ENDPOINTS
  // ------------------------------------
  async getCatalog(): Promise<{ products: Product[]; lastUpdated: number }> {
    const res = await fetch('/api/catalog', { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener catálogo del servidor');
    return res.json();
  },

  async getMedia(): Promise<{ media: UploadedMediaItem[] }> {
    const res = await fetch('/api/media', { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener archivos multimedia del servidor');
    return res.json();
  },

  async processOrder(orderPayload: any): Promise<{ success: boolean; order: Order; updatedProducts: Product[] }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderPayload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al procesar compra en el servidor');
    }
    return res.json();
  },

  // ------------------------------------
  // AUTHENTICATION & DISCORD OAUTH2
  // ------------------------------------
  async getDiscordConfig(): Promise<{
    isConfigured: boolean;
    clientId: string | null;
    primaryRedirectUri: string;
    devCallbackUrl: string;
    sharedCallbackUrl: string;
  }> {
    const res = await fetch('/api/auth/discord/config', { credentials: 'include' });
    if (!res.ok) throw new Error('Error al verificar configuración de Discord');
    return res.json();
  },

  async getDiscordAuthUrl(origin?: string): Promise<{ url: string; state: string; redirectUri: string }> {
    const url = new URL('/api/auth/discord/url', window.location.href);
    if (origin) {
      url.searchParams.set('origin', origin);
    }
    const res = await fetch(url.toString(), { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al generar URL de autorización de Discord');
    }
    return data;
  },

  async getMe(): Promise<{ authenticated: boolean; user?: any }> {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include'
      });
      if (!res.ok) return { authenticated: false };
      return res.json();
    } catch {
      return { authenticated: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } finally {
      authStorage.removeToken();
    }
  },

  async loginAdmin(username: string, password?: string): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(data.error || 'Autenticación denegada: Contraseña incorrecta.');
    }
    authStorage.setToken(data.token);
    return data;
  },

  async verifyToken(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/verify', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      return Boolean(data.valid);
    } catch {
      return false;
    }
  },

  // ------------------------------------
  // ADMIN FILE UPLOADS (Returns real URL)
  // ------------------------------------
  async uploadFile(payload: {
    filename: string;
    dataUrl: string;
    type: 'image' | 'gif';
    sizeFormatted?: string;
  }): Promise<{ item: UploadedMediaItem; url: string }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al subir archivo al servidor');
    }
    return res.json();
  },

  // ------------------------------------
  // ADMIN CATALOG CRUD
  // ------------------------------------
  async saveFullCatalog(products: Product[]): Promise<{ products: Product[] }> {
    const res = await fetch('/api/admin/catalog', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error('Error al sincronizar catálogo con el servidor');
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<{ product: Product; products: Product[] }> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Error al crear producto en el servidor');
    return res.json();
  },

  async updateProduct(product: Product): Promise<{ product: Product; products: Product[] }> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Error al actualizar producto en el servidor');
    return res.json();
  },

  async updatePrice(productId: string, price: number): Promise<{ product: Product; products: Product[] }> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/price`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ price })
    });
    if (!res.ok) throw new Error('Error al actualizar precio en el servidor');
    return res.json();
  },

  async deleteProduct(productId: string): Promise<{ products: Product[] }> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar producto del servidor');
    return res.json();
  },

  async bulkAddProducts(products: Product[]): Promise<{ products: Product[] }> {
    const res = await fetch('/api/admin/products/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error('Error en creación masiva en el servidor');
    return res.json();
  },

  async deleteMedia(id: string): Promise<{ media: UploadedMediaItem[] }> {
    const res = await fetch(`/api/admin/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar archivo multimedia en el servidor');
    return res.json();
  },

  // ------------------------------------
  // ADMIN ORDERS & LOGS (Only readable by admin)
  // ------------------------------------
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/admin/orders', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order[]> {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Error actualizando pedido');
    const data = await res.json();
    return data.orders || [];
  },

  async getLogs(): Promise<StudioAuditLog[]> {
    const res = await fetch('/api/admin/logs', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  },

  async addLog(action: string, target: string, staffName?: string): Promise<void> {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, target, staffName })
      });
    } catch {
      // ignore
    }
  },

  // ------------------------------------
  // AUTOMATIC INDEXEDDB TO SERVER MIGRATION
  // ------------------------------------
  async migrateData(products: Product[], media: UploadedMediaItem[]): Promise<{
    success: boolean;
    migratedCount: number;
    products: Product[];
    media: UploadedMediaItem[];
  }> {
    const res = await fetch('/api/admin/migrate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ products, media })
    });
    if (!res.ok) throw new Error('Error en migración al servidor');
    return res.json();
  }
};
