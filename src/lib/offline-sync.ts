/**
 * Offline Sync Manager for RETINA CNN System
 * Handles background synchronization of offline data
 */

import { offlineStorage, type OfflineDetectionResult, type OfflineTrainingSession, type OfflineImageData } from './offline-storage';

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private syncInProgress = false;
  private syncQueue: Array<{ type: string; data: any; retryCount: number }> = [];
  private readonly MAX_RETRY_COUNT = 3;
  private readonly SYNC_DELAY = 5000; // 5 seconds between sync attempts

  private constructor() {
    this.initializeSyncListeners();
  }

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  private initializeSyncListeners(): void {
    // Listen for online events
    window.addEventListener('online', () => {
      console.log('[Sync] Network restored, starting sync process');
      this.startSyncProcess();
    });

    // Listen for service worker sync events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_REQUESTED') {
          this.startSyncProcess();
        }
      });
    }

    // Periodic sync check (every 5 minutes)
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.checkForPendingSync();
      }
    }, 5 * 60 * 1000);
  }

  async startSyncProcess(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    console.log('[Sync] Starting synchronization process');

    try {
      // Sync detection results
      await this.syncDetectionResults();
      
      // Sync training sessions
      await this.syncTrainingSessions();
      
      // Sync images
      await this.syncImages();
      
      // Clean up old entries
      await this.cleanupOldEntries();
      
      console.log('[Sync] Synchronization completed successfully');
    } catch (error) {
      console.error('[Sync] Synchronization failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncDetectionResults(): Promise<void> {
    try {
      const unsyncedResults = await offlineStorage.getUnsyncedDetectionResults();
      
      for (const result of unsyncedResults) {
        try {
          const response = await fetch('/api/cnn/sync-detection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result)
          });

          if (response.ok) {
            await offlineStorage.markDetectionResultSynced(result.id);
            console.log(`[Sync] Detection result synced: ${result.id}`);
          } else {
            throw new Error(`Server responded with ${response.status}`);
          }
        } catch (error) {
          console.error(`[Sync] Failed to sync detection result ${result.id}:`, error);
          this.addToSyncQueue('detection', result);
        }
      }
    } catch (error) {
      console.error('[Sync] Error syncing detection results:', error);
    }
  }

  private async syncTrainingSessions(): Promise<void> {
    try {
      const unsyncedSessions = await offlineStorage.getUnsyncedTrainingSessions();
      
      for (const session of unsyncedSessions) {
        try {
          const response = await fetch('/api/cnn/sync-training', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(session)
          });

          if (response.ok) {
            // Mark as synced (you'd need to implement this method in offlineStorage)
            console.log(`[Sync] Training session synced: ${session.id}`);
          } else {
            throw new Error(`Server responded with ${response.status}`);
          }
        } catch (error) {
          console.error(`[Sync] Failed to sync training session ${session.id}:`, error);
          this.addToSyncQueue('training', session);
        }
      }
    } catch (error) {
      console.error('[Sync] Error syncing training sessions:', error);
    }
  }

  private async syncImages(): Promise<void> {
    try {
      const unsyncedImages = await offlineStorage.getUnsyncedImages();
      
      for (const image of unsyncedImages) {
        try {
          const formData = new FormData();
          formData.append('imageId', image.id);
          formData.append('imageData', image.imageData);
          formData.append('filename', image.filename);
          formData.append('label', image.label || '');
          formData.append('diseaseType', image.diseaseType);
          formData.append('timestamp', image.timestamp);

          const response = await fetch('/api/cnn/sync-image', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            // Mark as synced (you'd need to implement this method in offlineStorage)
            console.log(`[Sync] Image synced: ${image.id}`);
          } else {
            throw new Error(`Server responded with ${response.status}`);
          }
        } catch (error) {
          console.error(`[Sync] Failed to sync image ${image.id}:`, error);
          this.addToSyncQueue('image', image);
        }
      }
    } catch (error) {
      console.error('[Sync] Error syncing images:', error);
    }
  }

  private addToSyncQueue(type: string, data: any): void {
    const existingItem = this.syncQueue.find(item => item.type === type && item.data.id === data.id);
    
    if (existingItem) {
      existingItem.retryCount++;
    } else {
      this.syncQueue.push({
        type,
        data,
        retryCount: 0
      });
    }

    // Remove items that exceeded max retry count
    this.syncQueue = this.syncQueue.filter(item => item.retryCount < this.MAX_RETRY_COUNT);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`[Sync] Processing ${this.syncQueue.length} items from sync queue`);

    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        await this.syncQueueItem(item);
      } catch (error) {
        console.error(`[Sync] Failed to process queue item:`, error);
        if (item.retryCount < this.MAX_RETRY_COUNT) {
          item.retryCount++;
          this.syncQueue.push(item);
        }
      }
    }
  }

  private async syncQueueItem(item: { type: string; data: any; retryCount: number }): Promise<void> {
    switch (item.type) {
      case 'detection':
        await this.syncSingleDetectionResult(item.data);
        break;
      case 'training':
        await this.syncSingleTrainingSession(item.data);
        break;
      case 'image':
        await this.syncSingleImage(item.data);
        break;
    }
  }

  private async syncSingleDetectionResult(result: OfflineDetectionResult): Promise<void> {
    const response = await fetch('/api/cnn/sync-detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result)
    });

    if (response.ok) {
      await offlineStorage.markDetectionResultSynced(result.id);
    } else {
      throw new Error(`Server responded with ${response.status}`);
    }
  }

  private async syncSingleTrainingSession(session: OfflineTrainingSession): Promise<void> {
    const response = await fetch('/api/cnn/sync-training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session)
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  }

  private async syncSingleImage(image: OfflineImageData): Promise<void> {
    const formData = new FormData();
    formData.append('imageId', image.id);
    formData.append('imageData', image.imageData);
    formData.append('filename', image.filename);
    formData.append('label', image.label || '');
    formData.append('diseaseType', image.diseaseType);
    formData.append('timestamp', image.timestamp);

    const response = await fetch('/api/cnn/sync-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  }

  private async cleanupOldEntries(): Promise<void> {
    try {
      // Clean up entries older than 30 days
      await offlineStorage.clearOldEntries(30);
    } catch (error) {
      console.error('[Sync] Error cleaning up old entries:', error);
    }
  }

  private async checkForPendingSync(): Promise<void> {
    try {
      const [detections, training, images] = await Promise.all([
        offlineStorage.getUnsyncedDetectionResults(),
        offlineStorage.getUnsyncedTrainingSessions(),
        offlineStorage.getUnsyncedImages()
      ]);

      const totalPending = detections.length + training.length + images.length;
      
      if (totalPending > 0) {
        console.log(`[Sync] Found ${totalPending} pending items for sync`);
        await this.startSyncProcess();
      }
    } catch (error) {
      console.error('[Sync] Error checking for pending sync:', error);
    }
  }

  // Public methods for manual sync control
  async forceSync(): Promise<void> {
    console.log('[Sync] Force sync requested');
    await this.startSyncProcess();
    await this.processSyncQueue();
  }

  getSyncStatus(): {
    inProgress: boolean;
    queueLength: number;
    lastSyncTime: string | null;
  } {
    return {
      inProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      lastSyncTime: localStorage.getItem('lastSyncTime') || null
    };
  }

  async getPendingSyncCount(): Promise<number> {
    try {
      const [detections, training, images] = await Promise.all([
        offlineStorage.getUnsyncedDetectionResults(),
        offlineStorage.getUnsyncedTrainingSessions(),
        offlineStorage.getUnsyncedImages()
      ]);

      return detections.length + training.length + images.length + this.syncQueue.length;
    } catch (error) {
      console.error('[Sync] Error getting pending sync count:', error);
      return this.syncQueue.length;
    }
  }

  // Register background sync if supported
  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-cnn-data');
        console.log('[Sync] Background sync registered');
      } catch (error) {
        console.error('[Sync] Failed to register background sync:', error);
      }
    }
  }

  // Update last sync time
  private updateLastSyncTime(): void {
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }
}

// Export singleton instance
export const offlineSync = OfflineSyncManager.getInstance();

// React hook for sync functionality
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState(offlineSync.getSyncStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(offlineSync.getSyncStatus());
    };

    const updatePendingCount = async () => {
      const count = await offlineSync.getPendingSyncCount();
      setPendingCount(count);
    };

    // Update status every 5 seconds
    const interval = setInterval(() => {
      updateStatus();
      updatePendingCount();
    }, 5000);

    // Initial update
    updateStatus();
    updatePendingCount();

    // Listen for online events
    const handleOnline = () => {
      updateStatus();
      updatePendingCount();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const forceSync = async () => {
    await offlineSync.forceSync();
    setSyncStatus(offlineSync.getSyncStatus());
  };

  const registerBackgroundSync = async () => {
    await offlineSync.registerBackgroundSync();
  };

  return {
    syncStatus,
    pendingCount,
    forceSync,
    registerBackgroundSync
  };
}