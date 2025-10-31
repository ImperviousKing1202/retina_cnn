import * as tf from '@tensorflow/tfjs';
import { loadLayersModel, tensor4d } from '@tensorflow/tfjs';

export interface ModelConfig {
  name: string;
  inputShape: [number, number, number];
  numClasses: number;
  architecture: 'cnn' | 'resnet' | 'mobilenet' | 'custom';
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
  lossFunction: 'categoricalCrossentropy' | 'binaryCrossentropy' | 'meanSquaredError';
  metrics: string[];
}

export interface ModelMetrics {
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  valLoss: number;
  valAccuracy: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

export class TensorFlowModelManager {
  private models: Map<string, tf.LayersModel> = new Map();
  private trainingHistory: Map<string, ModelMetrics[]> = new Map();
  private isTraining: Map<string, boolean> = new Map();
  private trainingCallbacks: Map<string, (progress: TrainingProgress) => void> = new Map();

  /**
   * Create a new CNN model for retinal disease detection
   */
  async createModel(config: ModelConfig): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.conv2d({
      inputShape: config.inputShape,
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Second convolutional block
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Third convolutional block
    model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Fourth convolutional block
    model.add(tf.layers.conv2d({
      filters: 256,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Dense layers
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 512, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: config.numClasses, activation: 'softmax' }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.models.set(config.name, model);
    return model;
  }

  /**
   * Create a ResNet-style model for better performance
   */
  async createResNetModel(config: ModelConfig): Promise<tf.LayersModel> {
    const inputs = tf.input({ shape: config.inputShape });

    // Initial convolution
    let x = tf.layers.conv2d({
      filters: 64,
      kernelSize: 7,
      strides: 2,
      padding: 'same',
      activation: 'relu'
    }).apply(inputs) as tf.SymbolicTensor;
    
    x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor;
    x = tf.layers.maxPooling2d({ poolSize: 3, strides: 2, padding: 'same' }).apply(x) as tf.SymbolicTensor;

    // Residual blocks
    x = this.residualBlock(x, 64, 1);
    x = this.residualBlock(x, 128, 2);
    x = this.residualBlock(x, 256, 2);
    x = this.residualBlock(x, 512, 2);

    // Global average pooling and output
    x = tf.layers.globalAveragePooling2d().apply(x) as tf.SymbolicTensor;
    x = tf.layers.dense({ units: config.numClasses, activation: 'softmax' }).apply(x) as tf.SymbolicTensor;

    const model = tf.model({ inputs, outputs: x });
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.models.set(config.name, model);
    return model;
  }

  /**
   * Create a residual block for ResNet architecture
   */
  private residualBlock(x: tf.SymbolicTensor, filters: number, strides: number): tf.SymbolicTensor {
    const shortcut = x;

    // First convolution
    let y = tf.layers.conv2d({
      filters,
      kernelSize: 3,
      strides,
      padding: 'same',
      activation: 'relu'
    }).apply(x) as tf.SymbolicTensor;
    
    y = tf.layers.batchNormalization().apply(y) as tf.SymbolicTensor;

    // Second convolution
    y = tf.layers.conv2d({
      filters,
      kernelSize: 3,
      padding: 'same',
      activation: 'relu'
    }).apply(y) as tf.SymbolicTensor;
    
    y = tf.layers.batchNormalization().apply(y) as tf.SymbolicTensor;

    // Skip connection
    if (strides > 1) {
      shortcut = tf.layers.conv2d({
        filters,
        kernelSize: 1,
        strides,
        padding: 'same'
      }).apply(shortcut) as tf.SymbolicTensor;
      
      shortcut = tf.layers.batchNormalization().apply(shortcut) as tf.SymbolicTensor;
    }

    return tf.layers.add().apply([y, shortcut]) as tf.SymbolicTensor;
  }

  /**
   * Train a model with the provided data
   */
  async trainModel(
    modelName: string,
    trainImages: tf.Tensor,
    trainLabels: tf.Tensor,
    valImages?: tf.Tensor,
    valLabels?: tf.Tensor,
    config?: Partial<TrainingConfig>,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<tf.History> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    if (this.isTraining.get(modelName)) {
      throw new Error(`Model ${modelName} is already training`);
    }

    this.isTraining.set(modelName, true);
    if (onProgress) {
      this.trainingCallbacks.set(modelName, onProgress);
    }

    const trainingConfig: TrainingConfig = {
      epochs: 50,
      batchSize: 32,
      learningRate: 0.001,
      validationSplit: 0.2,
      optimizer: 'adam',
      lossFunction: 'categoricalCrossentropy',
      metrics: ['accuracy'],
      ...config
    };

    // Update optimizer if specified
    if (config?.learningRate) {
      let optimizer: tf.Optimizer;
      switch (trainingConfig.optimizer) {
        case 'adam':
          optimizer = tf.train.adam(trainingConfig.learningRate);
          break;
        case 'sgd':
          optimizer = tf.train.sgd(trainingConfig.learningRate);
          break;
        case 'rmsprop':
          optimizer = tf.train.rmsprop(trainingConfig.learningRate);
          break;
        default:
          optimizer = tf.train.adam(trainingConfig.learningRate);
      }
      model.compile({
        optimizer,
        loss: trainingConfig.lossFunction,
        metrics: trainingConfig.metrics
      });
    }

    const startTime = Date.now();

    try {
      const history = await model.fit(trainImages, trainLabels, {
        epochs: trainingConfig.epochs,
        batchSize: trainingConfig.batchSize,
        validationSplit: valImages && valLabels ? 0 : trainingConfig.validationSplit,
        validationData: valImages && valLabels ? [valImages, valLabels] : undefined,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress: TrainingProgress = {
              epoch: epoch + 1,
              totalEpochs: trainingConfig.epochs,
              currentLoss: logs?.loss || 0,
              currentAccuracy: logs?.acc || logs?.accuracy || 0,
              valLoss: logs?.val_loss || 0,
              valAccuracy: logs?.val_acc || logs?.val_accuracy || 0,
              timeElapsed: Date.now() - startTime,
              estimatedTimeRemaining: ((Date.now() - startTime) / (epoch + 1)) * (trainingConfig.epochs - epoch - 1)
            };

            const callback = this.trainingCallbacks.get(modelName);
            if (callback) {
              callback(progress);
            }

            // Store metrics
            const metrics: ModelMetrics = {
              loss: logs?.loss || 0,
              accuracy: logs?.acc || logs?.accuracy || 0,
              valLoss: logs?.val_loss || 0,
              valAccuracy: logs?.val_acc || logs?.val_accuracy || 0
            };

            if (!this.trainingHistory.has(modelName)) {
              this.trainingHistory.set(modelName, []);
            }
            this.trainingHistory.get(modelName)!.push(metrics);
          }
        }
      });

      return history;
    } finally {
      this.isTraining.set(modelName, false);
      this.trainingCallbacks.delete(modelName);
    }
  }

  /**
   * Make predictions with a trained model
   */
  async predict(modelName: string, images: tf.Tensor): Promise<tf.Tensor> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    return model.predict(images) as tf.Tensor;
  }

