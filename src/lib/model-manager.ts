import { RetinaCNN } from './cnn-model'
import { ModelEvaluator, EvaluationResult } from './model-evaluator'

export interface ModelVersion {
  id: string
  name: string
  diseaseType: 'glaucoma' | 'retinopathy' | 'cataract'
  version: string
  createdAt: string
  accuracy: number
  loss: number
  parameters: number
  trainingTime: number
  epochs: number
  datasetSize: number
  isCurrent: boolean
  description?: string
  tags: string[]
}

export interface ModelMetrics {
  accuracy: number
  precision: number[]
  recall: number[]
  f1Score: number[]
  confusionMatrix: number[][]
  auc: number
  loss: number
}

export class ModelManager {
  private static readonly STORAGE_KEY = 'retina_model_versions'
  private models: Map<string, RetinaCNN> = new Map()
  private versions: ModelVersion[] = []

  constructor() {
    this.loadVersions()
  }

  /**
   * Register a new model version
   */
  async registerModel(
    model: RetinaCNN,
    diseaseType: 'glaucoma' | 'retinopathy' | 'cataract',
    version: string,
    metrics: {
      accuracy: number
      loss: number
      trainingTime: number
      epochs: number
      datasetSize: number
    },
    description?: string,
    tags: string[] = []
  ): Promise<string> {
    const parameters = await model.getParameterCount()
    const modelId = `${diseaseType}_${version}_${Date.now()}`

    const modelVersion: ModelVersion = {
      id: modelId,
      name: `${diseaseType.charAt(0).toUpperCase() + diseaseType.slice(1)} Model v${version}`,
      diseaseType,
      version,
      createdAt: new Date().toISOString(),
      accuracy: metrics.accuracy,
      loss: metrics.loss,
      parameters,
      trainingTime: metrics.trainingTime,
      epochs: metrics.epochs,
      datasetSize: metrics.datasetSize,
      isCurrent: false,
      description,
      tags
    }

    // Save model to local storage
    await model.saveModel(modelId)

    // Store model instance
    this.models.set(modelId, model)

    // Add to versions list
    this.versions.push(modelVersion)
    
    // Set as current for this disease type
    this.setCurrentModel(diseaseType, modelId)

    // Save versions metadata
    this.saveVersions()

    return modelId
  }

  /**
   * Load a model by ID
   */
  async loadModel(modelId: string): Promise<RetinaCNN> {
    // Check if already loaded
    if (this.models.has(modelId)) {
      return this.models.get(modelId)!
    }

    // Load from storage
    const model = new RetinaCNN({
      inputShape: [224, 224, 3],
      numClasses: this.getNumClasses(modelId),
      learningRate: 0.001,
      batchSize: 32,
      epochs: 50
    })

    await model.loadModel(modelId)
    this.models.set(modelId, model)

    return model
  }

  /**
   * Get current model for disease type
   */
  getCurrentModel(diseaseType: 'glaucoma' | 'retinopathy' | 'cataract'): ModelVersion | null {
    return this.versions.find(v => v.diseaseType === diseaseType && v.isCurrent) || null
  }

  /**
   * Set current model for disease type
   */
  setCurrentModel(diseaseType: 'glaucoma' | 'retinopathy' | 'cataract', modelId: string): void {
    // Unset previous current model
    this.versions.forEach(v => {
      if (v.diseaseType === diseaseType) {
        v.isCurrent = false
      }
    })

    // Set new current model
    const model = this.versions.find(v => v.id === modelId)
    if (model) {
      model.isCurrent = true
      this.saveVersions()
    }
  }

