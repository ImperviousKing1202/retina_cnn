import * as tf from '@tensorflow/tfjs';
import { tensorflowModelManager } from './tensorflow-model-manager';

export interface InferenceResult {
  predictions: number[];
  confidence: number;
  className: string;
  classProbabilities: Record<string, number>;
  processingTime: number;
  modelUsed: string;
}

export interface InferenceConfig {
  modelName: string;
  inputSize: number;
  preprocessing: {
    normalize: boolean;
    centerCrop: boolean;
    resizeMethod: 'bilinear' | 'nearest' | 'bicubic';
    mean?: number[];
    std?: number[];
  };
  postprocessing: {
    softmax: boolean;
    topK: number;
    confidenceThreshold: number;
  };
}

export interface BatchInferenceResult {
  results: InferenceResult[];
  averageConfidence: number;
  processingTime: number;
  throughput: number; // images per second
}

export class RealtimeInferenceEngine {
  private models: Map<string, tf.LayersModel> = new Map();
  private classNames: Map<string, string[]> = new Map();
  private isInitialized: boolean = false;
  private preprocessingCache: Map<string, ImageData> = new Map();

  /**
   * Initialize the inference engine
   */
  async initialize(configs: InferenceConfig[]): Promise<void> {
    for (const config of configs) {
      try {
        // Try to load model from storage
        const model = await tensorflowModelManager.loadModel(config.modelName);
        this.models.set(config.modelName, model);
      } catch (error) {
        console.warn(`Model ${config.modelName} not found in storage, using memory model`);
        const model = tensorflowModelManager.getAvailableModels().includes(config.modelName)
          ? tensorflowModelManager['models'].get(config.modelName)
          : null;
        
        if (model) {
          this.models.set(config.modelName, model);
        } else {
          throw new Error(`Model ${config.modelName} not available`);
        }
      }
    }

    // Set default class names
    this.classNames.set('default', ['normal', 'glaucoma', 'diabetic-retinopathy', 'cataract']);
    this.isInitialized = true;
  }

  /**
   * Set class names for a model
   */
  setClassNames(modelName: string, classNames: string[]): void {
    this.classNames.set(modelName, classNames);
  }

  /**
   * Preprocess image for inference
   */
  private preprocessImage(
    image: HTMLImageElement | ImageBitmap | ImageData,
    config: InferenceConfig
  ): tf.Tensor {
    let tensor: tf.Tensor;

    // Convert to tensor
    if (image instanceof ImageData) {
      tensor = tf.browser.fromPixels(image);
    } else {
      tensor = tf.browser.fromPixels(image);
    }

    // Resize
    tensor = tensor.resizeBilinear([config.inputSize, config.inputSize]);

    // Center crop if needed
    if (config.preprocessing.centerCrop) {
      const size = Math.min(tensor.shape[0], tensor.shape[1]);
      const offsetH = Math.floor((tensor.shape[0] - size) / 2);
      const offsetW = Math.floor((tensor.shape[1] - size) / 2);
      tensor = tf.slice(tensor, [offsetH, offsetW, 0], [size, size, 3]);
      tensor = tensor.resizeBilinear([config.inputSize, config.inputSize]);
    }

    // Convert to float and normalize
    tensor = tensor.toFloat();

    if (config.preprocessing.normalize) {
      if (config.preprocessing.mean && config.preprocessing.std) {
        // Standardization
        const mean = tf.tensor(config.preprocessing.mean);
        const std = tf.tensor(config.preprocessing.std);
        tensor = tensor.sub(mean).div(std);
        mean.dispose();
        std.dispose();
      } else {
        // Simple normalization to [0, 1]
        tensor = tensor.div(255.0);
      }
    }

    // Add batch dimension
    tensor = tensor.expandDims(0);

    return tensor;
  }

  /**
   * Postprocess model output
   */
  private postprocessOutput(
    output: tf.Tensor,
    config: InferenceConfig,
    modelName: string
  ): {
    predictions: number[];
    className: string;
    classProbabilities: Record<string, number>;
    confidence: number;
  } {
    let probabilities = output.dataSync();

    // Apply softmax if needed
    if (config.postprocessing.softmax) {
      const softmax = tf.softmax(output);
      probabilities = softmax.dataSync();
      softmax.dispose();
    }

    const classNames = this.classNames.get(modelName) || this.classNames.get('default') || [];
    
    // Create class probabilities object
    const classProbabilities: Record<string, number> = {};
    for (let i = 0; i < classNames.length; i++) {
      classProbabilities[classNames[i]] = probabilities[i] || 0;
    }

    // Get top K predictions
    const indexedProbs = probabilities.map((prob, index) => ({ prob, index }));
    indexedProbs.sort((a, b) => b.prob - a.prob);
    const topK = indexedProbs.slice(0, config.postprocessing.topK);

    const predictions = topK.map(item => item.prob);
    const topClass = topK[0];
    const className = classNames[topClass.index] || 'unknown';
    const confidence = topClass.prob;

    return {
      predictions,
      className,
      classProbabilities,
      confidence
    };
  }

