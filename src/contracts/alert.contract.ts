// Typed Alerts & Advisory Contract for AgroMind AI
import type { AlertItem } from '../types';

export interface CreateAlertPayload {
  category: AlertItem['category'];
  categoryLabel: string;
  titleEn: string;
  titleGu: string;
  severity: AlertItem['severity'];
  severityColor: string;
  time: string;
  descriptionEn: string;
  descriptionGu: string;
  actionText: string;
  actionRoute: string;
  farmerId?: string; // Optional: null = cluster broadcast
}

export interface IAlertService {
  getAlerts(): Promise<AlertItem[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  toggleRead(id: string): Promise<void>;
  addAlert(alert: CreateAlertPayload): Promise<AlertItem>;
  deleteAlert(id: string): Promise<void>;
  getUnreadCount(): number;
  subscribeToAlerts(callback: (alerts: AlertItem[]) => void): () => void;
}
