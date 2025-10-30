import { writeFile, mkdir, readFile, unlink, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export interface StoredImage {
  id: string
  originalName: string
  filename: string
  path: string
  size: number
  mimeType: string
  uploadedAt: Date
  category: 'detection' | 'training' | 'temp'
  metadata?: {
    width?: number
    height?: number
    format?: string
  }
}

export interface ImageStorageConfig {
  maxFileSize: number // in bytes
  allowedMimeTypes: string[]
  compressionQuality: number
  maxDimensions: {
    width: number
    height: number
  }
}

class ImageStorage {
  private readonly baseDir: string
  private readonly config: ImageStorageConfig
  private readonly subdirs = {
    detection: 'detection',
    training: 'training',
    temp: 'temp'
  }

  constructor() {
    this.baseDir = join(process.cwd(), 'uploads', 'images')
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      compressionQuality: 80,
      maxDimensions: {
        width: 1920,
        height: 1080
      }
    }
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await mkdir(dir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }

  private async getDirectory(category: 'detection' | 'training' | 'temp'): Promise<string> {
    const dir = join(this.baseDir, this.subdirs[category])
    await this.ensureDirectory(dir)
    return dir
  }

  private generateFilename(originalName: string, mimeType: string): string {
    const ext = this.getFileExtension(mimeType)
    const timestamp = Date.now()
    const uuid = uuidv4().split('-')[0] // Short UUID
    const name = basename(originalName, extname(originalName))
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20)
    
    return `${timestamp}_${uuid}_${name}${ext}`
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp'
    }
    return mimeToExt[mimeType] || '.jpg'
  }

  private async processImage(buffer: Buffer, mimeType: string): Promise<{
    processedBuffer: Buffer
    metadata: { width: number; height: number; format: string }
  }> {
    try {
      let image = sharp(buffer)
      
      // Get metadata
      const metadata = await image.metadata()
      
      // Resize if too large
      if (metadata.width && metadata.width > this.config.maxDimensions.width) {
        image = image.resize(this.config.maxDimensions.width, null, {
          withoutEnlargement: true
        })
      }
      
      if (metadata.height && metadata.height > this.config.maxDimensions.height) {
        image = image.resize(null, this.config.maxDimensions.height, {
          withoutEnlargement: true
        })
      }

      // Convert and compress
      let processedBuffer: Buffer
      let outputFormat = 'jpeg'
      
      if (mimeType === 'image/png') {
        processedBuffer = await image.png({ quality: this.config.compressionQuality }).toBuffer()
        outputFormat = 'png'
      } else {
        processedBuffer = await image.jpeg({ quality: this.config.compressionQuality }).toBuffer()
      }

      // Get final metadata
      const finalMetadata = await sharp(processedBuffer).metadata()

      return {
        processedBuffer,
        metadata: {
          width: finalMetadata.width || 0,
          height: finalMetadata.height || 0,
          format: outputFormat
        }
      }
    } catch (error) {
      console.error('Image processing error:', error)
      // Return original buffer if processing fails
      return {
        processedBuffer: buffer,
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown'
        }
      }
    }
  }

  async saveImage(
    file: Buffer | ArrayBuffer,
    originalName: string,
    mimeType: string,
    category: 'detection' | 'training' | 'temp'
  ): Promise<StoredImage> {
    // Validate file
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file)
    
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize / 1024 / 1024}MB`)
    }

    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`)
    }

    // Process image (resize, compress)
    const { processedBuffer, metadata } = await this.processImage(buffer, mimeType)

    // Generate filename and path
    const filename = this.generateFilename(originalName, mimeType)
    const directory = await this.getDirectory(category)
    const path = join(directory, filename)

    // Save file
    await writeFile(path, processedBuffer)

    // Create stored image object
    const storedImage: StoredImage = {
      id: uuidv4(),
      originalName,
      filename,
      path,
      size: processedBuffer.length,
      mimeType,
      uploadedAt: new Date(),
      category,
      metadata
    }

    return storedImage
  }

  async getImage(imageId: string, category: 'detection' | 'training' | 'temp'): Promise<Buffer | null> {
    try {
      const directory = await this.getDirectory(category)
      const files = await this.listImages(category)
      const image = files.find(img => img.id === imageId)
      
      if (!image) {
        return null
      }

      return await readFile(image.path)
    } catch (error) {
      console.error('Error reading image:', error)
      return null
    }
  }

  async listImages(category: 'detection' | 'training' | 'temp'): Promise<StoredImage[]> {
    try {
      const directory = await this.getDirectory(category)
      // This is a simplified implementation
      // In a real app, you'd want to maintain a database index of images
      return []
    } catch (error) {
      console.error('Error listing images:', error)
      return []
    }
  }

  async deleteImage(imageId: string, category: 'detection' | 'training' | 'temp'): Promise<boolean> {
    try {
      const directory = await this.getDirectory(category)
      const files = await this.listImages(category)
      const image = files.find(img => img.id === imageId)
      
      if (!image) {
        return false
      }

      await unlink(image.path)
      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  async getStorageStats(): Promise<{
    totalImages: number
    totalSize: number
    byCategory: Record<string, { count: number; size: number }>
  }> {
    const stats = {
      totalImages: 0,
      totalSize: 0,
      byCategory: {} as Record<string, { count: number; size: number }>
    }

    for (const category of Object.keys(this.subdirs)) {
      try {
        const directory = await this.getDirectory(category as any)
        const files = await this.listImages(category as any)
        const categorySize = files.reduce((sum, file) => sum + file.size, 0)
        
        stats.byCategory[category] = {
          count: files.length,
          size: categorySize
        }
        
        stats.totalImages += files.length
        stats.totalSize += categorySize
      } catch (error) {
        stats.byCategory[category] = { count: 0, size: 0 }
      }
    }

    return stats
  }

  async cleanupTempImages(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
    // Clean up temp images older than maxAge (default 24 hours)
    try {
      const directory = await this.getDirectory('temp')
      const files = await this.listImages('temp')
      const now = Date.now()
      let deletedCount = 0

      for (const file of files) {
        if (now - file.uploadedAt.getTime() > maxAge) {
          await this.deleteImage(file.id, 'temp')
          deletedCount++
        }
      }

      return deletedCount
    } catch (error) {
      console.error('Error cleaning up temp images:', error)
      return 0
    }
  }

  async optimizeStorage(): Promise<{
    spaceSaved: number
    imagesOptimized: number
  }> {
    // Optimize all images by recompressing them
    let spaceSaved = 0
    let imagesOptimized = 0

    for (const category of Object.keys(this.subdirs)) {
      try {
        const files = await this.listImages(category as any)
        
        for (const file of files) {
          const originalBuffer = await readFile(file.path)
          const { processedBuffer } = await this.processImage(originalBuffer, file.mimeType)
          
          if (processedBuffer.length < originalBuffer.length) {
            await writeFile(file.path, processedBuffer)
            spaceSaved += originalBuffer.length - processedBuffer.length
            imagesOptimized++
          }
        }
      } catch (error) {
        console.error(`Error optimizing ${category} images:`, error)
      }
    }

    return { spaceSaved, imagesOptimized }
  }

  // Utility method to convert file to base64 for API responses
  async imageToBase64(imagePath: string): Promise<string | null> {
    try {
      const buffer = await readFile(imagePath)
      const ext = extname(imagePath).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
      return `data:${mimeType};base64,${buffer.toString('base64')}`
    } catch (error) {
      console.error('Error converting image to base64:', error)
      return null
    }
  }

  // Method to save base64 image
  async saveBase64Image(
    base64Data: string,
    originalName: string,
    category: 'detection' | 'training' | 'temp'
  ): Promise<StoredImage> {
    // Extract the base64 part
    const matches = base64Data.match(/^data:(.+?);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]
    const base64 = matches[2]
    const buffer = Buffer.from(base64, 'base64')

    return this.saveImage(buffer, originalName, mimeType, category)
  }
}

export const imageStorage = new ImageStorage()