  /**
   * Run inference on a single image
   */
  async runInference(
    image: HTMLImageElement | ImageBitmap | ImageData,
    config: InferenceConfig
  ): Promise<InferenceResult> {
    if (!this.isInitialized) {
      throw new Error('Inference engine not initialized');
    }

    const model = this.models.get(config.modelName);
    if (!model) {
      throw new Error(`Model ${config.modelName} not found`);
    }

    const startTime = performance.now();

    // Preprocess
    const input = this.preprocessImage(image, config);

    // Run inference
    const output = model.predict(input) as tf.Tensor;

    // Postprocess
    const result = this.postprocessOutput(output, config, config.modelName);

    // Clean up
    input.dispose();
    output.dispose();

    const processingTime = performance.now() - startTime;

    return {
      ...result,
      processingTime,
      modelUsed: config.modelName
    };
  }

  /**
   * Run inference on multiple images (batch)
   */
  async runBatchInference(
    images: (HTMLImageElement | ImageBitmap | ImageData)[],
    config: InferenceConfig
  ): Promise<BatchInferenceResult> {
    const startTime = performance.now();
    const results: InferenceResult[] = [];

    for (const image of images) {
      const result = await this.runInference(image, config);
      results.push(result);
    }

    const totalTime = performance.now() - startTime;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const throughput = results.length / (totalTime / 1000); // images per second

    return {
      results,
      averageConfidence,
      processingTime: totalTime,
      throughput
    };
  }

  /**
   * Run real-time inference on video stream
   */
  async runRealtimeInference(
    videoElement: HTMLVideoElement,
    config: InferenceConfig,
    onResult: (result: InferenceResult) => void,
    fps: number = 30
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Inference engine not initialized');
    }

    const model = this.models.get(config.modelName);
    if (!model) {
      throw new Error(`Model ${config.modelName} not found`);
    }

    const interval = 1000 / fps;
    let lastTime = 0;

    const processFrame = async (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        // Create canvas to capture video frame
        const canvas = document.createElement('canvas');
        canvas.width = config.inputSize;
        canvas.height = config.inputSize;
        const ctx = canvas.getContext('2d')!;

        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, config.inputSize, config.inputSize);
        const imageData = ctx.getImageData(0, 0, config.inputSize, config.inputSize);

        // Run inference
        const result = await this.runInference(imageData, config);
        onResult(result);

        lastTime = currentTime;
      }

      // Continue processing
      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);
  }

  /**
   * Get model information
   */
  getModelInfo(modelName: string): any {
    const model = this.models.get(modelName);
    if (!model) {
      return null;
    }

    return {
      name: modelName,
      inputShape: model.inputs[0].shape,
      outputShape: model.outputs[0].shape,
      memoryUsage: tf.memory(),
      classNames: this.classNames.get(modelName) || this.classNames.get('default') || []
    };
  }

  /**
   * Get all available models
   */
  getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Check if engine is initialized
   */
  isEngineInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): any {
    return tf.memory();
  }

  /**
   * Clear memory
   */
  clearMemory(): void {
    tf.disposeVariables();
    this.preprocessingCache.clear();
  }

  /**
   * Warm up model (run dummy inference)
   */
  async warmupModel(config: InferenceConfig): Promise<void> {
    const model = this.models.get(config.modelName);
    if (!model) {
      throw new Error(`Model ${config.modelName} not found`);
    }

    // Create dummy input
    const dummyInput = tf.zeros([1, config.inputSize, config.inputSize, 3]);
    
    // Run dummy inference
    const dummyOutput = model.predict(dummyInput) as tf.Tensor;
    
    // Clean up
    dummyInput.dispose();
    dummyOutput.dispose();
  }

  /**
   * Benchmark model performance
   */
  async benchmarkModel(
    config: InferenceConfig,
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    throughput: number;
  }> {
    const times: number[] = [];

    // Create dummy input
    const dummyInput = tf.zeros([1, config.inputSize, config.inputSize, 3]);

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const output = this.models.get(config.modelName)!.predict(dummyInput) as tf.Tensor;
      
      const endTime = performance.now();
      times.push(endTime - startTime);
      
      output.dispose();
    }

    dummyInput.dispose();

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = 1000 / averageTime; // inferences per second

    return {
      averageTime,
      minTime,
      maxTime,
      throughput
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.models.clear();
    this.classNames.clear();
    this.preprocessingCache.clear();
    tf.disposeVariables();
    this.isInitialized = false;
  }
}

// Singleton instance
export const realtimeInferenceEngine = new RealtimeInferenceEngine();