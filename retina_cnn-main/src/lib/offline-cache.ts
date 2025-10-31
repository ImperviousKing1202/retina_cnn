// Offline cache utility for storing detection results and training data
export interface CachedDetectionResult {
  id: string
  diseaseType: string
  imageUrl: string
  confidence: number
  result: string
  details: any
  createdAt: string
  isOffline: boolean
}

export interface CachedTrainingImage {
  id: string
  diseaseType: string
  label: string
  imageUrl: string
  isVerified: boolean
  createdAt: string
  isOffline: boolean
}

class OfflineCache {
  private readonly CACHE_PREFIX = 'retina_'
  private readonly DETECTION_RESULTS_KEY = `${this.CACHE_PREFIX}detection_results`
  private readonly TRAINING_IMAGES_KEY = `${this.CACHE_PREFIX}training_images`
  private readonly SETTINGS_KEY = `${this.CACHE_PREFIX}settings`

  // Detection Results Cache
  cacheDetectionResult(result: CachedDetectionResult): void {
    try {
      const existingResults = this.getCachedDetectionResults()
      existingResults.push(result)
      
      // Keep only the last 50 results to manage storage
      if (existingResults.length > 50) {
        existingResults.splice(0, existingResults.length - 50)
      }
      
      localStorage.setItem(this.DETECTION_RESULTS_KEY, JSON.stringify(existingResults))
    } catch (error) {
      console.warn('Failed to cache detection result:', error)
    }
  }

  getCachedDetectionResults(): CachedDetectionResult[] {
    try {
      const cached = localStorage.getItem(this.DETECTION_RESULTS_KEY)
      return cached ? JSON.parse(cached) : []
    } catch (error) {
      console.warn('Failed to retrieve cached detection results:', error)
      return []
    }
  }

  getDetectionResultById(id: string): CachedDetectionResult | null {
    const results = this.getCachedDetectionResults()
    return results.find(result => result.id === id) || null
  }

  deleteDetectionResult(id: string): void {
    try {
      const results = this.getCachedDetectionResults()
      const filteredResults = results.filter(result => result.id !== id)
      localStorage.setItem(this.DETECTION_RESULTS_KEY, JSON.stringify(filteredResults))
    } catch (error) {
      console.warn('Failed to delete cached detection result:', error)
    }
  }

  // Training Images Cache
  cacheTrainingImage(image: CachedTrainingImage): void {
    try {
      const existingImages = this.getCachedTrainingImages()
      existingImages.push(image)
      
      // Keep only the last 100 images to manage storage
      if (existingImages.length > 100) {
        existingImages.splice(0, existingImages.length - 100)
      }
      
      localStorage.setItem(this.TRAINING_IMAGES_KEY, JSON.stringify(existingImages))
    } catch (error) {
      console.warn('Failed to cache training image:', error)
    }
  }

  getCachedTrainingImages(): CachedTrainingImage[] {
    try {
      const cached = localStorage.getItem(this.TRAINING_IMAGES_KEY)
      return cached ? JSON.parse(cached) : []
    } catch (error) {
      console.warn('Failed to retrieve cached training images:', error)
      return []
    }
  }

  deleteTrainingImage(id: string): void {
    try {
      const images = this.getCachedTrainingImages()
      const filteredImages = images.filter(image => image.id !== id)
      localStorage.setItem(this.TRAINING_IMAGES_KEY, JSON.stringify(filteredImages))
    } catch (error) {
      console.warn('Failed to delete cached training image:', error)
    }
  }

  // Settings and Preferences
  saveSettings(settings: {
    offlineMode: boolean
    autoSync: boolean
    theme: 'light' | 'dark' | 'auto'
  }): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }

  getSettings(): {
    offlineMode: boolean
    autoSync: boolean
    theme: 'light' | 'dark' | 'auto'
  } {
    try {
      const cached = localStorage.getItem(this.SETTINGS_KEY)
      return cached ? JSON.parse(cached) : {
        offlineMode: false,
        autoSync: true,
        theme: 'auto'
      }
    } catch (error) {
      console.warn('Failed to retrieve settings:', error)
      return {
        offlineMode: false,
        autoSync: true,
        theme: 'auto'
      }
    }
  }

  // Storage Management
  getCacheSize(): number {
    try {
      let totalSize = 0
      for (let key in localStorage) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          totalSize += localStorage[key].length
        }
      }
      return totalSize // Return size in bytes
    } catch (error) {
      console.warn('Failed to calculate cache size:', error)
      return 0
    }
  }

  clearCache(): void {
    try {
      const keysToRemove: string[] = []
      for (let key in localStorage) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  // Sync functionality
  async syncOfflineData(): Promise<{
    syncedResults: number
    syncedImages: number
    errors: string[]
  }> {
    const errors: string[] = []
    let syncedResults = 0
    let syncedImages = 0

    try {
      // Sync detection results
      const offlineResults = this.getCachedDetectionResults().filter(r => r.isOffline)
      for (const result of offlineResults) {
        try {
          const response = await fetch('/api/history/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
          })
          
          if (response.ok) {
            // Update the cached result to mark as synced
            result.isOffline = false
            this.cacheDetectionResult(result)
            syncedResults++
          } else {
            errors.push(`Failed to sync result ${result.id}`)
          }
        } catch (error) {
          errors.push(`Error syncing result ${result.id}: ${error}`)
        }
      }

      // Sync training images
      const offlineImages = this.getCachedTrainingImages().filter(img => img.isOffline)
      for (const image of offlineImages) {
        try {
          const response = await fetch('/api/train/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(image)
          })
          
          if (response.ok) {
            // Update the cached image to mark as synced
            image.isOffline = false
            this.cacheTrainingImage(image)
            syncedImages++
          } else {
            errors.push(`Failed to sync image ${image.id}`)
          }
        } catch (error) {
          errors.push(`Error syncing image ${image.id}: ${error}`)
        }
      }
    } catch (error) {
      errors.push(`Sync failed: ${error}`)
    }

    return { syncedResults, syncedImages, errors }
  }

  // Check if online
  isOnline(): boolean {
    return navigator.onLine
  }

  // Get offline statistics
  getOfflineStats(): {
    offlineResults: number
    offlineImages: number
    cacheSize: string
  } {
    const offlineResults = this.getCachedDetectionResults().filter(r => r.isOffline).length
    const offlineImages = this.getCachedTrainingImages().filter(img => img.isOffline).length
    const cacheSizeBytes = this.getCacheSize()
    const cacheSizeMB = (cacheSizeBytes / (1024 * 1024)).toFixed(2)

    return {
      offlineResults,
      offlineImages,
      cacheSize: `${cacheSizeMB} MB`
    }
  }
}

export const offlineCache = new OfflineCache()