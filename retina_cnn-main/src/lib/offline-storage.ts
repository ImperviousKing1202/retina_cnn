/**
 * Offline Storage Manager for RETINA CNN System
 * Provides comprehensive offline storage capabilities using IndexedDB
 */

import { useState, useEffect, useCallback } from 'react';

export interface OfflineModelData {
  id: string;
  name: string;
  diseaseType: string;
  modelData: string; // Base64 encoded model
  metadata: {
    accuracy?: number;
    loss?: number;
    epochs?: number;
    createdAt: string;
    fileSize: number;
    version: string;
  };
  cachedAt: string;
  lastUsed: string;
}

export interface OfflineDetectionResult {
  id: string;
  imageId: string;
  result: any;
  timestamp: string;
  synced: boolean;
  diseaseType: string;
  confidence: number;
}

export interface OfflineTrainingSession {
  id: string;
  diseaseType: string;
  config: any;
  progress: any;
  results?: any;
  timestamp: string;
  synced: boolean;
}

export interface OfflineImageData {
  id: string;
  imageData: string; // Base64 encoded image
  filename: string;
  label?: string;
  diseaseType: string;
  timestamp: string;
  synced: boolean;
}

class OfflineStorageManager {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'RetinaCNNOfflineDB';
  private readonly DB_VERSION = 2;
  private readonly STORES = {
    MODELS: 'models',
    DETECTIONS: 'detections',
    TRAINING: 'training',
    IMAGES: 'images',
    PENDING_SYNC: 'pendingSync'
  };

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open offline database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Offline database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(this.STORES.MODELS)) {
          const modelStore = db.createObjectStore(this.STORES.MODELS, { keyPath: 'id' });
          modelStore.createIndex('diseaseType', 'diseaseType', { unique: false });
          modelStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORES.DETECTIONS)) {
          const detectionStore = db.createObjectStore(this.STORES.DETECTIONS, { keyPath: 'id' });
          detectionStore.createIndex('timestamp', 'timestamp', { unique: false });
          detectionStore.createIndex('synced', 'synced', { unique: false });
          detectionStore.createIndex('diseaseType', 'diseaseType', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORES.TRAINING)) {
          const trainingStore = db.createObjectStore(this.STORES.TRAINING, { keyPath: 'id' });
          trainingStore.createIndex('timestamp', 'timestamp', { unique: false });
          trainingStore.createIndex('synced', 'synced', { unique: false });
          trainingStore.createIndex('diseaseType', 'diseaseType', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORES.IMAGES)) {
          const imageStore = db.createObjectStore(this.STORES.IMAGES, { keyPath: 'id' });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
          imageStore.createIndex('synced', 'synced', { unique: false });
          imageStore.createIndex('diseaseType', 'diseaseType', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORES.PENDING_SYNC)) {
          const syncStore = db.createObjectStore(this.STORES.PENDING_SYNC, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  // Model storage methods
  async saveModel(modelData: OfflineModelData): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.MODELS], 'readwrite');
      const store = transaction.objectStore(this.STORES.MODELS);
      const request = store.put(modelData);

      request.onsuccess = () => {
        console.log('Model saved to offline storage:', modelData.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save model to offline storage:', request.error);
        reject(request.error);
      };
    });
  }

  async getModel(modelId: string): Promise<OfflineModelData | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.MODELS], 'readonly');
      const store = transaction.objectStore(this.STORES.MODELS);
      const request = store.get(modelId);

      request.onsuccess = () => {
        const model = request.result;
        if (model) {
          // Update last used timestamp
          this.updateModelLastUsed(modelId);
        }
        resolve(model || null);
      };

      request.onerror = () => {
        console.error('Failed to get model from offline storage:', request.error);
        reject(request.error);
      };
    });
  }

  async getModelsByDiseaseType(diseaseType: string): Promise<OfflineModelData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.MODELS], 'readonly');
      const store = transaction.objectStore(this.STORES.MODELS);
      const index = store.index('diseaseType');
      const request = index.getAll(diseaseType);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllModels(): Promise<OfflineModelData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.MODELS], 'readonly');
      const store = transaction.objectStore(this.STORES.MODELS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteModel(modelId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.MODELS], 'readwrite');
      const store = transaction.objectStore(this.STORES.MODELS);
      const request = store.delete(modelId);

      request.onsuccess = () => {
        console.log('Model deleted from offline storage:', modelId);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete model from offline storage:', request.error);
        reject(request.error);
      };
    });
  }

  private async updateModelLastUsed(modelId: string): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.MODELS], 'readwrite');
      const store = transaction.objectStore(this.STORES.MODELS);
      const getRequest = store.get(modelId);

      getRequest.onsuccess = () => {
        const model = getRequest.result;
        if (model) {
          model.lastUsed = new Date().toISOString();
          const updateRequest = store.put(model);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Detection result storage methods
  async saveDetectionResult(result: OfflineDetectionResult): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.DETECTIONS], 'readwrite');
      const store = transaction.objectStore(this.STORES.DETECTIONS);
      const request = store.put(result);

      request.onsuccess = () => {
        console.log('Detection result saved to offline storage:', result.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save detection result to offline storage:', request.error);
        reject(request.error);
      };
    });
  }

  async getUnsyncedDetectionResults(): Promise<OfflineDetectionResult[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.DETECTIONS], 'readonly');
      const store = transaction.objectStore(this.STORES.DETECTIONS);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markDetectionResultSynced(resultId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.DETECTIONS], 'readwrite');
      const store = transaction.objectStore(this.STORES.DETECTIONS);
      const getRequest = store.get(resultId);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (result) {
          result.synced = true;
          const updateRequest = store.put(result);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Training session storage methods
  async saveTrainingSession(session: OfflineTrainingSession): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.TRAINING], 'readwrite');
      const store = transaction.objectStore(this.STORES.TRAINING);
      const request = store.put(session);

      request.onsuccess = () => {
        console.log('Training session saved to offline storage:', session.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save training session to offline storage:', request.error);
        reject(request.error);
      };
    });
  }

  async getUnsyncedTrainingSessions(): Promise<OfflineTrainingSession[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.TRAINING], 'readonly');
      const store = transaction.objectStore(this.STORES.TRAINING);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Image storage methods
  async saveImage(imageData: OfflineImageData): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(this.STORES.IMAGES);
      const request = store.put(imageData);

      request.onsuccess = () => {
        console.log('Image saved to offline storage:', imageData.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save image to offline storage:', request.error);
        reject(request.error);
      };
    });
  }

  async getUnsyncedImages(): Promise<OfflineImageData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.IMAGES], 'readonly');
      const store = transaction.objectStore(this.STORES.IMAGES);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Storage management methods
  async getStorageUsage(): Promise<{ [key: string]: number }> {
    if (!this.db) await this.init();
    
    const usage: { [key: string]: number } = {};
    
    for (const storeName of Object.values(this.STORES)) {
      try {
        const count = await this.getStoreCount(storeName);
        usage[storeName] = count;
      } catch (error) {
        console.error(`Failed to get count for store ${storeName}:`, error);
        usage[storeName] = 0;
      }
    }
    
    return usage;
  }

  private async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldEntries(daysOld: number = 30): Promise<void> {
    if (!this.db) await this.init();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTimestamp = cutoffDate.toISOString();

    for (const storeName of [this.STORES.DETECTIONS, this.STORES.TRAINING, this.STORES.IMAGES]) {
      await this.clearOldEntriesFromStore(storeName, cutoffTimestamp);
    }
  }

  private async clearOldEntriesFromStore(storeName: string, cutoffTimestamp: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async exportData(): Promise<any> {
    if (!this.db) await this.init();
    
    const exportData: any = {};
    
    for (const storeName of Object.values(this.STORES)) {
      exportData[storeName] = await this.getAllFromStore(storeName);
    }
    
    return exportData;
  }

  private async getAllFromStore(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async importData(importData: any): Promise<void> {
    if (!this.db) await this.init();
    
    for (const [storeName, data] of Object.entries(importData)) {
      if (Object.values(this.STORES).includes(storeName) && Array.isArray(data)) {
        await this.importDataToStore(storeName, data);
      }
    }
  }

  private async importDataToStore(storeName: string, data: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      let hasError = false;

      for (const item of data) {
        const request = store.put(item);
        
        request.onsuccess = () => {
          completed++;
          if (completed === data.length && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      }
    });
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager();

// Export bound methods for easier use
export const offlineStorageAPI = {
  init: offlineStorage.init.bind(offlineStorage),
  saveModel: offlineStorage.saveModel.bind(offlineStorage),
  getModel: offlineStorage.getModel.bind(offlineStorage),
  getModelsByDiseaseType: offlineStorage.getModelsByDiseaseType.bind(offlineStorage),
  getAllModels: offlineStorage.getAllModels.bind(offlineStorage),
  deleteModel: offlineStorage.deleteModel.bind(offlineStorage),
  saveDetectionResult: offlineStorage.saveDetectionResult.bind(offlineStorage),
  getUnsyncedDetectionResults: offlineStorage.getUnsyncedDetectionResults.bind(offlineStorage),
  markDetectionResultSynced: offlineStorage.markDetectionResultSynced.bind(offlineStorage),
  saveTrainingSession: offlineStorage.saveTrainingSession.bind(offlineStorage),
  getUnsyncedTrainingSessions: offlineStorage.getUnsyncedTrainingSessions.bind(offlineStorage),
  saveImage: offlineStorage.saveImage.bind(offlineStorage),
  getUnsyncedImages: offlineStorage.getUnsyncedImages.bind(offlineStorage),
  clearOldEntries: offlineStorage.clearOldEntries.bind(offlineStorage),
  exportData: offlineStorage.exportData.bind(offlineStorage),
  importData: offlineStorage.importData.bind(offlineStorage)
};

// React hook for offline sync
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [pendingItems, setPendingItems] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingData = useCallback(async () => {
    if (!isOnline) return;

    setSyncStatus('syncing');
    
    try {
      // Get all unsynced data
      const [results, sessions, images] = await Promise.all([
        offlineStorageAPI.getUnsyncedDetectionResults(),
        offlineStorageAPI.getUnsyncedTrainingSessions(),
        offlineStorageAPI.getUnsyncedImages()
      ]);

      const totalItems = results.length + sessions.length + images.length;
      setPendingItems(totalItems);

      // Here you would sync with your backend
      // For now, we'll just mark them as synced
      await Promise.all([
        ...results.map(result => offlineStorageAPI.markDetectionResultSynced(result.id)),
        // Add other sync operations as needed
      ]);

      setSyncStatus('completed');
      setPendingItems(0);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && syncStatus === 'idle') {
      syncPendingData();
    }
  }, [isOnline, syncStatus, syncPendingData]);

  return {
    isOnline,
    syncStatus,
    pendingItems,
    syncPendingData
  };
}

// React hook for offline storage
export function useOfflineStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    setIsLoading(true);
    try {
      await offlineStorageAPI.init();
      setIsInitialized(true);
      await refreshStorageUsage();
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStorageUsage = async () => {
    try {
      const usage = await offlineStorage.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to get storage usage:', error);
    }
  };

  const getAllModels = async () => {
    try {
      return await offlineStorageAPI.getAllModels();
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  };

  const getUnsyncedDetectionResults = async () => {
    try {
      return await offlineStorageAPI.getUnsyncedDetectionResults();
    } catch (error) {
      console.error('Failed to get detection results:', error);
      return [];
    }
  };

  const getUnsyncedTrainingSessions = async () => {
    try {
      return await offlineStorageAPI.getUnsyncedTrainingSessions();
    } catch (error) {
      console.error('Failed to get training sessions:', error);
      return [];
    }
  };

  return {
    isInitialized,
    isLoading,
    storageUsage,
    refreshStorageUsage,
    getAllModels,
    getUnsyncedDetectionResults,
    getUnsyncedTrainingSessions,
    // Add other methods as needed
    saveModel: offlineStorageAPI.saveModel,
    getModel: offlineStorageAPI.getModel,
    deleteModel: offlineStorageAPI.deleteModel,
    saveDetectionResult: offlineStorageAPI.saveDetectionResult,
    saveTrainingSession: offlineStorageAPI.saveTrainingSession,
    saveImage: offlineStorageAPI.saveImage,
    clearOldEntries: offlineStorageAPI.clearOldEntries,
    exportData: offlineStorageAPI.exportData,
    importData: offlineStorageAPI.importData
  };
}