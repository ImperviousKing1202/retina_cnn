import * as tf from '@tensorflow/tfjs';
import { tensorflowModelManager } from './tensorflow-model-manager';

export interface CachedModel {
  name: string;
  version: string;
  size: number;
  lastUsed: Date;
  downloadDate: Date;
  modelUrl?: string;
  isPretrained: boolean;
  accuracy?: number;
  description?: string;
  tags?: string[];
}

export interface CacheConfig {
  maxCacheSize: number; // in MB
  maxModels: number;
  autoCleanup: boolean;
  cleanupThreshold: number; // percentage of cache to clean when full
}

export interface ModelDownloadProgress {
  modelName: string;
  progress: number;
  downloaded: number;
  total: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number;
}

export class ModelCacheManager {
  private cache: Map<string, CachedModel> = new Map();
  private config: CacheConfig = {
    maxCacheSize: 500, // 500MB
    maxModels: 10,
    autoCleanup: true,
    cleanupThreshold: 0.8
  };
  private downloadProgressCallbacks: Map<string, (progress: ModelDownloadProgress) => void> = new Map();

  /**
   * Initialize cache manager
   */
  async initialize(): Promise<void> {
    await this.loadCacheFromStorage();
    await this.cleanupCache();
  }

  /**
   * Load cache information from localStorage
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cacheData = localStorage.getItem('retina_model_cache');
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        this.cache = new Map(Object.entries(parsedCache));
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  /**
   * Save cache information to localStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheData = Object.fromEntries(this.cache);
      localStorage.setItem('retina_model_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  /**
   * Get current cache size in MB
   */
  private getCurrentCacheSize(): number {
    let totalSize = 0;
    for (const model of this.cache.values()) {
      totalSize += model.size;
    }
    return totalSize / (1024 * 1024); // Convert to MB
  }

  /**
   * Get cache usage statistics
   */
  getCacheStats(): {
    totalSize: number;
    totalModels: number;
    maxSize: number;
    maxModels: number;
    usagePercentage: number;
  } {
    const totalSize = this.getCurrentCacheSize();
    const totalModels = this.cache.size;

    return {
      totalSize,
      totalModels,
      maxSize: this.config.maxCacheSize,
      maxModels: this.config.maxModels,
      usagePercentage: (totalSize / this.config.maxCacheSize) * 100
    };
  }

  /**
   * Add model to cache
   */
  async addToCache(
    modelName: string,
    model: tf.LayersModel,
    metadata: Partial<CachedModel>
  ): Promise<void> {
    // Save model to localStorage
    await model.save(`localstorage://${modelName}`);

    // Calculate model size (approximate)
    const modelSize = await this.calculateModelSize(model);

    // Create cache entry
    const cachedModel: CachedModel = {
      name: modelName,
      version: metadata.version || '1.0.0',
      size: modelSize,
      lastUsed: new Date(),
      downloadDate: new Date(),
      isPretrained: metadata.isPretrained || false,
      accuracy: metadata.accuracy,
      description: metadata.description,
      tags: metadata.tags || []
    };

    this.cache.set(modelName, cachedModel);
    await this.saveCacheToStorage();

    // Auto cleanup if needed
    if (this.config.autoCleanup) {
      await this.cleanupCache();
    }
  }

  /**
   * Calculate approximate model size
   */
  private async calculateModelSize(model: tf.LayersModel): Promise<number> {
    let totalParams = 0;
    for (const layer of model.layers) {
      if (layer.getWeights) {
        const weights = layer.getWeights();
        for (const weight of weights) {
          totalParams += weight.size;
        }
      }
    }
    // Assume 4 bytes per parameter (float32)
    return totalParams * 4;
  }

  /**
   * Get model from cache
   */
  async getFromCache(modelName: string): Promise<tf.LayersModel | null> {
    const cachedModel = this.cache.get(modelName);
    if (!cachedModel) {
      return null;
    }

    try {
      // Update last used time
      cachedModel.lastUsed = new Date();
      await this.saveCacheToStorage();

      // Load model from localStorage
      const model = await tensorflowModelManager.loadModel(modelName);
      return model;
    } catch (error) {
      console.error(`Failed to load model ${modelName} from cache:`, error);
      // Remove invalid entry
      this.cache.delete(modelName);
      await this.saveCacheToStorage();
      return null;
    }
  }

  /**
   * Remove model from cache
   */
  async removeFromCache(modelName: string): Promise<void> {
    this.cache.delete(modelName);
    
    // Remove from localStorage
    try {
      localStorage.removeItem(`tensorflowjs_models/localstorage://${modelName}/info`);
      localStorage.removeItem(`tensorflowjs_models/localstorage://${modelName}/model_topology`);
      localStorage.removeItem(`tensorflowjs_models/localstorage://${modelName}/weight_data`);
    } catch (error) {
      console.warn(`Failed to remove model ${modelName} from localStorage:`, error);
    }

    await this.saveCacheToStorage();
  }

