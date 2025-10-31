import * as tf from '@tensorflow/tfjs'

export interface CNNModelConfig {
  inputShape: [number, number, number]
  numClasses: number
  learningRate: number
  batchSize: number
  epochs: number
}

export interface TrainingProgress {
  epoch: number
  loss: number
  accuracy: number
  valLoss: number
  valAccuracy: number
}

export interface PredictionResult {
  predictions: number[]
  confidence: number
  classIndex: number
  className: string
  processingTime: number
}

export class RetinaCNN {
  private model: tf.LayersModel | null = null
  private isTraining = false
  private trainingCallbacks: ((progress: TrainingProgress) => void)[] = []

  constructor(private config: CNNModelConfig) {
    this.initializeModel()
  }

  /**
   * Initialize the CNN model architecture
   */
  private async initializeModel(): Promise<void> {
    this.model = tf.sequential({
      layers: [
        // Input Layer
        tf.layers.conv2d({
          inputShape: this.config.inputShape,
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),

        // First Convolutional Block
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),

        // Second Convolutional Block
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),

        // Third Convolutional Block
        tf.layers.conv2d({
          filters: 256,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.conv2d({
          filters: 256,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),

        // Flatten and Dense Layers
        tf.layers.flatten(),
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.5 }),
        
        // Output Layer
        tf.layers.dense({
          units: this.config.numClasses,
          activation: 'softmax'
        })
      ]
    })

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    console.log('CNN Model initialized successfully')
    console.log('Model summary:')
    this.model.summary()
  }

  /**
   * Preprocess image for CNN input
   */
  async preprocessImage(imageElement: HTMLImageElement): Promise<tf.Tensor> {
    return tf.tidy(() => {
      // Convert image to tensor
      const tensor = tf.browser.fromPixels(imageElement)
      
      // Resize to input shape
      const resized = tf.image.resizeBilinear(tensor, [
        this.config.inputShape[0],
        this.config.inputShape[1]
      ])
      
      // Normalize to [0, 1]
      const normalized = resized.div(255.0)
      
      // Add batch dimension
      const batched = normalized.expandDims(0)
      
      return batched
    })
  }

  /**
   * Train the CNN model
   */
  async train(
    trainImages: tf.Tensor,
    trainLabels: tf.Tensor,
    validationImages?: tf.Tensor,
    validationLabels?: tf.Tensor
  ): Promise<void> {
    if (!this.model || this.isTraining) {
      throw new Error('Model not initialized or already training')
    }

    this.isTraining = true

    try {
      const validationData = validationImages && validationLabels 
        ? [validationImages, validationLabels] 
        : undefined

      await this.model.fit(trainImages, trainLabels, {
        epochs: this.config.epochs,
        batchSize: this.config.batchSize,
        validationData,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress: TrainingProgress = {
              epoch: epoch + 1,
              loss: logs?.loss || 0,
              accuracy: logs?.acc || 0,
              valLoss: logs?.val_loss || 0,
              valAccuracy: logs?.val_acc || 0
            }
            
            this.trainingCallbacks.forEach(callback => callback(progress))
          }
        }
      })
    } finally {
      this.isTraining = false
    }
  }

  /**
   * Make prediction on a single image
   */
  async predict(imageElement: HTMLImageElement, classNames: string[]): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    const startTime = performance.now()

    const preprocessed = await this.preprocessImage(imageElement)
    const prediction = this.model.predict(preprocessed) as tf.Tensor
    const probabilities = await prediction.data()
    const confidence = Math.max(...probabilities)
    const classIndex = probabilities.indexOf(confidence)

    const endTime = performance.now()
    const processingTime = endTime - startTime

    // Clean up tensors
    preprocessed.dispose()
    prediction.dispose()

    return {
      predictions: Array.from(probabilities),
      confidence,
      classIndex,
      className: classNames[classIndex],
      processingTime
    }
  }

  /**
   * Evaluate model performance
   */
  async evaluate(testImages: tf.Tensor, testLabels: tf.Tensor): Promise<{ loss: number; accuracy: number }> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    const evaluation = this.model.evaluate(testImages, testLabels) as tf.Scalar[]
    const loss = await evaluation[0].data()
    const accuracy = await evaluation[1].data()

    return {
      loss: loss[0],
      accuracy: accuracy[0]
    }
  }

  /**
   * Save model to local storage
   */
  async saveModel(name: string): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    await this.model.save(`localstorage://${name}`)
    console.log(`Model saved as ${name}`)
  }

  /**
   * Load model from local storage
   */
  async loadModel(name: string): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`localstorage://${name}`)
      console.log(`Model ${name} loaded successfully`)
    } catch (error) {
      console.error('Failed to load model:', error)
      throw error
    }
  }

  /**
   * Export model for download
   */
  async exportModel(): Promise<Blob> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    const modelJSON = this.model.toJSON(null, true)
    const modelString = JSON.stringify(modelJSON, null, 2)
    
    return new Blob([modelString], { type: 'application/json' })
  }

  /**
   * Add training progress callback
   */
  onTrainingProgress(callback: (progress: TrainingProgress) => void): void {
    this.trainingCallbacks.push(callback)
  }

  /**
   * Remove training progress callback
   */
  removeTrainingProgress(callback: (progress: TrainingProgress) => void): void {
    const index = this.trainingCallbacks.indexOf(callback)
    if (index > -1) {
      this.trainingCallbacks.splice(index, 1)
    }
  }

  /**
   * Get model summary
   */
  getModelSummary(): string {
    if (!this.model) {
      return 'Model not initialized'
    }

    return this.model.toString()
  }

  /**
   * Check if model is training
   */
  isModelTraining(): boolean {
    return this.isTraining
  }

  /**
   * Get total parameters count
   */
  async getParameterCount(): Promise<number> {
    if (!this.model) {
      return 0
    }

    return this.model.countParams()
  }

  /**
   * Dispose model and clean up memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.trainingCallbacks = []
  }
}

// Disease-specific CNN configurations
export const DISEASE_CONFIGS = {
  glaucoma: {
    inputShape: [224, 224, 3] as [number, number, number],
    numClasses: 2, // Normal, Glaucoma
    learningRate: 0.001,
    batchSize: 32,
    epochs: 50
  },
  retinopathy: {
    inputShape: [224, 224, 3] as [number, number, number],
    numClasses: 5, // No DR, Mild, Moderate, Severe, Proliferative
    learningRate: 0.0005,
    batchSize: 16,
    epochs: 75
  },
  cataract: {
    inputShape: [224, 224, 3] as [number, number, number],
    numClasses: 3, // Normal, Early Cataract, Advanced Cataract
    learningRate: 0.001,
    batchSize: 32,
    epochs: 40
  },
  normal: {
    inputShape: [224, 224, 3] as [number, number, number],
    numClasses: 2, // Normal, Abnormal
    learningRate: 0.001,
    batchSize: 32,
    epochs: 30
  }
}

export const CLASS_NAMES = {
  glaucoma: ['Normal', 'Glaucoma Detected'],
  retinopathy: ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR'],
  cataract: ['Normal', 'Early Cataract', 'Advanced Cataract'],
  normal: ['Normal', 'Abnormal']
}