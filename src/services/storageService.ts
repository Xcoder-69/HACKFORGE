// Reactive Storage Service for AgroMind AI
// Provides persistent localStorage with typed access, error safety, and event-driven reactive subscriptions

export const STORAGE_KEYS = {
  USER: 'agromind_user',
  TOKEN: 'agromind_token',
  FARM: 'agromind_farm',
  PLOTS: 'agromind_plots',
  EXPENSES: 'agromind_expenses',
  REVENUE: 'agromind_revenue',
  SCANS: 'agromind_scans',
  ALERTS: 'agromind_alerts',
  CHAT: 'agromind_chat',
  WEATHER_CACHE: 'agromind_weather_cache',
  ADMIN_FARMERS: 'agromind_admin_farmers',
  LOCATION: 'agromind_saved_location',
  INITIALIZED: 'agromind_initialized_v2',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

class StorageService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && this.listeners.has(event.key)) {
          const newVal = event.newValue ? JSON.parse(event.newValue) : null;
          this.notifySubscribers(event.key, newVal);
        }
      });
    }
  }

  get<T>(key: StorageKey | string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (err) {
      console.warn(`[StorageService] Error reading key "${key}":`, err);
      return defaultValue;
    }
  }

  set<T>(key: StorageKey | string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifySubscribers(key, value);
      return true;
    } catch (err) {
      console.error(`[StorageService] Error saving key "${key}":`, err);
      return false;
    }
  }

  remove(key: StorageKey | string): void {
    try {
      localStorage.removeItem(key);
      this.notifySubscribers(key, null);
    } catch (err) {
      console.warn(`[StorageService] Error removing key "${key}":`, err);
    }
  }

  subscribe<T>(key: StorageKey | string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    const set = this.listeners.get(key)!;
    set.add(callback);

    // Return un-subscriber
    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  private notifySubscribers(key: string, value: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(value);
        } catch (err) {
          console.error(`[StorageService] Callback error for key "${key}":`, err);
        }
      });
    }
  }
}

export const storageService = new StorageService();
