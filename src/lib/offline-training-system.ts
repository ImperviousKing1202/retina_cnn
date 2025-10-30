import * as tf from '@tensorflow/tfjs';
import { tensorflowModelManager, ModelConfig, TrainingConfig, TrainingProgress } from './tensorflow-model-manager';

export interface DatasetItem {
  id: string;
  image: HTMLImageElement | ImageBitmap;
  label: string;
  category: 'normal' | 'glaucoma' | 'diabetic-retinopathy' | 'cataract';
  metadata?: {
    quality?: 'excellent' | 'good' | 'fair' | 'poor';
    age?: number;
    gender?: 'male' | 'female' | 'other';
    notes?: string;
  };
}

export interface AugmentationConfig {
  rotation: boolean;
  flip: boolean;
  brightness: boolean;
  contrast: boolean;
  zoom: boolean;
  noise: boolean;
  blur: boolean;
  rotationRange: number;
  brightnessRange: number;
  contrastRange: number;
  zoomRange: number;
  noiseLevel: number;
  blurLevel: number;
}

export interface TrainingDataset {
  trainImages: tf.Tensor;
  trainLabels: tf.Tensor;
  valImages: tf.Tensor;
  valLabels: tf.Tensor;
  testImages: tf.Tensor;
  testLabels: tf.Tensor;
  classNames: string[];
}

export class OfflineTrainingSystem {
  private datasets: Map<string, DatasetItem[]> = new Map();
  private augmentedDatasets: Map<string, DatasetItem[]> = new Map();
  private isProcessing: boolean = false;

  /**
   * Add images to dataset
   */
  async addImagesToDataset(
    datasetName: string,
    images: DatasetItem[]
  ): Promise<void> {
    if (!this.datasets.has(datasetName)) {
      this.datasets.set(datasetName, []);
    }
    
    const dataset = this.datasets.get(datasetName)!;
    dataset.push(...images);
  }

  /**
   * Get dataset by name
   */
  getDataset(datasetName: string): DatasetItem[] {
    return this.datasets.get(datasetName) || [];
  }

  /**
   * Get all dataset names
   */
  getDatasetNames(): string[] {
    return Array.from(this.datasets.keys());
  }

  /**
   * Clear dataset
   */
  clearDataset(datasetName: string): void {
    this.datasets.delete(datasetName);
    this.augmentedDatasets.delete(datasetName);
  }

