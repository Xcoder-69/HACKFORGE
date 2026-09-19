// Typed Offline Synchronization Contract for AgroMind AI
export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface SyncQueueItem {
  id: string;
  userId?: string;
  tableName: string;
  operation: SyncOperation;
  recordId: string;
  payload: Record<string, any>;
  status: SyncStatus;
  attempts: number;
  lastError?: string;
  createdAt: number;
  syncedAt?: number;
}

export interface ISyncEngine {
  isOnline(): boolean;
  enqueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'attempts' | 'createdAt'>): void;
  getPendingItems(): SyncQueueItem[];
  flushQueue(): Promise<{ total: number; synced: number; failed: number }>;
  subscribe(callback: (pendingCount: number) => void): () => void;
  clearQueue(): void;
}
