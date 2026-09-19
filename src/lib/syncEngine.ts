// AgroMind AI Offline Synchronization Engine
// Queues offline database mutations and automatically reconciles when network is restored
import { storageService } from '../services/storageService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { ISyncEngine, SyncQueueItem, SyncOperation } from '../contracts/sync.contract';

const SYNC_STORAGE_KEY = 'agromind_sync_queue';
const MAX_ATTEMPTS = 3;

class SyncEngine implements ISyncEngine {
  private online: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<(count: number) => void> = new Set();
  private isFlushing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.online = true;
        this.flushQueue();
      });

      window.addEventListener('offline', () => {
        this.online = false;
      });
    }
  }

  isOnline(): boolean {
    return this.online;
  }

  getPendingItems(): SyncQueueItem[] {
    return storageService.get<SyncQueueItem[]>(SYNC_STORAGE_KEY, []);
  }

  enqueue(item: {
    tableName: string;
    operation: SyncOperation;
    recordId: string;
    payload: Record<string, any>;
    userId?: string;
  }): void {
    const queue = this.getPendingItems();
    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    const userId = item.userId || currentUser?.id;

    const newItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      tableName: item.tableName,
      operation: item.operation,
      recordId: item.recordId,
      payload: item.payload,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now(),
    };

    const updated = [...queue, newItem];
    storageService.set(SYNC_STORAGE_KEY, updated);
    this.notifySubscribers(updated.length);

    // If online, trigger optimistic background flush
    if (this.isOnline() && isSupabaseConfigured()) {
      this.flushQueue();
    }
  }

  async flushQueue(): Promise<{ total: number; synced: number; failed: number }> {
    if (this.isFlushing) return { total: 0, synced: 0, failed: 0 };
    if (!this.isOnline() || !isSupabaseConfigured() || !supabase) {
      return { total: this.getPendingItems().length, synced: 0, failed: 0 };
    }

    this.isFlushing = true;
    const queue = this.getPendingItems();
    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    let synced = 0;
    let failed = 0;
    const remaining: SyncQueueItem[] = [];

    for (const item of queue) {
      // Guard against syncing another farmer's queued records if user changed
      if (item.userId && currentUser?.id && item.userId !== currentUser.id) {
        remaining.push(item);
        continue;
      }

      try {
        let error: any = null;

        if (item.operation === 'INSERT') {
          // Use upsert for idempotency and duplicate prevention on retry
          const res = await supabase.from(item.tableName).upsert(item.payload, { onConflict: 'id' });
          error = res.error;
        } else if (item.operation === 'UPDATE') {
          const res = await supabase
            .from(item.tableName)
            .update(item.payload)
            .eq('id', item.recordId);
          error = res.error;
        } else if (item.operation === 'DELETE') {
          const res = await supabase
            .from(item.tableName)
            .delete()
            .eq('id', item.recordId);
          error = res.error;
        }

        if (error) {
          throw error;
        }

        synced++;
      } catch (err: any) {
        console.warn(`[SyncEngine] Error syncing record ${item.recordId} to ${item.tableName}:`, err);
        failed++;
        item.attempts += 1;
        item.lastError = err?.message || 'Sync error';

        if (item.attempts < MAX_ATTEMPTS) {
          remaining.push(item);
        }
      }
    }

    storageService.set(SYNC_STORAGE_KEY, remaining);
    this.notifySubscribers(remaining.length);
    this.isFlushing = false;

    return { total: queue.length, synced, failed };
  }

  subscribe(callback: (pendingCount: number) => void): () => void {
    this.listeners.add(callback);
    callback(this.getPendingItems().length);

    return () => {
      this.listeners.delete(callback);
    };
  }

  clearQueue(): void {
    storageService.remove(SYNC_STORAGE_KEY);
    this.notifySubscribers(0);
  }

  private notifySubscribers(count: number): void {
    this.listeners.forEach((cb) => {
      try {
        cb(count);
      } catch (err) {
        console.error('[SyncEngine] Subscriber notification error:', err);
      }
    });
  }
}

export const syncEngine = new SyncEngine();
