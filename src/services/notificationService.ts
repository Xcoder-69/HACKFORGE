// Notification Service for AgroMind AI
// Provides temporary popup toast notifications for real application events.
// Enforces session-based deduplication so toasts NEVER repeat upon page reload or route changes.

export interface ToastItem {
  id: string;
  eventId: string;
  title: string;
  titleGu?: string;
  titleHi?: string;
  message?: string;
  messageGu?: string;
  messageHi?: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'market';
  category?: 'market' | 'weather' | 'crop' | 'disease' | 'soil' | 'advisory' | 'system';
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  actionText?: string;
  actionRoute?: string;
  durationMs?: number;
  createdAt: number;
}

export interface ShowToastOptions {
  eventId: string;
  title: string;
  titleGu?: string;
  titleHi?: string;
  message?: string;
  messageGu?: string;
  messageHi?: string;
  type?: 'info' | 'success' | 'warning' | 'alert' | 'market';
  category?: 'market' | 'weather' | 'crop' | 'disease' | 'soil' | 'advisory' | 'system';
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  actionText?: string;
  actionRoute?: string;
  durationMs?: number;
}

export interface AlertNotificationOptions {
  title: string;
  titleGu?: string;
  titleHi?: string;
  message?: string;
  messageGu?: string;
  messageHi?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  category?: 'market' | 'weather' | 'crop' | 'disease' | 'soil' | 'advisory' | string;
  type?: 'info' | 'success' | 'warning' | 'alert' | 'market';
  actionText?: string;
  actionRoute?: string;
  eventId?: string;
}

const SEEN_STORAGE_KEY = 'agromind_seen_toasts';

class NotificationService {
  private activeToasts: ToastItem[] = [];
  private listeners: Set<(toasts: ToastItem[]) => void> = new Set();
  private timers: Map<string, any> = new Map();

