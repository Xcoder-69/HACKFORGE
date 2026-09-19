// Centralized Alert Service for AgroMind AI
// Synchronizes alert action center with reactive storageService (L1) and Supabase (L2)

import { AlertItem } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';

export const alertService = {
  /**
   * Retrieves all alerts from storage and synchronizes with Supabase if online
   */
  getAlerts(): AlertItem[] {
    const cached = storageService.get<AlertItem[]>(STORAGE_KEYS.ALERTS, []);

    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const remoteAlerts: AlertItem[] = data.map((row: any) => ({
              id: row.id,
              category: row.category,
              categoryLabel: row.category_label,
              titleEn: row.title_en,
              titleGu: row.title_gu,
              severity: row.severity,
              severityColor: row.severity_color,
              time: row.time_label,
              descriptionEn: row.description_en,
              descriptionGu: row.description_gu,
              actionText: row.action_text,
              actionRoute: row.action_route,
              isRead: row.is_read,
              isCompleted: row.is_completed,
            }));
            storageService.set(STORAGE_KEYS.ALERTS, remoteAlerts);
          }
        })
        .catch((err) => console.warn('[AlertService] Supabase fetchAlerts error:', err));
    }

    return cached;
  },

  /**
   * Subscribes to changes in alerts list
   */
  subscribeToAlerts(callback: (alerts: AlertItem[]) => void): () => void {
    return storageService.subscribe<AlertItem[]>(STORAGE_KEYS.ALERTS, callback);
  },

  /**
   * Marks a specific alert as read
   */
  markAsRead(id: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'UPDATE',
      recordId: id,
      payload: { is_read: true },
    });
  },

  /**
   * Marks all alerts as read
   */
  markAllAsRead(): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => ({ ...a, isRead: true }));
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    alerts.forEach((a) => {
      syncEngine.enqueue({
        tableName: 'alerts',
        operation: 'UPDATE',
        recordId: a.id,
        payload: { is_read: true },
      });
    });
  },

  /**
   * Toggles the read status of an alert
   */
  toggleRead(id: string): void {
    const alerts = this.getAlerts();
    const target = alerts.find((a) => a.id === id);
    const newStatus = target ? !target.isRead : true;
    const updated = alerts.map((a) => (a.id === id ? { ...a, isRead: newStatus } : a));
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'UPDATE',
      recordId: id,
      payload: { is_read: newStatus },
    });
  },

  /**
   * Adds a new broadcast or automatic alert
   */
  addAlert(alert: Omit<AlertItem, 'id' | 'isRead'>): AlertItem {
    const alerts = this.getAlerts();
    const newAlert: AlertItem = {
      ...alert,
      id: `alert-${Date.now()}`,
      isRead: false,
    };
    const updated = [newAlert, ...alerts];
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'INSERT',
      recordId: newAlert.id,
      userId: currentUser?.id,
      payload: {
        id: newAlert.id,
        farmer_id: currentUser?.id || null,
        category: newAlert.category,
        category_label: newAlert.categoryLabel,
        title_en: newAlert.titleEn,
        title_gu: newAlert.titleGu,
        severity: newAlert.severity,
        severity_color: newAlert.severityColor,
        time_label: newAlert.time,
        description_en: newAlert.descriptionEn,
        description_gu: newAlert.descriptionGu,
        action_text: newAlert.actionText,
        action_route: newAlert.actionRoute,
        is_read: false,
      },
    });

    return newAlert;
  },

  /**
   * Deletes an alert by ID
   */
  deleteAlert(id: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.filter((a) => a.id !== id);
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'DELETE',
      recordId: id,
      payload: { id },
    });
  },

  /**
   * Gets the count of unread alerts
   */
  getUnreadCount(): number {
    return this.getAlerts().filter((a) => !a.isRead).length;
  },
};