  /**
   * Clean up cache based on LRU policy
   */
  async cleanupCache(): Promise<void> {
    const stats = this.getCacheStats();
    
    if (stats.totalSize <= this.config.maxCacheSize && stats.totalModels <= this.config.maxModels) {
      return;
    }

    // Sort models by last used time (oldest first)
    const sortedModels = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastUsed.getTime() - b.lastUsed.getTime());

    // Remove oldest models until cache is under limits
    const targetSize = this.config.maxCacheSize * this.config.cleanupThreshold;
    const targetModels = Math.floor(this.config.maxModels * this.config.cleanupThreshold);

    let currentSize = stats.totalSize;
    let currentModels = stats.totalModels;

    for (const [modelName] of sortedModels) {
      if (currentSize <= targetSize && currentModels <= targetModels) {
        break;
      }

      const model = this.cache.get(modelName)!;
      currentSize -= model.size / (1024 * 1024);
      currentModels--;

      await this.removeFromCache(modelName);
    }
  }

  /**
   * Download and cache a pretrained model
   */
  async downloadPretrainedModel(
    modelName: string,
    modelUrl: string,
    metadata: Partial<CachedModel>,
    onProgress?: (progress: ModelDownloadProgress) => void
  ): Promise<tf.LayersModel> {
    if (onProgress) {
      this.downloadProgressCallbacks.set(modelName, onProgress);
    }

    try {
      const startTime = Date.now();
      let lastLoaded = 0;

      // Create custom progress handler
      const progressHandler = (fraction: number) => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const loaded = fraction * 100; // Assume 100MB total for estimation
        const speed = loaded / (elapsed / 1000); // bytes per second
        const remaining = (100 - loaded) / speed; // seconds

        const progress: ModelDownloadProgress = {
          modelName,
          progress: fraction * 100,
          downloaded: loaded,
          total: 100,
          speed,
          estimatedTimeRemaining: remaining
        };

        const callback = this.downloadProgressCallbacks.get(modelName);
        if (callback) {
          callback(progress);
        }

        lastLoaded = loaded;
      };

      // Load model with progress tracking
      const model = await tf.loadLayersModel(modelUrl, {
        onProgress: progressHandler
      });

      // Add to cache
      await this.addToCache(modelName, model, {
        ...metadata,
        modelUrl,
        isPretrained: true
      });

      return model;
    } finally {
      this.downloadProgressCallbacks.delete(modelName);
    }
  }

  /**
   * Get all cached models
   */
  getCachedModels(): CachedModel[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  /**
   * Get cached model by name
   */
  getCachedModel(modelName: string): CachedModel | null {
    return this.cache.get(modelName) || null;
  }

  /**
   * Check if model is cached
   */
  isModelCached(modelName: string): boolean {
    return this.cache.has(modelName);
  }

  /**
   * Clear all cached models
   */
  async clearCache(): Promise<void> {
    const modelNames = Array.from(this.cache.keys());
    for (const modelName of modelNames) {
      await this.removeFromCache(modelName);
    }
  }

  /**
   * Export cache configuration
   */
  exportCacheConfig(): string {
    return JSON.stringify({
      config: this.config,
      models: Array.from(this.cache.entries())
    }, null, 2);
  }

  /**
   * Import cache configuration
   */
  async importCacheConfig(configJson: string): Promise<void> {
    try {
      const imported = JSON.parse(configJson);
      
      if (imported.config) {
        this.config = { ...this.config, ...imported.config };
      }

      if (imported.models) {
        this.cache = new Map(imported.models);
        await this.saveCacheToStorage();
      }
    } catch (error) {
      throw new Error(`Failed to import cache configuration: ${error}`);
    }
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Validate cached models
   */
  async validateCachedModels(): Promise<{
    valid: string[];
    invalid: string[];
  }> {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const [modelName] of this.cache.entries()) {
      try {
        const model = await this.getFromCache(modelName);
        if (model) {
          valid.push(modelName);
          model.dispose();
        } else {
          invalid.push(modelName);
        }
      } catch (error) {
        invalid.push(modelName);
      }
    }

    // Remove invalid models
    for (const modelName of invalid) {
      await this.removeFromCache(modelName);
    }

    return { valid, invalid };
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(modelName: string): {
    loadTime: number;
    inferenceTime: number;
    memoryUsage: number;
  } | null {
    const cachedModel = this.cache.get(modelName);
    if (!cachedModel) {
      return null;
    }

    // These would be collected during actual usage
    // For now, return placeholder values
    return {
      loadTime: 0,
      inferenceTime: 0,
      memoryUsage: 0
    };
  }
}

// Singleton instance
export const modelCacheManager = new ModelCacheManager();