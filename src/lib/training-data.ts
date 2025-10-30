/**
 * Training Data Structure for Eye Illness Detection
 * 
 * This file provides a structured way to organize and manage training images
 * for the AI model. After downloading this code, you can add your training
 * images in the specified folders and update the configurations below.
 */

export interface TrainingImage {
  id: string;
  filename: string;
  category: 'normal' | 'illness';
  subcategory?: string;
  label: string;
  description?: string;
  source?: string;
  metadata?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    condition?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    camera?: string;
    resolution?: string;
  };
}

export interface TrainingDataset {
  name: string;
  description: string;
  version: string;
  created: string;
  updated: string;
  categories: TrainingCategory[];
  totalImages: number;
  splitRatios: {
    training: number;
    validation: number;
    testing: number;
  };
}

export interface TrainingCategory {
  name: string;
  description: string;
  path: string;
  images: TrainingImage[];
  count: number;
}

/**
 * TRAINING DATA PLACEHOLDER CONFIGURATION
 * 
 * After downloading this code, follow these steps:
 * 
 * 1. Create the following folder structure in your project:
 *    /public/training-data/
 *    ├── normal/
 *    │   ├── healthy-001.jpg
 *    │   ├── healthy-002.jpg
 *    │   └── ...
 *    ├── illness/
 *    │   ├── diabetic-retinopathy/
 *    │   │   ├── mild-001.jpg
 *    │   │   ├── moderate-001.jpg
 *    │   │   └── severe-001.jpg
 *    │   ├── glaucoma/
 *    │   │   ├── early-001.jpg
 *    │   │   ├── advanced-001.jpg
 *    │   │   └── ...
 *    │   ├── cataract/
 *    │   │   ├── nuclear-001.jpg
 *    │   │   ├── cortical-001.jpg
 *    │   │   └── ...
 *    │   └── amd/
 *    │       ├── dry-001.jpg
 *    │       ├── wet-001.jpg
 *    │       └── ...
 *    └── metadata/
 *        ├── annotations.json
 *        └── labels.csv
 * 
 * 2. Add your training images to the appropriate folders
 * 
 * 3. Update the configurations below with your actual image data
 */

export const TRAINING_DATA_CONFIG: TrainingDataset = {
  name: "Eye Illness Detection Dataset",
  description: "Retinal images for detecting various eye conditions",
  version: "1.0.0",
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  categories: [
    {
      name: "Normal",
      description: "Healthy retinal images with no detectable conditions",
      path: "/training-data/normal/",
      images: [
        // PLACEHOLDER: Add your normal eye images here
        // Example:
        // {
        //   id: "normal-001",
        //   filename: "healthy-001.jpg",
        //   category: "normal",
        //   label: "Healthy Retina",
        //   description: "Normal retinal image with no abnormalities",
        //   metadata: {
        //     age: 45,
        //     gender: "female",
        //     camera: "fundus-camera",
        //     resolution: "1920x1080"
        //   }
        // }
      ],
      count: 0 // Update with actual count
    },
    {
      name: "Diabetic Retinopathy",
      description: "Images showing diabetic retinopathy at various stages",
      path: "/training-data/illness/diabetic-retinopathy/",
      images: [
        // PLACEHOLDER: Add your diabetic retinopathy images here
        // Example:
        // {
        //   id: "dr-mild-001",
        //   filename: "mild-001.jpg",
        //   category: "illness",
        //   subcategory: "diabetic-retinopathy",
        //   label: "Mild Diabetic Retinopathy",
        //   description: "Early stage diabetic retinopathy with microaneurysms",
        //   metadata: {
        //     age: 62,
        //     gender: "male",
        //     condition: "diabetic-retinopathy",
        //     severity: "mild",
        //     camera: "fundus-camera",
        //     resolution: "1920x1080"
        //   }
        // }
      ],
      count: 0 // Update with actual count
    },
    {
      name: "Glaucoma",
      description: "Images showing glaucoma progression",
      path: "/training-data/illness/glaucoma/",
      images: [
        // PLACEHOLDER: Add your glaucoma images here
      ],
      count: 0 // Update with actual count
    },
    {
      name: "Cataract",
      description: "Images showing various types of cataracts",
      path: "/training-data/illness/cataract/",
      images: [
        // PLACEHOLDER: Add your cataract images here
      ],
      count: 0 // Update with actual count
    },
    {
      name: "Age-Related Macular Degeneration",
      description: "Images showing AMD (dry and wet forms)",
      path: "/training-data/illness/amd/",
      images: [
        // PLACEHOLDER: Add your AMD images here
      ],
      count: 0 // Update with actual count
    }
  ],
  totalImages: 0, // Update with actual total count
  splitRatios: {
    training: 0.7,
    validation: 0.15,
    testing: 0.15
  }
};

