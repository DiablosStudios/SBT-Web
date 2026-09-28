/**
 * IndexedDB + Safe Storage Helper for SBT Studios
 * Solves browser localStorage quota limits (~5MB) by persisting
 * large files, GIFs, images, and catalog products in IndexedDB.
 */

const DB_NAME = 'sbt_studios_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

// Open or create IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

// Get item from IndexedDB
export async function getFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve((req.result as T) ?? null);
      };

      req.onerror = () => {
        console.warn(`[IndexedDB] Error reading key "${key}"`, req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Read failed for key "${key}"`, err);
    return null;
  }
}

// Save item to IndexedDB
export async function saveToIndexedDB<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => {
        resolve(true);
      };

      req.onerror = () => {
        console.warn(`[IndexedDB] Error saving key "${key}"`, req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Write failed for key "${key}"`, err);
    return false;
  }
}

// Remove item from IndexedDB
export async function removeFromIndexedDB(key: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Safe LocalStorage helpers with automatic QuotaExceededError protection
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`[Storage] LocalStorage quota exceeded or error for "${key}". Falling back to memory/IndexedDB.`, e);
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};