  /**
   * Get model summary
   */
  getModelSummary(modelName: string): string {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    return model.summary();
  }

  /**
   * Save model to browser storage
   */
  async saveModel(modelName: string): Promise<void> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    await model.save(`localstorage://${modelName}`);
  }

  /**
   * Load model from browser storage
   */
  async loadModel(modelName: string): Promise<tf.LayersModel> {
    try {
      const model = await loadLayersModel(`localstorage://${modelName}`);
      this.models.set(modelName, model);
      return model;
    } catch (error) {
      throw new Error(`Failed to load model ${modelName}: ${error}`);
    }
  }

  /**
   * Get training history for a model
   */
  getTrainingHistory(modelName: string): ModelMetrics[] {
    return this.trainingHistory.get(modelName) || [];
  }

  /**
   * Check if a model is currently training
   */
  isModelTraining(modelName: string): boolean {
    return this.isTraining.get(modelName) || false;
  }

  /**
   * Get all available models
   */
  getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Delete a model
   */
  deleteModel(modelName: string): void {
    this.models.delete(modelName);
    this.trainingHistory.delete(modelName);
    this.isTraining.delete(modelName);
    this.trainingCallbacks.delete(modelName);
  }

  /**
   * Clear all models and data
   */
  clearAll(): void {
    this.models.clear();
    this.trainingHistory.clear();
    this.isTraining.clear();
    this.trainingCallbacks.clear();
  }

  /**
   * Get model performance metrics
   */
  async evaluateModel(
    modelName: string,
    testImages: tf.Tensor,
    testLabels: tf.Tensor
  ): Promise<ModelMetrics> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    const evaluation = model.evaluate(testImages, testLabels) as tf.Scalar[];
    const loss = await evaluation[0].data();
    const accuracy = await evaluation[1].data();

    return {
      loss: loss[0],
      accuracy: accuracy[0],
      valLoss: 0,
      valAccuracy: 0
    };
  }
}

// Singleton instance
export const tensorflowModelManager = new TensorFlowModelManager();