/**
 * Training Data Manager Class
 * 
 * This class provides methods to manage and work with training data
 */
export class TrainingDataManager {
  private config: TrainingDataset;

  constructor(config: TrainingDataset = TRAINING_DATA_CONFIG) {
    this.config = config;
  }

  /**
   * Get all training images
   */
  getAllImages(): TrainingImage[] {
    return this.config.categories.flatMap(category => category.images);
  }

  /**
   * Get images by category
   */
  getImagesByCategory(categoryName: string): TrainingImage[] {
    const category = this.config.categories.find(cat => cat.name === categoryName);
    return category?.images || [];
  }

  /**
   * Get images by condition
   */
  getImagesByCondition(condition: string): TrainingImage[] {
    return this.getAllImages().filter(img => img.metadata?.condition === condition);
  }

  /**
   * Get images by severity
   */
  getImagesBySeverity(severity: string): TrainingImage[] {
    return this.getAllImages().filter(img => img.metadata?.severity === severity);
  }

  /**
   * Get training statistics
   */
  getStatistics() {
    const stats = {
      totalImages: this.config.totalImages,
      categories: this.config.categories.map(cat => ({
        name: cat.name,
        count: cat.count,
        percentage: this.config.totalImages > 0 ? (cat.count / this.config.totalImages * 100).toFixed(1) : '0'
      })),
      splitCounts: {
        training: Math.floor(this.config.totalImages * this.config.splitRatios.training),
        validation: Math.floor(this.config.totalImages * this.config.splitRatios.validation),
        testing: Math.floor(this.config.totalImages * this.config.splitRatios.testing)
      }
    };
    return stats;
  }

  /**
   * Validate training data structure
   */
  validateStructure(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.categories.length) {
      errors.push("No categories defined");
    }

    this.config.categories.forEach(category => {
      if (!category.images.length) {
        errors.push(`Category '${category.name}' has no images`);
      }
      
      category.images.forEach(image => {
        if (!image.filename) {
          errors.push(`Image in category '${category.name}' missing filename`);
        }
        if (!image.label) {
          errors.push(`Image '${image.filename}' missing label`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate training data summary
   */
  generateSummary(): string {
    const stats = this.getStatistics();
    return `
Training Dataset Summary:
- Name: ${this.config.name}
- Version: ${this.config.version}
- Total Images: ${stats.totalImages}
- Categories: ${stats.categories.length}

Category Breakdown:
${stats.categories.map(cat => `- ${cat.name}: ${cat.count} images (${cat.percentage}%)`).join('\n')}

Data Split:
- Training: ${stats.splitCounts.training} images (${(this.config.splitRatios.training * 100).toFixed(1)}%)
- Validation: ${stats.splitCounts.validation} images (${(this.config.splitRatios.validation * 100).toFixed(1)}%)
- Testing: ${stats.splitCounts.testing} images (${(this.config.splitRatios.testing * 100).toFixed(1)}%)
    `.trim();
  }
}

/**
 * Export singleton instance
 */
export const trainingDataManager = new TrainingDataManager();

/**
 * Utility function to load training data from API
 * This can be used to dynamically load training data from your backend
 */
export async function loadTrainingData(): Promise<TrainingDataset> {
  try {
    // In a real implementation, this would fetch from your API
    // const response = await fetch('/api/training-data');
    // return await response.json();
    
    // For now, return the static configuration
    return TRAINING_DATA_CONFIG;
  } catch (error) {
    console.error('Failed to load training data:', error);
    throw error;
  }
}

/**
 * Utility function to save training data configuration
 */
export async function saveTrainingData(config: TrainingDataset): Promise<void> {
  try {
    // In a real implementation, this would save to your backend
    // await fetch('/api/training-data', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config)
    // });
    
    console.log('Training data configuration saved:', config.name);
  } catch (error) {
    console.error('Failed to save training data:', error);
    throw error;
  }
}