  private getSeenEventIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = sessionStorage.getItem(SEEN_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
      }
    } catch {
      // ignore
    }
    return new Set();
  }

  private markEventAsSeen(eventId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const seen = this.getSeenEventIds();
      seen.add(eventId);
      sessionStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(seen)));
    } catch {
      // ignore
    }
  }

  public hasSeenEvent(eventId: string): boolean {
    return this.getSeenEventIds().has(eventId);
  }

  public subscribe(callback: (toasts: ToastItem[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.activeToasts]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    const copy = [...this.activeToasts];
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.warn('[NotificationService] Listener error:', err);
      }
    });
  }

  public showToast(options: ShowToastOptions): ToastItem | null {
    // Session deduplication check
    if (this.hasSeenEvent(options.eventId)) {
      return null;
    }

    this.markEventAsSeen(options.eventId);

    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duration = options.durationMs ?? 5000;

    const newToast: ToastItem = {
      id: toastId,
      eventId: options.eventId,
      title: options.title,
      titleGu: options.titleGu,
      titleHi: options.titleHi,
      message: options.message,
      messageGu: options.messageGu,
      messageHi: options.messageHi,
      type: options.type || 'info',
      category: options.category,
      priority: options.priority,
      actionText: options.actionText,
      actionRoute: options.actionRoute,
      durationMs: duration,
      createdAt: Date.now(),
    };

    // Limit active toasts to top 2 to keep mobile view clean and uncluttered
    this.activeToasts = [newToast, ...this.activeToasts.slice(0, 1)];
    this.notify();

    // Auto-dismiss
    const timer = setTimeout(() => {
      this.dismissToast(toastId);
    }, duration);
    this.timers.set(toastId, timer);

    return newToast;
  }

  public dismissToast(id: string): void {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
    this.activeToasts = this.activeToasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this.activeToasts = [];
    this.notify();
  }

  // Convenience helper methods for standard AgroMind real-time events
  public notifyWeatherUpdated(locationName: string): void {
    const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60)); // 1 hour bucket
    this.showToast({
      eventId: `event:weather_updated:${locationName}:${hourBucket}`,
      title: 'Weather Updated',
      titleGu: 'હવામાન અપડેટ થયું',
      titleHi: 'Mausam Data Update Hua',
      message: `Live Open-Meteo conditions synchronized for ${locationName}.`,
      messageGu: `${locationName} માટે લાઈવ ઓપન-મેટિઓ હવામાન તાજું થયું.`,
      messageHi: `${locationName} ke liye live mausam sync ho gaya.`,
      type: 'info',
      actionText: 'View Weather',
      actionRoute: '/weather-soil',
    });
  }

  public notifyMarketUpdated(mandiCount: number): void {
    const dayBucket = new Date().toISOString().split('T')[0];
    this.showToast({
      eventId: `event:market_updated:${dayBucket}`,
      title: 'Market Data Updated',
      titleGu: 'બજાર ભાવ અપડેટ થયા',
      titleHi: 'Mandi Bhav Update Hue',
      message: `Synchronized ${mandiCount} APMC mandi benchmarks.`,
      messageGu: `${mandiCount} એપીએમસી માર્કેટ યાર્ડના દર તાજા થયા.`,
      messageHi: `${mandiCount} APMC mandi dar update ho gaye.`,
      type: 'info',
      actionText: 'Open Mandi',
      actionRoute: '/mandi',
    });
  }

  public notifySoilAnalysisCompleted(labOrSource: string): void {
    this.showToast({
      eventId: `event:soil_completed:${Date.now()}`,
      title: 'Soil Report Analysis Completed',
      titleGu: 'જમીન રિપોર્ટ વિશ્લેષણ પૂર્ણ',
      titleHi: 'Mitti Report Analysis Pura Hua',
      message: `Verified parameters extracted from ${labOrSource}.`,
      messageGu: `${labOrSource} માંથી જમીન તત્વો ચકાસાયા.`,
      messageHi: `${labOrSource} se mitti poshan tatva verify hue.`,
      type: 'success',
      actionText: 'View Alerts',
      actionRoute: '/alerts',
    });
  }

  public notifyCropRecUpdated(): void {
    const dayBucket = new Date().toISOString().split('T')[0];
    this.showToast({
      eventId: `event:crop_rec_updated:${dayBucket}`,
      title: 'Crop Recommendation Updated',
      titleGu: 'પાક ભલામણો અપડેટ થઈ',
      titleHi: 'Fasal Sifarish Update Hui',
      message: 'Multi-factor suitability updated with live weather & mandi rates.',
      messageGu: 'હવામાન અને બજાર ભાવ મુજબ નવીનતમ પાક ભલામણો તૈયાર છે.',
      messageHi: 'Mausam aur mandi ke hisab se nayi sifarish taiyar hai.',
      type: 'info',
      actionText: 'View Recs',
      actionRoute: '/recommendations',
    });
  }

  public notifyCropScanCompleted(crop: string, diseaseName: string): void {
    this.showToast({
      eventId: `event:scan_completed:${crop}:${Date.now()}`,
      title: 'Crop Scan Completed',
      titleGu: 'પાક સ્કેન પૂર્ણ થયું',
      titleHi: 'Fasal Scan Pura Hua',
      message: `AI diagnosis: ${diseaseName} on ${crop}.`,
      messageGu: `AI તપાસ: ${crop} પર ${diseaseName} ચકાસાયું.`,
      messageHi: `AI jaanch: ${crop} par ${diseaseName} detect hua.`,
      type: diseaseName.toLowerCase().includes('healthy') ? 'success' : 'warning',
      actionText: 'View Scan',
      actionRoute: '/ai-camera',
    });
  }

  /**
   * Dispatches rich, multilingual alert toasts with proper titles, priority badges, and contextual styling.
   */
  public notifyAlert(options: AlertNotificationOptions): void {
    const priority = (options.priority || 'Medium') as 'Critical' | 'High' | 'Medium' | 'Low';
    const category = (options.category || 'advisory').toLowerCase();
    const isMarket = category === 'market' || options.title.toLowerCase().includes('market') || options.title.toLowerCase().includes('selling');
    const isCritical = priority === 'Critical';
    const isHigh = priority === 'High';

    const toastType: ToastItem['type'] = options.type || (isMarket ? 'market' : isCritical ? 'alert' : isHigh ? 'warning' : 'info');

    this.showToast({
      eventId: options.eventId || `event:alert:${options.title}:${Date.now()}`,
      title: options.title,
      titleGu: options.titleGu || options.title,
      titleHi: options.titleHi || options.title,
      message: options.message || '',
      messageGu: options.messageGu || options.message || '',
      messageHi: options.messageHi || options.message || '',
      type: toastType,
      category: (category as any),
      priority,
      actionText: options.actionText || (isMarket ? 'Check Mandi' : 'View Advisory'),
      actionRoute: options.actionRoute || (isMarket ? '/mandi' : '/alerts'),
      durationMs: isCritical ? 6500 : 5000,
    });
  }

  /**
   * Backward-compatible alert notification method that cleanly resolves real alert content
   * rather than generating robotic 'New Alert Added' placeholders.
   */
  public notifyNewAlertAdded(
    titleOrOptions: string | AlertNotificationOptions,
    priority: string = 'Medium',
    route: string = '/alerts',
    extraMessage?: string
  ): void {
    if (typeof titleOrOptions === 'object') {
      this.notifyAlert(titleOrOptions);
      return;
    }

    const title = titleOrOptions;
    const isMarket = title.toLowerCase().includes('market') || title.toLowerCase().includes('selling') || title.toLowerCase().includes('bazaar');
    const isCritical = priority.toLowerCase() === 'critical';
    const isHigh = priority.toLowerCase() === 'high';

    this.notifyAlert({
      eventId: `event:new_alert:${title}`,
      title,
      message: extraMessage || (isMarket ? 'Favorable price window reported in APMC. Tap to inspect rates.' : 'Important agronomic advisory available for your farm.'),
      priority: priority as any,
      category: isMarket ? 'market' : 'weather',
      type: isMarket ? 'market' : isCritical ? 'alert' : isHigh ? 'warning' : 'info',
      actionText: isMarket ? 'Check Mandi' : 'View Advisory',
      actionRoute: route || (isMarket ? '/mandi' : '/alerts'),
    });
  }
}

export const notificationService = new NotificationService();