  /**
   * Get all versions for a disease type
   */
  getVersionsForDisease(diseaseType: 'glaucoma' | 'retinopathy' | 'cataract'): ModelVersion[] {
    return this.versions
      .filter(v => v.diseaseType === diseaseType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * Get all versions
   */
  getAllVersions(): ModelVersion[] {
    return this.versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * Delete a model version
   */
  async deleteModel(modelId: string): Promise<void> {
    const versionIndex = this.versions.findIndex(v => v.id === modelId)
    if (versionIndex === -1) return

    const version = this.versions[versionIndex]

    // Don't delete if it's the current model
    if (version.isCurrent) {
      throw new Error('Cannot delete current model. Set another model as current first.')
    }

    // Remove from versions
    this.versions.splice(versionIndex, 1)

    // Remove from loaded models
    if (this.models.has(modelId)) {
      const model = this.models.get(modelId)!
      model.dispose()
      this.models.delete(modelId)
    }

    // Remove from local storage
    try {
      localStorage.removeItem(`tensorflowjs_models/localstorage://${modelId}`)
    } catch (error) {
      console.warn('Failed to remove model from storage:', error)
    }

    this.saveVersions()
  }

  /**
   * Compare two models
   */
  async compareModels(modelId1: string, modelId2: string): Promise<{
    model1: ModelVersion
    model2: ModelVersion
    comparison: {
      accuracyDiff: number
      lossDiff: number
      parametersDiff: number
      trainingTimeDiff: number
      better: 'model1' | 'model2' | 'tie'
    }
  }> {
    const model1 = this.versions.find(v => v.id === modelId1)
    const model2 = this.versions.find(v => v.id === modelId2)

    if (!model1 || !model2) {
      throw new Error('One or both models not found')
    }

    const accuracyDiff = model1.accuracy - model2.accuracy
    const lossDiff = model1.loss - model2.loss
    const parametersDiff = model1.parameters - model2.parameters
    const trainingTimeDiff = model1.trainingTime - model2.trainingTime

    // Determine which is better (simplified - could be more sophisticated)
    let better: 'model1' | 'model2' | 'tie' = 'tie'
    if (Math.abs(accuracyDiff) > 0.01) {
      better = accuracyDiff > 0 ? 'model1' : 'model2'
    }

    return {
      model1,
      model2,
      comparison: {
        accuracyDiff,
        lossDiff,
        parametersDiff,
        trainingTimeDiff,
        better
      }
    }
  }

  /**
   * Export model metadata
   */
  exportModelMetadata(modelId: string): string {
    const version = this.versions.find(v => v.id === modelId)
    if (!version) {
      throw new Error('Model not found')
    }

    return JSON.stringify({
      ...version,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  /**
   * Import model metadata
   */
  importModelMetadata(metadata: any): void {
    try {
      const version: ModelVersion = {
        id: metadata.id,
        name: metadata.name,
        diseaseType: metadata.diseaseType,
        version: metadata.version,
        createdAt: metadata.createdAt,
        accuracy: metadata.accuracy,
        loss: metadata.loss,
        parameters: metadata.parameters,
        trainingTime: metadata.trainingTime,
        epochs: metadata.epochs,
        datasetSize: metadata.datasetSize,
        isCurrent: false,
        description: metadata.description,
        tags: metadata.tags || []
      }

      // Check if already exists
      if (this.versions.some(v => v.id === version.id)) {
        throw new Error('Model version already exists')
      }

      this.versions.push(version)
      this.saveVersions()
    } catch (error) {
      throw new Error(`Failed to import model metadata: ${error}`)
    }
  }

  /**
   * Get model statistics
   */
  getStatistics(): {
    totalModels: number
    modelsByDisease: { [key: string]: number }
    averageAccuracy: number
    bestModel: ModelVersion | null
    latestModel: ModelVersion | null
  } {
    const modelsByDisease: { [key: string]: number } = {}
    let totalAccuracy = 0

    this.versions.forEach(version => {
      modelsByDisease[version.diseaseType] = (modelsByDisease[version.diseaseType] || 0) + 1
      totalAccuracy += version.accuracy
    })

    const bestModel = this.versions.reduce((best, current) => 
      !best || current.accuracy > best.accuracy ? current : best, null as ModelVersion | null
    )

    const latestModel = this.versions.reduce((latest, current) => 
      !latest || new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest, null as ModelVersion | null
    )

    return {
      totalModels: this.versions.length,
      modelsByDisease,
      averageAccuracy: this.versions.length > 0 ? totalAccuracy / this.versions.length : 0,
      bestModel,
      latestModel
    }
  }

  /**
   * Cleanup old models
   */
  async cleanupOldModels(keepCount: number = 5): Promise<void> {
    const modelsByDisease = new Map<string, ModelVersion[]>()

    // Group models by disease type
    this.versions.forEach(version => {
      if (!modelsByDisease.has(version.diseaseType)) {
        modelsByDisease.set(version.diseaseType, [])
      }
      modelsByDisease.get(version.diseaseType)!.push(version)
    })

    // Sort each group by date and keep only the latest N
    for (const [diseaseType, models] of modelsByDisease) {
      models.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      const modelsToDelete = models.slice(keepCount)
      for (const model of modelsToDelete) {
        if (!model.isCurrent) {
          await this.deleteModel(model.id)
        }
      }
    }
  }

  /**
   * Get number of classes for model
   */
  private getNumClasses(modelId: string): number {
    const version = this.versions.find(v => v.id === modelId)
    if (!version) return 2

    switch (version.diseaseType) {
      case 'glaucoma': return 2
      case 'retinopathy': return 5
      case 'cataract': return 3
      default: return 2
    }
  }

  /**
   * Load versions from local storage
   */
  private loadVersions(): void {
    try {
      const stored = localStorage.getItem(ModelManager.STORAGE_KEY)
      if (stored) {
        this.versions = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load model versions:', error)
      this.versions = []
    }
  }

  /**
   * Save versions to local storage
   */
  private saveVersions(): void {
    try {
      localStorage.setItem(ModelManager.STORAGE_KEY, JSON.stringify(this.versions))
    } catch (error) {
      console.error('Failed to save model versions:', error)
    }
  }

  /**
   * Dispose all loaded models
   */
  dispose(): void {
    for (const model of this.models.values()) {
      model.dispose()
    }
    this.models.clear()
  }
}