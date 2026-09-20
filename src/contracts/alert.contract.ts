// Typed Alerts & Advisory Contract for AgroMind AI
import type { AlertItem, AlertPriority, AlertSource, AlertStatus, AlertType } from '../types';

export interface CreateAlertPayload {
  key?: string;
  type?: AlertType;
  category?: AlertItem['category'];
  categoryLabel?: string;
  titleEn: string;
  titleGu?: string;
  titleHi?: string;
  title?: string;
  severity?: AlertPriority;
  priority?: AlertPriority;
  severityColor?: string;
  time?: string;
  descriptionEn: string;
  descriptionGu?: string;
  descriptionHi?: string;
  message?: string;
  actionText?: string;
  actionRoute?: string;
  farmerId?: string; // Optional: null = cluster broadcast
  source?: AlertSource;
  status?: AlertStatus;
  expiresAt?: string;
  plotId?: string;
  relatedCropId?: string;
  dataValues?: Record<string, any>;
}

export interface AlertSummary {
  totalCount: number;
  activeCount: number;
  criticalCount: number;
  unreadCount: number;
}

export interface IAlertService {
  getAlerts(): AlertItem[];
  getActiveAlerts(): AlertItem[];
  evaluateAllAlerts(): Promise<AlertItem[]>;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  resolveAlert(id: string): void;
  expireOldAlerts(): void;
  toggleRead(id: string): void;
  addAlert(alert: CreateAlertPayload): AlertItem;
  deleteAlert(id: string): void;
  getUnreadCount(): number;
  getAlertSummary(): AlertSummary;
  subscribeToAlerts(callback: (alerts: AlertItem[]) => void): () => void;
}
