import * as tf from '@tensorflow/tfjs'

export interface ImageData {
  id: string
  image: HTMLImageElement
  label: string
  filename: string
}

export interface DatasetSplit {
  train: ImageData[]
  validation: ImageData[]
  test: ImageData[]
}

export interface AugmentationConfig {
  rotation: boolean
  flip: boolean
  brightness: boolean
  contrast: boolean
  zoom: boolean
  noise: boolean
}

export class DataPreprocessor {
  private readonly targetSize = [224, 224] as [number, number]
  private readonly augmentationConfig: AugmentationConfig = {
    rotation: true,
    flip: true,
    brightness: true,
    contrast: true,
    zoom: true,
    noise: false
  }

  /**
   * Load and preprocess images from file inputs
   */
  async loadImagesFromFiles(files: File[], labels: string[]): Promise<ImageData[]> {
    const imageData: ImageData[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const label = labels[i] || 'unknown'

      try {
        const image = await this.loadImageFromFile(file)
        imageData.push({
          id: `img_${Date.now()}_${i}`,
          image,
          label,
          filename: file.name
        })
      } catch (error) {
        console.error(`Failed to load image ${file.name}:`, error)
      }
    }

    return imageData
  }

  /**
   * Load image from File object
   */
  private loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error(`Failed to load image: ${file.name}`))
      }

      img.src = url
    })
  }

  /**
   * Preprocess dataset for training
   */
  async preprocessDataset(
    imageData: ImageData[],
    classNames: string[],
    validationSplit: number = 0.2,
    testSplit: number = 0.1
  ): Promise<{
    trainTensors: { images: tf.Tensor; labels: tf.Tensor }
    validationTensors: { images: tf.Tensor; labels: tf.Tensor }
    testTensors: { images: tf.Tensor; labels: tf.Tensor }
    split: DatasetSplit
  }> {
    // Shuffle dataset
    const shuffled = this.shuffleArray([...imageData])
    
    // Calculate split indices
    const totalSize = shuffled.length
    const testSize = Math.floor(totalSize * testSplit)
    const validationSize = Math.floor(totalSize * validationSplit)
    const trainSize = totalSize - testSize - validationSize

    // Split dataset
    const split: DatasetSplit = {
      train: shuffled.slice(0, trainSize),
      validation: shuffled.slice(trainSize, trainSize + validationSize),
      test: shuffled.slice(trainSize + validationSize)
    }

    // Convert to tensors
    const trainTensors = await this.convertToTensors(split.train, classNames)
    const validationTensors = await this.convertToTensors(split.validation, classNames)
    const testTensors = await this.convertToTensors(split.test, classNames)

    return {
      trainTensors,
      validationTensors,
      testTensors,
      split
    }
  }

  /**
   * Convert image data to tensors
   */
  private async convertToTensors(
    imageData: ImageData[],
    classNames: string[]
  ): Promise<{ images: tf.Tensor; labels: tf.Tensor }> {
    const imageTensors: tf.Tensor[] = []
    const labelIndices: number[] = []

    for (const data of imageData) {
      // Preprocess image
      const imageTensor = await this.preprocessImage(data.image)
      imageTensors.push(imageTensor)

      // Convert label to index
      const labelIndex = classNames.indexOf(data.label)
      if (labelIndex === -1) {
        throw new Error(`Unknown label: ${data.label}`)
      }
      labelIndices.push(labelIndex)
    }

    // Stack images and create one-hot labels
    const imagesTensor = tf.stack(imageTensors)
    const labelsTensor = tf.oneHot(tf.tensor1d(labelIndices, 'int32'), classNames.length)

    return {
      images: imagesTensor,
      labels: labelsTensor
    }
  }

  /**
   * Preprocess single image for CNN
   */
  async preprocessImage(image: HTMLImageElement): Promise<tf.Tensor> {
    return tf.tidy(() => {
      // Convert to tensor
      let tensor = tf.browser.fromPixels(image)
      
      // Convert to RGB if necessary
      if (tensor.shape[2] === 4) {
        tensor = tensor.slice([0, 0, 0], [tensor.shape[0], tensor.shape[1], 3])
      }
      
      // Resize to target size
      const resized = tf.image.resizeBilinear(tensor, this.targetSize)
      
      // Normalize to [0, 1]
      const normalized = resized.div(255.0)
      
      return normalized
    })
  }

  /**
   * Apply data augmentation
   */
  async augmentImage(image: tf.Tensor): Promise<tf.Tensor> {
    return tf.tidy(() => {
      let augmented = image.clone()

      // Random rotation
      if (this.augmentationConfig.rotation && Math.random() > 0.5) {
        const angle = (Math.random() - 0.5) * 0.2 // ±10 degrees
        augmented = tf.image.rotateWithOffset(augmented, angle)
      }

      // Random horizontal flip
      if (this.augmentationConfig.flip && Math.random() > 0.5) {
        augmented = tf.image.flipLeftRight(augmented)
      }

      // Random brightness adjustment
      if (this.augmentationConfig.brightness && Math.random() > 0.5) {
        const delta = (Math.random() - 0.5) * 0.2
        augmented = tf.image.adjustBrightness(augmented, delta)
      }

      // Random contrast adjustment
      if (this.augmentationConfig.contrast && Math.random() > 0.5) {
        const factor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        augmented = tf.image.adjustContrast(augmented, factor)
      }

      // Random zoom
      if (this.augmentationConfig.zoom && Math.random() > 0.5) {
        const zoomFactor = 0.9 + Math.random() * 0.2 // 0.9 to 1.1
        const boxes = tf.tensor2d([[0, 0, zoomFactor, zoomFactor]])
        const boxInd = tf.tensor1d([0], 'int32')
        const cropSize = [this.targetSize[0], this.targetSize[1]]
        augmented = tf.image.cropAndResize(augmented, boxes, boxInd, cropSize)
      }

      // Random noise (disabled by default for medical images)
      if (this.augmentationConfig.noise && Math.random() > 0.5) {
        const noise = tf.randomNormal(augmented.shape, 0, 0.01)
        augmented = augmented.add(noise)
      }

      // Ensure values are in valid range [0, 1]
      augmented = tf.clipByValue(augmented, 0, 1)

      return augmented
    })
  }

  /**
   * Create augmented dataset
   */
  async createAugmentedDataset(
    originalData: ImageData[],
    augmentationFactor: number = 2
  ): Promise<ImageData[]> {
    const augmentedData: ImageData[] = [...originalData]

    for (const data of originalData) {
      for (let i = 0; i < augmentationFactor; i++) {
        const imageTensor = await this.preprocessImage(data.image)
        const augmentedTensor = await this.augmentImage(imageTensor)
        
        // Convert tensor back to image element
        const canvas = document.createElement('canvas')
        canvas.width = this.targetSize[0]
        canvas.height = this.targetSize[1]
        const ctx = canvas.getContext('2d')!
        
        await tf.browser.toPixels(augmentedTensor, canvas)
        
        const augmentedImage = new Image()
        augmentedImage.src = canvas.toDataURL()
        
        await new Promise(resolve => {
          augmentedImage.onload = resolve
        })

        augmentedData.push({
          id: `${data.id}_aug_${i}`,
          image: augmentedImage,
          label: data.label,
          filename: `augmented_${data.filename}`
        })

        // Clean up tensors
        imageTensor.dispose()
        augmentedTensor.dispose()
      }
    }

    return augmentedData
  }

  /**
   * Extract features from pre-trained model (transfer learning)
   */
  async extractFeatures(imageData: ImageData[], featureExtractor: tf.LayersModel): Promise<tf.Tensor> {
    const features: tf.Tensor[] = []

    for (const data of imageData) {
      const preprocessed = await this.preprocessImage(data.image)
      const batched = preprocessed.expandDims(0)
      const feature = featureExtractor.predict(batched) as tf.Tensor
      features.push(feature.squeeze() as tf.Tensor)
      
      // Clean up
      preprocessed.dispose()
      batched.dispose()
    }

    return tf.stack(features)
  }

  /**
   * Calculate dataset statistics
   */
  calculateDatasetStats(imageData: ImageData[]): {
    totalImages: number
    classDistribution: { [className: string]: number }
    balance: number
  } {
    const classDistribution: { [className: string]: number } = {}
    
    imageData.forEach(data => {
      classDistribution[data.label] = (classDistribution[data.label] || 0) + 1
    })

    const counts = Object.values(classDistribution)
    const maxCount = Math.max(...counts)
    const minCount = Math.min(...counts)
    const balance = minCount / maxCount

    return {
      totalImages: imageData.length,
      classDistribution,
      balance
    }
  }

  /**
   * Validate image quality
   */
  validateImageQuality(image: HTMLImageElement): {
    isValid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check image dimensions
    if (image.width < 224 || image.height < 224) {
      issues.push('Image resolution too low')
      recommendations.push('Use images with at least 224x224 resolution')
    }

    // Check aspect ratio
    const aspectRatio = image.width / image.height
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      issues.push('Unusual aspect ratio')
      recommendations.push('Use images with aspect ratio between 0.5 and 2.0')
    }

    // Check if image is square enough for retinal analysis
    if (Math.abs(aspectRatio - 1.0) > 0.3) {
      recommendations.push('Square images work best for retinal analysis')
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * Shuffle array randomly
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Clean up tensors
   */
  disposeTensors(tensors: tf.Tensor[]): void {
    tensors.forEach(tensor => tensor.dispose())
  }

  /**
   * Get augmentation configuration
   */
  getAugmentationConfig(): AugmentationConfig {
    return { ...this.augmentationConfig }
  }

  /**
   * Update augmentation configuration
   */
  updateAugmentationConfig(config: Partial<AugmentationConfig>): void {
    Object.assign(this.augmentationConfig, config)
  }
}