  /**
   * Apply data augmentation to dataset
   */
  async augmentDataset(
    datasetName: string,
    config: AugmentationConfig,
    augmentationFactor: number = 2
  ): Promise<DatasetItem[]> {
    const originalDataset = this.datasets.get(datasetName);
    if (!originalDataset) {
      throw new Error(`Dataset ${datasetName} not found`);
    }

    this.isProcessing = true;
    const augmentedImages: DatasetItem[] = [];

    try {
      for (const item of originalDataset) {
        // Add original
        augmentedImages.push(item);

        // Create augmented versions
        for (let i = 0; i < augmentationFactor; i++) {
          const augmentedImage = await this.applyAugmentation(item.image, config);
          augmentedImages.push({
            ...item,
            id: `${item.id}_aug_${i}`,
            image: augmentedImage
          });
        }
      }

      this.augmentedDatasets.set(datasetName, augmentedImages);
      return augmentedImages;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Apply augmentation to a single image
   */
  private async applyAugmentation(
    image: HTMLImageElement | ImageBitmap,
    config: AugmentationConfig
  ): Promise<ImageBitmap> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Apply transformations
    ctx.save();
    
    // Rotation
    if (config.rotation) {
      const angle = (Math.random() - 0.5) * config.rotationRange * Math.PI / 180;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Flip
    if (config.flip && Math.random() > 0.5) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
    
    // Draw image
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    
    // Apply filters
    if (config.brightness || config.contrast) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        if (config.brightness) {
          const brightness = 1 + (Math.random() - 0.5) * config.brightnessRange;
          data[i] = Math.min(255, data[i] * brightness);
          data[i + 1] = Math.min(255, data[i + 1] * brightness);
          data[i + 2] = Math.min(255, data[i + 2] * brightness);
        }
        
        // Contrast
        if (config.contrast) {
          const contrast = 1 + (Math.random() - 0.5) * config.contrastRange;
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Noise
    if (config.noise) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * config.noiseLevel * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Blur
    if (config.blur && Math.random() > 0.5) {
      ctx.filter = `blur(${config.blurLevel}px)`;
      ctx.drawImage(canvas, 0, 0);
    }
    
    return createImageBitmap(canvas);
  }

  /**
   * Prepare dataset for training
   */
  async prepareTrainingDataset(
    datasetName: string,
    imageSize: number = 224,
    validationSplit: number = 0.2,
    testSplit: number = 0.1
  ): Promise<TrainingDataset> {
    const dataset = this.augmentedDatasets.get(datasetName) || this.datasets.get(datasetName);
    if (!dataset) {
      throw new Error(`Dataset ${datasetName} not found`);
    }

    // Get unique classes
    const classes = Array.from(new Set(dataset.map(item => item.category)));
    const classNames = classes.length > 0 ? classes : ['normal', 'glaucoma', 'diabetic-retinopathy', 'cataract'];

    // Shuffle dataset
    const shuffled = [...dataset].sort(() => Math.random() - 0.5);

    // Split dataset
    const totalSize = shuffled.length;
    const testSize = Math.floor(totalSize * testSplit);
    const valSize = Math.floor(totalSize * validationSplit);
    const trainSize = totalSize - testSize - valSize;

    const trainData = shuffled.slice(0, trainSize);
    const valData = shuffled.slice(trainSize, trainSize + valSize);
    const testData = shuffled.slice(trainSize + valSize);

    // Process images and create tensors
    const processBatch = async (items: DatasetItem[]) => {
      const images: tf.Tensor[] = [];
      const labels: number[][] = [];

      for (const item of items) {
        // Convert image to tensor
        const imageTensor = tf.browser.fromPixels(item.image)
          .resizeBilinear([imageSize, imageSize])
          .toFloat()
          .div(255.0);
        
        images.push(imageTensor);

        // Create one-hot encoded label
        const classIndex = classNames.indexOf(item.category);
        const label = new Array(classNames.length).fill(0);
        label[classIndex] = 1;
        labels.push(label);
      }

      return {
        images: tf.stack(images),
        labels: tf.tensor2d(labels)
      };
    };

    const trainTensors = await processBatch(trainData);
    const valTensors = await processBatch(valData);
    const testTensors = await processBatch(testData);

    return {
      trainImages: trainTensors.images,
      trainLabels: trainTensors.labels,
      valImages: valTensors.images,
      valLabels: valTensors.labels,
      testImages: testTensors.images,
      testLabels: testTensors.labels,
      classNames
    };
  }

  /**
   * Train model with offline data
   */
  async trainOfflineModel(
    modelName: string,
    datasetName: string,
    modelConfig: ModelConfig,
    trainingConfig: TrainingConfig,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<void> {
    // Prepare dataset
    const dataset = await this.prepareTrainingDataset(datasetName);

    // Create model
    await tensorflowModelManager.createModel(modelConfig);

    // Train model
    await tensorflowModelManager.trainModel(
      modelName,
      dataset.trainImages,
      dataset.trainLabels,
      dataset.valImages,
      dataset.valLabels,
      trainingConfig,
      onProgress
    );

    // Clean up tensors
    dataset.trainImages.dispose();
    dataset.trainLabels.dispose();
    dataset.valImages.dispose();
    dataset.valLabels.dispose();
    dataset.testImages.dispose();
    dataset.testLabels.dispose();
  }

  /**
   * Evaluate model on test set
   */
  async evaluateOfflineModel(
    modelName: string,
    datasetName: string,
    imageSize: number = 224
  ): Promise<any> {
    const dataset = await this.prepareTrainingDataset(datasetName);
    
    const metrics = await tensorflowModelManager.evaluateModel(
      modelName,
      dataset.testImages,
      dataset.testLabels
    );

    // Clean up tensors
    dataset.trainImages.dispose();
    dataset.trainLabels.dispose();
    dataset.valImages.dispose();
    dataset.valLabels.dispose();
    dataset.testImages.dispose();
    dataset.testLabels.dispose();

    return metrics;
  }

  /**
   * Get dataset statistics
   */
  getDatasetStatistics(datasetName: string): any {
    const dataset = this.datasets.get(datasetName);
    if (!dataset) {
      return null;
    }

    const stats = {
      total: dataset.length,
      categories: {} as Record<string, number>,
      quality: {} as Record<string, number>,
      augmented: this.augmentedDatasets.has(datasetName) ? this.augmentedDatasets.get(datasetName)!.length : 0
    };

    for (const item of dataset) {
      // Category stats
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      
      // Quality stats
      const quality = item.metadata?.quality || 'unknown';
      stats.quality[quality] = (stats.quality[quality] || 0) + 1;
    }

    return stats;
  }

  /**
   * Check if system is processing
   */
  isSystemProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Clear all datasets
   */
  clearAllDatasets(): void {
    this.datasets.clear();
    this.augmentedDatasets.clear();
  }
}

// Singleton instance
export const offlineTrainingSystem = new OfflineTrainingSystem();