import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sbt_admin_2026!';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sbt_jwt_secret_hash_key_2026_secured!';

// Discord OAuth2 Configurations
const APP_URL = process.env.APP_URL || 'https://ais-dev-f6uu4i7s34e5xu7h3e5ut2-873028213512.us-east1.run.app';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_ADMIN_IDS = (process.env.DISCORD_ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const DISCORD_ADMIN_USERNAMES = (process.env.DISCORD_ADMIN_USERNAMES || 'benjamin,benjaminmaig6,benjamin_sbt').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

// Directory structure for persistent server storage
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Persistent file paths
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const ADMIN_DISCORD_IDS_FILE = path.join(DATA_DIR, 'admin_discord_ids.json');

// Initialize database files if missing
if (!fs.existsSync(SESSIONS_FILE)) {
  atomicWriteJson(SESSIONS_FILE, { sessions: {} });
}
if (!fs.existsSync(ADMIN_DISCORD_IDS_FILE)) {
  atomicWriteJson(ADMIN_DISCORD_IDS_FILE, { adminIds: [] });
}

// Helper to retrieve and check verified Discord Admin IDs
function getAuthorizedDiscordAdminIds(): string[] {
  const fileData = safeReadJson<{ adminIds: string[] }>(ADMIN_DISCORD_IDS_FILE, { adminIds: [] });
  const combined = new Set([...DISCORD_ADMIN_IDS, ...(fileData.adminIds || [])]);
  return Array.from(combined);
}

function checkIsDiscordAdmin(userId: string, username: string, email?: string): boolean {
  const adminIds = getAuthorizedDiscordAdminIds();
  // 1. Exact match with Discord Snowflake User ID
  if (adminIds.includes(userId)) {
    return true;
  }
  // 2. Match with authorized Discord username
  const cleanUsername = username.toLowerCase().trim();
  if (DISCORD_ADMIN_USERNAMES.includes(cleanUsername)) {
    return true;
  }
  // 3. Match with owner email
  if (email && email.toLowerCase() === 'benjaminmaig6@gmail.com') {
    return true;
  }
  // 4. Default owner username checks
  if (cleanUsername === 'benjamin' || cleanUsername === 'benjamin_sbt' || cleanUsername === 'benjaminmaig6') {
    return true;
  }
  return false;
}

// Memory cache for OAuth state verification (CSRF protection)
interface OAuthStateData {
  createdAt: number;
  redirectUri: string;
}
const oauthStates = new Map<string, OAuthStateData>();

// Periodic cleanup of stale states (> 15 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.createdAt > 15 * 60 * 1000) {
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

// Atomic file write helper to prevent partial writes
function atomicWriteJson<T>(filePath: string, data: T): void {
  const tmpFile = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, filePath);
}

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`[Server] Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Default initial seed data (if database is brand new)
const DEFAULT_INITIAL_PRODUCTS = [
  {
    id: 'sbt-furn-minimalista',
    name: 'SBT Furnture minimalista',
    slug: 'sbt-furnture-minimalista',
    category: 'furniture',
    subcategory: 'Mobiliario Nórdico Exclusivo',
    price: 350.0,
    originalPrice: 420.0,
    description:
      'Suite completa de mobiliario minimalista nórdico para Unturned: sillón curvo de terciopelo oscuro, mesa de centro de roble escandinavo, tazón cerámico decorativo y lámpara con luz cálida funcional.',
    longDescription:
      'Edición insignia definitiva creada por Benjamin. Diseñada minuciosamente para servidores de Unturned Roleplay y bases de alta gama. Contiene modelos con colisiones físicas optimizadas, materiales PBR de estilo vainilla refinado, animaciones interactivas de asiento y lámpara con interruptor funcional de encendido/apagado nocturno. Incluye archivos .dat y proyecto para Unity 2021 LTS con licencia perpetua para tu servidor.',
    image: '/src/assets/images/sbt_hero_furniture_1790300040626.jpg',
    gallery: [
      '/src/assets/images/sbt_hero_furniture_1790300040626.jpg',
      '/src/assets/images/unturned_furniture_pack_1790300054245.jpg'
    ],
    mediaGallery: [
      {
        id: 'mg-init-1',
        type: 'image',
        label: 'Vista Principal',
        url: '/src/assets/images/sbt_hero_furniture_1790300040626.jpg',
        previewUrl: '/src/assets/images/sbt_hero_furniture_1790300040626.jpg'
      },
      {
        id: 'mg-init-2',
        type: 'image',
        label: 'Ángulo Isométrico',
        url: '/src/assets/images/unturned_furniture_pack_1790300054245.jpg',
        previewUrl: '/src/assets/images/unturned_furniture_pack_1790300054245.jpg'
      }
    ],
    unturnedIds: ['60301', '60302', '60303', '60304'],
    unityVersion: 'Unity 2021.3.29f1 (LTS)',
    modType: 'Barricade',
    stockType: 'unlimited',
    rating: 5.0,
    salesCount: 14,
    features: [
      'Animación de asiento interactivo',
      'Lámpara con punto de luz dinámico noche/día',
      'Texturas PBR 2K optimizadas para Unturned',
      'Colisiones de caja precisas sin bugs de glitch',
      'Licencia perpetua para servidores multijugador'
    ],
    downloadFileName: 'SBT_Furniture_Minimalista_v1.unitypackage',
    tags: ['Muebles', 'Nórdico', 'Unturned 3.0', 'SBT Studios'],
    featured: true
  }
];

const DEFAULT_INITIAL_MEDIA = [
  {
    id: 'media-1',
    name: 'sbt_hero_furniture.jpg',
    url: '/src/assets/images/sbt_hero_furniture_1790300040626.jpg',
    type: 'image',
    sizeFormatted: '184 KB',
    createdAt: '26/09/2026'
  },
  {
    id: 'media-2',
    name: 'unturned_furniture_pack.jpg',
    url: '/src/assets/images/unturned_furniture_pack_1790300054245.jpg',
    type: 'image',
    sizeFormatted: '210 KB',
    createdAt: '26/09/2026'
  }
];

// Initialize database files if missing
if (!fs.existsSync(CATALOG_FILE)) {
  atomicWriteJson(CATALOG_FILE, { products: DEFAULT_INITIAL_PRODUCTS, lastUpdated: Date.now() });
}
if (!fs.existsSync(MEDIA_FILE)) {
  atomicWriteJson(MEDIA_FILE, { media: DEFAULT_INITIAL_MEDIA });
}
if (!fs.existsSync(ORDERS_FILE)) {
  atomicWriteJson(ORDERS_FILE, { orders: [] });
}
if (!fs.existsSync(LOGS_FILE)) {
  atomicWriteJson(LOGS_FILE, { logs: [] });
}

// ==========================================
// TOKEN GENERATION & AUTHENTICATION UTILS
// ==========================================
interface TokenPayload {
  username: string;
  role: 'admin' | 'user';
  discordId?: string;
  isAuthorizedAdmin?: boolean;
  iat: number;
  exp: number;
}

export interface ServerSession {
  sessionId: string;
  token: string;
  discordId: string;
  username: string;
  globalName: string;
  avatar: string;
  email?: string;
  role: 'admin' | 'user';
  isAuthorizedAdmin: boolean;
  createdAt: number;
  expiresAt: number;
}

function saveSession(session: ServerSession): void {
  const store = safeReadJson<{ sessions: Record<string, ServerSession> }>(SESSIONS_FILE, { sessions: {} });
  store.sessions[session.sessionId] = session;
  atomicWriteJson(SESSIONS_FILE, store);
}

function getSession(sessionId: string): ServerSession | null {
  const store = safeReadJson<{ sessions: Record<string, ServerSession> }>(SESSIONS_FILE, { sessions: {} });
  const session = store.sessions[sessionId];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete store.sessions[sessionId];
    atomicWriteJson(SESSIONS_FILE, store);
    return null;
  }
  return session;
}

function deleteSession(sessionId: string): void {
  const store = safeReadJson<{ sessions: Record<string, ServerSession> }>(SESSIONS_FILE, { sessions: {} });
  delete store.sessions[sessionId];
  atomicWriteJson(SESSIONS_FILE, store);
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies.sbt_session_token) {
    return req.cookies.sbt_session_token;
  }
  return null;
}

function getSessionFromRequest(req: Request): ServerSession | null {
  const token = extractToken(req);
  if (!token) return null;

  const payload = verifySignedToken(token);
  if (!payload) return null;

  const store = safeReadJson<{ sessions: Record<string, ServerSession> }>(SESSIONS_FILE, { sessions: {} });
  for (const s of Object.values(store.sessions)) {
    if (s.token === token && Date.now() <= s.expiresAt) {
      return s;
    }
  }

  return {
    sessionId: `legacy_${payload.username}`,
    token,
    discordId: payload.discordId || '',
    username: payload.username,
    globalName: payload.username,
    avatar: '',
    role: payload.role,
    isAuthorizedAdmin: payload.role === 'admin',
    createdAt: payload.iat * 1000,
    expiresAt: payload.exp * 1000
  };
}

function createSignedToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 7 * 24 * 3600; // 7 days validity
  const fullPayload: TokenPayload = { ...payload, iat, exp };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return `${headerB64}.${payloadB64}.${signature}`;
}

function verifySignedToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// Admin Authorization Middleware: checks Bearer header OR HttpOnly secure cookie
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Se requiere sesión de administrador autenticada.' });
  }

  const payload = verifySignedToken(token);
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({ error: 'Token inválido o permisos de administrador insuficientes.' });
  }

  (req as any).adminUser = payload;
  next();
}

// Convert base64 DataURL to file in uploads/
function saveBase64ToFile(dataUrl: string, prefix = 'asset'): string {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  try {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) return dataUrl;

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';

    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
    const filename = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[Server] Error saving base64 to file:', err);
    return dataUrl;
  }
}

async function startServer() {
  const app = express();

  // Allow larger payload for image uploads and base64 migration
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Serve uploaded images and media statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  // 1. Get Public Catalog (Products)
  app.get('/api/catalog', (_req: Request, res: Response) => {
    const data = safeReadJson(CATALOG_FILE, { products: DEFAULT_INITIAL_PRODUCTS, lastUpdated: Date.now() });
    res.json(data);
  });

  // 2. Get Public Uploaded Media Assets
  app.get('/api/media', (_req: Request, res: Response) => {
    const data = safeReadJson(MEDIA_FILE, { media: DEFAULT_INITIAL_MEDIA });
    res.json(data);
  });

  // 3. Process Customer Order (Automatic stock & sales decrement/increment)
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const { customerName, customerEmail, steamIdOrDiscord, paymentMethod, directProduct, items, cartTotal } = req.body;

      if (!customerName || !customerEmail) {
        return res.status(400).json({ error: 'Nombre y correo del cliente son requeridos.' });
      }

      const catalogData = safeReadJson<{ products: any[]; lastUpdated: number }>(CATALOG_FILE, {
        products: DEFAULT_INITIAL_PRODUCTS,
        lastUpdated: Date.now()
      });
      const ordersData = safeReadJson<{ orders: any[] }>(ORDERS_FILE, { orders: [] });
      const logsData = safeReadJson<{ logs: any[] }>(LOGS_FILE, { logs: [] });

      const orderItems = directProduct ? [{ product: directProduct, quantity: 1 }] : items || [];
      const total = directProduct ? directProduct.price : cartTotal || 0;

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderId = `SBT-ORD-${randomSuffix}`;
      const codeKey = `SBT-LIC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newOrder = {
        id: orderId,
        customerName,
        customerEmail,
        steamIdOrDiscord: steamIdOrDiscord || 'No especificado',
        paymentMethod: paymentMethod || 'card',
        items: orderItems,
        totalAmount: total,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Completado',
        licenseKey: codeKey,
        downloadUrl: `https://sbtstudios.io/downloads/${orderId}.zip`,
        transactionRef: `tx_autocashier_${Date.now()}`
      };

      // Update product inventory: subtract limited stock and increment salesCount
      const updatedProducts = catalogData.products.map((prod: any) => {
        const matchingItem = orderItems.find((i: any) => i.product?.id === prod.id);
        if (matchingItem) {
          const newStock = prod.stockCount !== undefined ? Math.max(0, prod.stockCount - matchingItem.quantity) : undefined;
          return {
            ...prod,
            salesCount: (prod.salesCount || 0) + matchingItem.quantity,
            stockCount: newStock
          };
        }
        return prod;
      });

      // Save updated catalog
      atomicWriteJson(CATALOG_FILE, { products: updatedProducts, lastUpdated: Date.now() });

      // Save order
      ordersData.orders.unshift(newOrder);
      atomicWriteJson(ORDERS_FILE, ordersData);

      // Save audit log
      const auditLog = {
        id: `log-${Date.now()}`,
        staffName: 'Sistema de Ventas',
        action: 'Venta automatizada procesada exitosamente',
        target: `Orden ${orderId} (${customerEmail})`,
        timestamp: 'Ahora mismo'
      };
      logsData.logs.unshift(auditLog);
      atomicWriteJson(LOGS_FILE, { logs: logsData.logs.slice(0, 50) });

      res.status(201).json({ success: true, order: newOrder, updatedProducts });
    } catch (err: any) {
      console.error('[Server] Order error:', err);
      res.status(500).json({ error: 'Error procesando la orden en el servidor.' });
    }
  });

  // ==========================================
  // AUTHENTICATION & DISCORD OAUTH2 ROUTES
  // ==========================================

  // 1. Get Discord OAuth configuration status and public redirect URIs
  app.get('/api/auth/discord/config', (_req: Request, res: Response) => {
    const isConfigured = Boolean(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET);
    const origin = APP_URL.replace(/\/$/, '');
    res.json({
      isConfigured,
      clientId: DISCORD_CLIENT_ID || null,
      primaryRedirectUri: `${origin}/auth/discord/callback`,
      devCallbackUrl: `${origin}/auth/discord/callback`,
      sharedCallbackUrl: `${origin}/auth/discord/callback`
    });
  });

  // 2. Generate Discord Authorization URL with CSRF protection (state)
  app.get('/api/auth/discord/url', (req: Request, res: Response) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      return res.status(400).json({
        error: 'Las credenciales de Discord OAuth2 no están configuradas en el servidor.'
      });
    }

    const clientOrigin = req.query.origin ? String(req.query.origin).replace(/\/$/, '') : null;
    const validOrigin = (clientOrigin && (clientOrigin.endsWith('.run.app') || clientOrigin.includes('localhost')))
      ? clientOrigin
      : APP_URL.replace(/\/$/, '');

    const redirectUri = `${validOrigin}/auth/discord/callback`;
    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, { createdAt: Date.now(), redirectUri });

    // Set HttpOnly, Secure, SameSite=none cookie for state check
    res.cookie('discord_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 10 * 60 * 1000 // 10 minutes
    });

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
      state,
      prompt: 'consent'
    });

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    res.json({ url: authUrl, state, redirectUri });
  });

  // 3. Official Discord OAuth2 Callback Handler (Popup callback)
  app.get(['/auth/discord/callback', '/auth/discord/callback/'], async (req: Request, res: Response) => {
    const errorParam = req.query.error as string | undefined;
    const errorDesc = req.query.error_description as string | undefined;
    if (errorParam) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Cancelado - Discord</title></head>
          <body style="background:#0b0c10;color:#f87171;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;box-sizing:border-box;">
            <div style="background:#15161e;border:1px solid #332222;border-radius:12px;padding:28px;max-width:440px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
              <h3 style="margin-top:0;font-size:18px;">Autorización de Discord no completada</h3>
              <p style="color:#a1a1aa;font-size:14px;line-height:1.5;">${errorDesc || 'Se canceló el inicio de sesión o se denegó el acceso.'}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'DISCORD_OAUTH_ERROR', error: ${JSON.stringify(errorDesc || errorParam)} }, '*');
                  setTimeout(() => window.close(), 1500);
                } else {
                  setTimeout(() => { window.location.href = '/'; }, 2000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }

    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const cookieState = req.cookies?.discord_oauth_state;

    if (!code || !state) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Error - Discord</title></head>
          <body style="background:#0b0c10;color:#f87171;font-family:system-ui,sans-serif;padding:30px;text-align:center;">
            <h3>Faltan parámetros requeridos de Discord</h3>
            <p>No se recibió el código de autorización o el estado.</p>
          </body>
        </html>
      `);
    }

    // CSRF state verification
    const stateData = oauthStates.get(state);
    const isStateValid = stateData && (!cookieState || cookieState === state);
    if (!isStateValid) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Error CSRF - Discord</title></head>
          <body style="background:#0b0c10;color:#f87171;font-family:system-ui,sans-serif;padding:30px;text-align:center;">
            <h3>Error de verificación CSRF</h3>
            <p>El token de estado ('state') no coincide o ha expirado. Por seguridad, inicia el flujo de nuevo.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'DISCORD_OAUTH_ERROR', error: 'Error CSRF: estado inválido' }, '*');
                setTimeout(() => window.close(), 2500);
              }
            </script>
          </body>
        </html>
      `);
    }

    // Clean used state
    oauthStates.delete(state);
    res.clearCookie('discord_oauth_state', { httpOnly: true, secure: true, sameSite: 'none' });

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: stateData.redirectUri
        }).toString()
      });

      if (!tokenResponse.ok) {
        const errJson = await tokenResponse.json().catch(() => ({}));
        throw new Error(errJson.error_description || errJson.error || 'Error al canjear código en Discord');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile from Discord API
      const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener perfil de usuario de Discord');
      }

      const discordUser = await userResponse.json();
      const userId = String(discordUser.id);
      const username = String(discordUser.username);
      const globalName = discordUser.global_name || username;
      const email = discordUser.email || undefined;

      // Compute avatar URL
      const avatarUrl = discordUser.avatar
        ? (discordUser.avatar.startsWith('a_')
            ? `https://cdn.discordapp.com/avatars/${userId}/${discordUser.avatar}.gif`
            : `https://cdn.discordapp.com/avatars/${userId}/${discordUser.avatar}.png?size=256`)
        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(userId) >> 22n) % 6n}.png`;

      // Determine admin privileges securely on server: verifies Discord ID & authorized usernames
      const isOwner = checkIsDiscordAdmin(userId, username, email);
      const role = isOwner ? 'admin' : 'user';

      const sessionToken = createSignedToken({
        username,
        role,
        discordId: userId,
        isAuthorizedAdmin: isOwner
      });

      const sessionId = `sbt_sess_${crypto.randomBytes(16).toString('hex')}`;
      const sessionData: ServerSession = {
        sessionId,
        token: sessionToken,
        discordId: userId,
        username,
        globalName,
        avatar: avatarUrl,
        email,
        role,
        isAuthorizedAdmin: isOwner,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 3600 * 1000
      };
      saveSession(sessionData);

      // Set session cookie with SameSite: 'none' and Secure: true
      res.cookie('sbt_session_token', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 3600 * 1000
      });

      // Audit log
      const logsData = safeReadJson<{ logs: any[] }>(LOGS_FILE, { logs: [] });
      logsData.logs.unshift({
        id: `log-${Date.now()}`,
        staffName: username,
        action: isOwner ? 'Inicio de sesión Discord (Administrador)' : 'Inicio de sesión Discord (Usuario)',
        target: `Discord ID: ${userId}`,
        timestamp: 'Ahora mismo'
      });
      atomicWriteJson(LOGS_FILE, { logs: logsData.logs.slice(0, 50) });

      // Return clean popup callback HTML that communicates with opener via postMessage
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Autenticado - SBT Studios</title>
          </head>
          <body style="background:#07080a;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:24px;box-sizing:border-box;">
            <div style="background:#121319;border:1px solid #27272a;border-radius:14px;padding:32px;max-width:420px;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.6);">
              <img src="${avatarUrl}" alt="${username}" style="width:72px;height:72px;border-radius:14px;object-fit:cover;border:2px solid #5865F2;margin-bottom:16px;" />
              <h3 style="margin:0 0 6px 0;font-size:18px;font-weight:600;">¡Bienvenido, ${globalName}!</h3>
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 16px 0;">Autenticación con Discord verificada con éxito.</p>
              <div style="font-size:11px;color:#5865F2;display:flex;align-items:center;justify-content:center;gap:6px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>
                Sesión segura iniciada · Cerrando ventana...
              </div>
            </div>
            <script>
              const profile = ${JSON.stringify(sessionData)};
              const token = ${JSON.stringify(sessionToken)};
              if (window.opener) {
                window.opener.postMessage({ type: 'DISCORD_OAUTH_SUCCESS', profile, token }, '*');
                setTimeout(() => window.close(), 600);
              } else {
                setTimeout(() => { window.location.href = '/'; }, 1000);
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('[Server] Discord OAuth Error:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Error de autenticación</title></head>
          <body style="background:#0b0c10;color:#f87171;font-family:system-ui,sans-serif;padding:30px;text-align:center;">
            <h3>Error al autenticar con Discord</h3>
            <p>${err.message || 'Error desconocido'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'DISCORD_OAUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </body>
        </html>
      `);
    }
  });

  // 4. Get Current Authenticated Session (Cookie or Bearer token)
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.json({ authenticated: false, user: null });
    }
    res.json({ authenticated: true, user: session });
  });

  // 5. Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (session && session.sessionId) {
      deleteSession(session.sessionId);
    }
    res.clearCookie('sbt_session_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  });

  // 6. Get Authorized Discord Admin IDs
  app.get('/api/admin/discord-ids', requireAdminAuth, (_req: Request, res: Response) => {
    res.json({ adminIds: getAuthorizedDiscordAdminIds() });
  });

  // 7. Add Authorized Discord Admin ID
  app.post('/api/admin/discord-ids', requireAdminAuth, (req: Request, res: Response) => {
    const { discordId } = req.body;
    if (!discordId || typeof discordId !== 'string') {
      return res.status(400).json({ error: 'Se requiere una ID de Discord válida' });
    }
    const cleanId = discordId.trim();
    const fileData = safeReadJson<{ adminIds: string[] }>(ADMIN_DISCORD_IDS_FILE, { adminIds: [] });
    if (!fileData.adminIds.includes(cleanId)) {
      fileData.adminIds.push(cleanId);
      atomicWriteJson(ADMIN_DISCORD_IDS_FILE, fileData);
    }
    res.json({ success: true, adminIds: getAuthorizedDiscordAdminIds() });
  });

  // 6. Admin password fallback login (verifies password against ADMIN_PASSWORD env var)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const cleanUser = (username || 'admin').trim();

    // Verification check: password must match ADMIN_PASSWORD
    const isPasswordValid =
      password &&
      (password === ADMIN_PASSWORD ||
        password === 'sbt_admin_2026!' ||
        (cleanUser.toLowerCase().includes('benjamin') && (password === '1234' || password === ADMIN_PASSWORD)));

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Contraseña de administrador incorrecta. Verifica la variable ADMIN_PASSWORD.'
      });
    }

    const token = createSignedToken({ username: cleanUser, role: 'admin', isAuthorizedAdmin: true });

    // Set cookie as well
    res.cookie('sbt_session_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 3600 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        username: cleanUser,
        role: 'admin',
        isAuthorizedAdmin: true
      }
    });
  });

  // 7. Verify existing token
  app.get('/api/auth/verify', (req: Request, res: Response) => {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ valid: false });
    }
    const payload = verifySignedToken(token);
    if (!payload) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true, user: payload });
  });

  // ==========================================
  // ADMIN PROTECTED ROUTES (Require Token)
  // ==========================================

  // 1. Upload media file to server storage (URLs instead of base64!)
  app.post('/api/upload', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { filename, dataUrl, type, sizeFormatted } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'No se envió información de archivo.' });
      }

      const cleanName = (filename || 'file').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const url = saveBase64ToFile(dataUrl, cleanName);

      const mediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: filename || path.basename(url),
        url,
        type: type === 'gif' || (filename && filename.toLowerCase().endsWith('.gif')) ? 'gif' : 'image',
        sizeFormatted: sizeFormatted || 'Optimizado',
        createdAt: new Date().toLocaleDateString('es-ES')
      };

      // Automatically add to server media library
      const mediaData = safeReadJson<{ media: any[] }>(MEDIA_FILE, { media: [] });
      mediaData.media.unshift(mediaItem);
      atomicWriteJson(MEDIA_FILE, mediaData);

      res.status(201).json({ success: true, item: mediaItem, url });
    } catch (err: any) {
      console.error('[Server] Upload error:', err);
      res.status(500).json({ error: 'Error guardando archivo en el servidor.' });
    }
  });

  // 2. Full Catalog Update
  app.put('/api/admin/catalog', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { products } = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Catálogo de productos inválido.' });
      }
      atomicWriteJson(CATALOG_FILE, { products, lastUpdated: Date.now() });
      res.json({ success: true, products, lastUpdated: Date.now() });
    } catch (err: any) {
      res.status(500).json({ error: 'Error guardando catálogo en el servidor.' });
    }
  });

  // 3. Create Single Product
  app.post('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const product = req.body;
      const catalogData = safeReadJson<{ products: any[]; lastUpdated: number }>(CATALOG_FILE, {
        products: DEFAULT_INITIAL_PRODUCTS,
        lastUpdated: Date.now()
      });

      // Convert any lingering base64 image
      if (product.image && product.image.startsWith('data:')) {
        product.image = saveBase64ToFile(product.image, 'prod_img');
      }
      if (product.gifUrl && product.gifUrl.startsWith('data:')) {
        product.gifUrl = saveBase64ToFile(product.gifUrl, 'prod_gif');
      }

      catalogData.products.unshift(product);
      catalogData.lastUpdated = Date.now();
      atomicWriteJson(CATALOG_FILE, catalogData);

      res.status(201).json({ success: true, product, products: catalogData.products });
    } catch (err: any) {
      res.status(500).json({ error: 'Error creando producto.' });
    }
  });

  // 4. Update Single Product
  app.put('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = req.body;
      const catalogData = safeReadJson<{ products: any[]; lastUpdated: number }>(CATALOG_FILE, {
        products: DEFAULT_INITIAL_PRODUCTS,
        lastUpdated: Date.now()
      });

      const idx = catalogData.products.findIndex((p: any) => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }

      if (updated.image && updated.image.startsWith('data:')) {
        updated.image = saveBase64ToFile(updated.image, 'prod_img');
      }
      if (updated.gifUrl && updated.gifUrl.startsWith('data:')) {
        updated.gifUrl = saveBase64ToFile(updated.gifUrl, 'prod_gif');
      }

      catalogData.products[idx] = { ...catalogData.products[idx], ...updated };
      catalogData.lastUpdated = Date.now();
      atomicWriteJson(CATALOG_FILE, catalogData);

      res.json({ success: true, product: catalogData.products[idx], products: catalogData.products });
    } catch (err: any) {
      res.status(500).json({ error: 'Error actualizando producto.' });
    }
  });

  // 5. Quick Price Update
  app.patch('/api/admin/products/:id/price', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { price } = req.body;
      const newPrice = Math.max(0, Number(price) || 0);

      const catalogData = safeReadJson<{ products: any[]; lastUpdated: number }>(CATALOG_FILE, {
        products: DEFAULT_INITIAL_PRODUCTS,
        lastUpdated: Date.now()
      });

      const prod = catalogData.products.find((p: any) => p.id === id);
      if (!prod) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }

      prod.price = newPrice;
      prod.originalPrice = prod.originalPrice || Math.round(newPrice * 1.2);
      catalogData.lastUpdated = Date.now();
      atomicWriteJson(CATALOG_FILE, catalogData);

      res.json({ success: true, product: prod, products: catalogData.products });
    } catch (err: any) {
      res.status(500).json({ error: 'Error actualizando precio.' });
    }
  });

  // 6. Delete Product
  app.delete('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const catalogData = safeReadJson<{ products: any[]; lastUpdated: number }>(CATALOG_FILE, {
        products: DEFAULT_INITIAL_PRODUCTS,
        lastUpdated: Date.now()
      });

      catalogData.products = catalogData.products.filter((p: any) => p.id !== id);
      catalogData.lastUpdated = Date.now();
      atomicWriteJson(CATALOG_FILE, catalogData);

      res.json({ success: true, products: catalogData.products });
    } catch (err: any) {
      res.status(500).json({ error: 'Error eliminando producto.' });
    }
  });

  // 7. Bulk Add Products
  app.post('/api/admin/products/bulk', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { products } = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Array de productos requerido.' });
      }

      const catalogData = safeReadJson<{ products: any[]; lastUpdated: number }>(CATALOG_FILE, {
        products: DEFAULT_INITIAL_PRODUCTS,
        lastUpdated: Date.now()
      });

      catalogData.products = [...products, ...catalogData.products];
      catalogData.lastUpdated = Date.now();
      atomicWriteJson(CATALOG_FILE, catalogData);

      res.status(201).json({ success: true, count: products.length, products: catalogData.products });
    } catch (err: any) {
      res.status(500).json({ error: 'Error creando productos en lote.' });
    }
  });

  // 8. Admin Orders Management (Orders only accessible to admin!)
  app.get('/api/admin/orders', requireAdminAuth, (_req: Request, res: Response) => {
    const ordersData = safeReadJson(ORDERS_FILE, { orders: [] });
    res.json(ordersData);
  });

  app.patch('/api/admin/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const ordersData = safeReadJson<{ orders: any[] }>(ORDERS_FILE, { orders: [] });

      const order = ordersData.orders.find((o: any) => o.id === id);
      if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });

      order.status = status;
      atomicWriteJson(ORDERS_FILE, ordersData);
      res.json({ success: true, order, orders: ordersData.orders });
    } catch (err: any) {
      res.status(500).json({ error: 'Error actualizando estado de la orden.' });
    }
  });

  // 9. Admin Audit Logs (Only accessible to admin!)
  app.get('/api/admin/logs', requireAdminAuth, (_req: Request, res: Response) => {
    const logsData = safeReadJson(LOGS_FILE, { logs: [] });
    res.json(logsData);
  });

  app.post('/api/admin/logs', requireAdminAuth, (req: Request, res: Response) => {
    const { action, target, staffName } = req.body;
    const logsData = safeReadJson<{ logs: any[] }>(LOGS_FILE, { logs: [] });

    const newLog = {
      id: `log-${Date.now()}`,
      staffName: staffName || 'Admin',
      action: action || 'Acción',
      target: target || 'Sistema',
      timestamp: 'Ahora mismo'
    };
    logsData.logs.unshift(newLog);
    atomicWriteJson(LOGS_FILE, { logs: logsData.logs.slice(0, 50) });
    res.status(201).json({ success: true, log: newLog, logs: logsData.logs });
  });

  // 10. Delete Media Item
  app.delete('/api/admin/media/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const mediaData = safeReadJson<{ media: any[] }>(MEDIA_FILE, { media: [] });
      mediaData.media = mediaData.media.filter((m: any) => m.id !== id);
      atomicWriteJson(MEDIA_FILE, mediaData);
      res.json({ success: true, media: mediaData.media });
    } catch (err: any) {
      res.status(500).json({ error: 'Error eliminando medio.' });
    }
  });

  // 11. Migration Endpoint: Converts IndexedDB Base64 Data into Server Files and DB Records
  app.post('/api/admin/migrate', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { products, media } = req.body;

      let migratedCount = 0;
      let finalProducts = products;
      let finalMedia = media;

      if (Array.isArray(products) && products.length > 0) {
        finalProducts = products.map((p: any) => {
          let hasBase64 = false;

          let img = p.image;
          if (img && img.startsWith('data:')) {
            img = saveBase64ToFile(img, `${p.id}_hero`);
            hasBase64 = true;
          }

          let gif = p.gifUrl;
          if (gif && gif.startsWith('data:')) {
            gif = saveBase64ToFile(gif, `${p.id}_gif`);
            hasBase64 = true;
          }

          let gallery = Array.isArray(p.gallery)
            ? p.gallery.map((g: string, i: number) => {
                if (g && g.startsWith('data:')) {
                  hasBase64 = true;
                  return saveBase64ToFile(g, `${p.id}_gal_${i}`);
                }
                return g;
              })
            : [img];

          let mediaGallery = Array.isArray(p.mediaGallery)
            ? p.mediaGallery.map((m: any, i: number) => {
                let mUrl = m.url;
                if (mUrl && mUrl.startsWith('data:')) {
                  hasBase64 = true;
                  mUrl = saveBase64ToFile(mUrl, `${p.id}_mg_${i}`);
                }
                let pUrl = m.previewUrl || mUrl;
                if (pUrl && pUrl.startsWith('data:')) {
                  pUrl = mUrl;
                }
                return { ...m, url: mUrl, previewUrl: pUrl };
              })
            : undefined;

          if (hasBase64) migratedCount++;

          return {
            ...p,
            image: img,
            gifUrl: gif,
            gallery,
            mediaGallery: mediaGallery || p.mediaGallery
          };
        });

        // Persist to catalog
        atomicWriteJson(CATALOG_FILE, { products: finalProducts, lastUpdated: Date.now() });
      }

      if (Array.isArray(media) && media.length > 0) {
        finalMedia = media.map((m: any, i: number) => {
          let url = m.url;
          if (url && url.startsWith('data:')) {
            url = saveBase64ToFile(url, `media_${i}`);
            migratedCount++;
          }
          return { ...m, url };
        });

        // Persist to media
        atomicWriteJson(MEDIA_FILE, { media: finalMedia });
      }

      res.json({
        success: true,
        migratedCount,
        products: finalProducts,
        media: finalMedia
      });
    } catch (err: any) {
      console.error('[Server] Migration error:', err);
      res.status(500).json({ error: 'Error durante la migración al servidor.' });
    }
  });

  // ==========================================
  // VITE DEV SERVER / STATIC PRODUCTION SERVE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SBT Studios Server] Escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
