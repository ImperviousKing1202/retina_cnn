'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Download, 
  Upload, 
  Play, 
  Square, 
  Trash2, 
  Settings, 
  Activity,
  Zap,
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Cpu,
  HardDrive,
  Plus
} from 'lucide-react';

import { 
  tensorflowModelManager, 
  ModelConfig, 
  TrainingConfig, 
  TrainingProgress 
} from '@/lib/tensorflow-model-manager';
import { 
  offlineTrainingSystem, 
  DatasetItem, 
  AugmentationConfig 
} from '@/lib/offline-training-system';
import { 
  realtimeInferenceEngine, 
  InferenceConfig, 
  InferenceResult 
} from '@/lib/realtime-inference-engine';
import { 
  modelCacheManager, 
  CachedModel 
} from '@/lib/model-cache-manager';

interface TensorFlowIntegrationPanelProps {
  onModelUpdate?: (modelName: string) => void;
  onTrainingComplete?: (modelName: string, metrics: any) => void;
}

export default function TensorFlowIntegrationPanel({ 
  onModelUpdate, 
  onTrainingComplete 
}: TensorFlowIntegrationPanelProps) {
  const [activeTab, setActiveTab] = useState('models');
  const [isLoading, setIsLoading] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [cachedModels, setCachedModels] = useState<CachedModel[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isInference, setIsInference] = useState(false);

  // Initialize TensorFlow and load cache
  useEffect(() => {
    initializeTensorFlow();
  }, []);

  const initializeTensorFlow = async () => {
    setIsLoading(true);
    try {
      // Initialize model cache manager
      await modelCacheManager.initialize();
      
      // Load available models
      const models = tensorflowModelManager.getAvailableModels();
      setAvailableModels(models);
      
      // Load cached models
      const cached = modelCacheManager.getCachedModels();
      setCachedModels(cached);
      
      // Get cache statistics
      const stats = modelCacheManager.getCacheStats();
      setCacheStats(stats);
      
      // Initialize inference engine with available models
      if (models.length > 0) {
        const inferenceConfigs: InferenceConfig[] = models.map(modelName => ({
          modelName,
          inputSize: 224,
          preprocessing: {
            normalize: true,
            centerCrop: false,
            resizeMethod: 'bilinear'
          },
          postprocessing: {
            softmax: true,
            topK: 3,
            confidenceThreshold: 0.5
          }
        }));
        
        await realtimeInferenceEngine.initialize(inferenceConfigs);
      }
    } catch (error) {
      console.error('Failed to initialize TensorFlow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new model
  const createModel = async (config: ModelConfig) => {
    setIsLoading(true);
    try {
      await tensorflowModelManager.createModel(config);
      const models = tensorflowModelManager.getAvailableModels();
      setAvailableModels(models);
      onModelUpdate?.(config.name);
    } catch (error) {
      console.error('Failed to create model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Train model with sample data
  const trainModel = async () => {
    if (availableModels.length === 0) return;
    
    setIsTraining(true);
    const modelName = availableModels[0];
    
    try {
      // Create sample training data
      const trainImages = tf.randomNormal([32, 224, 224, 3]);
      const trainLabels = tf.randomUniform([32, 4]);
      
      const config: TrainingConfig = {
        epochs: 10,
        batchSize: 8,
        learningRate: 0.001,
        validationSplit: 0.2,
        optimizer: 'adam',
        lossFunction: 'categoricalCrossentropy',
        metrics: ['accuracy']
      };
      
      await tensorflowModelManager.trainModel(
        modelName,
        trainImages,
        trainLabels,
        undefined,
        undefined,
        config,
        (progress) => {
          setTrainingProgress(progress);
        }
      );
      
      // Save model to cache
      const model = tensorflowModelManager['models'].get(modelName);
      if (model) {
        await modelCacheManager.addToCache(modelName, model, {
          version: '1.0.0',
          isPretrained: false,
          description: 'Custom trained model',
          tags: ['custom', 'trained']
        });
      }
      
      onTrainingComplete?.(modelName, trainingProgress);
      
      // Clean up tensors
      trainImages.dispose();
      trainLabels.dispose();
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
      setTrainingProgress(null);
    }
  };

  // Run inference on sample image
  const runInference = async () => {
    if (availableModels.length === 0) return;
    
    setIsInference(true);
    const modelName = availableModels[0];
    
    try {
      // Create sample image data
      const sampleImage = tf.randomNormal([224, 224, 3]);
      
      const config: InferenceConfig = {
        modelName,
        inputSize: 224,
        preprocessing: {
          normalize: true,
          centerCrop: false,
          resizeMethod: 'bilinear'
        },
        postprocessing: {
          softmax: true,
          topK: 3,
          confidenceThreshold: 0.5
        }
      };
      
      const result = await realtimeInferenceEngine.runInference(sampleImage, config);
      setInferenceResult(result);
      
      sampleImage.dispose();
    } catch (error) {
      console.error('Inference failed:', error);
    } finally {
      setIsInference(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    setIsLoading(true);
    try {
      await modelCacheManager.clearCache();
      setCachedModels([]);
      const stats = modelCacheManager.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Download pretrained model
  const downloadPretrainedModel = async () => {
    setIsLoading(true);
    try {
      const modelName = 'retina-pretrained-v1';
      const modelUrl = '/models/pretrained-retina-model.json'; // This would be a real URL
      
      await modelCacheManager.downloadPretrainedModel(
        modelName,
        modelUrl,
        {
          version: '1.0.0',
          isPretrained: true,
          description: 'Pretrained retinal disease detection model',
          tags: ['pretrained', 'retina', 'disease-detection'],
          accuracy: 0.94
        }
      );
      
      const cached = modelCacheManager.getCachedModels();
      setCachedModels(cached);
    } catch (error) {
      console.error('Failed to download pretrained model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">TensorFlow Integration</h2>
          <p className="text-muted-foreground">
            Offline ML capabilities with TensorFlow.js
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={realtimeInferenceEngine.isEngineInitialized() ? 'default' : 'secondary'}>
            {realtimeInferenceEngine.isEngineInitialized() ? 'Initialized' : 'Not Initialized'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={initializeTensorFlow}
            disabled={isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="inference">Inference</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Available Models
              </CardTitle>
              <CardDescription>
                Manage your TensorFlow models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {availableModels.length} models available
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createModel({
                        name: `retina-model-${Date.now()}`,
                        inputShape: [224, 224, 3],
                        numClasses: 4,
                        architecture: 'cnn'
                      })}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Model
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadPretrainedModel}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Pretrained
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {availableModels.map((modelName) => (
                      <div
                        key={modelName}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Brain className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{modelName}</p>
                            <p className="text-sm text-muted-foreground">
                              {tensorflowModelManager.isModelTraining(modelName) ? 'Training...' : 'Ready'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {tensorflowModelManager.getTrainingHistory(modelName).length > 0 ? 'Trained' : 'Untrained'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => tensorflowModelManager.deleteModel(modelName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Model Training
              </CardTitle>
              <CardDescription>
                Train models offline with your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Training Status</span>
                  <Badge variant={isTraining ? 'default' : 'secondary'}>
                    {isTraining ? 'Training' : 'Idle'}
                  </Badge>
                </div>
                
                {trainingProgress && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Epoch {trainingProgress.epoch} / {trainingProgress.totalEpochs}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((trainingProgress.epoch / trainingProgress.totalEpochs) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(trainingProgress.epoch / trainingProgress.totalEpochs) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Loss:</span> {trainingProgress.currentLoss.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Accuracy:</span> {(trainingProgress.currentAccuracy * 100).toFixed(2)}%
                      </div>
                      <div>
                        <span className="font-medium">Val Loss:</span> {trainingProgress.valLoss.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Val Accuracy:</span> {(trainingProgress.valAccuracy * 100).toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Time: {Math.round(trainingProgress.timeElapsed / 1000)}s / {Math.round(trainingProgress.estimatedTimeRemaining / 1000)}s remaining
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={trainModel}
                    disabled={isTraining || availableModels.length === 0}
                    className="flex-1"
                  >
                    {isTraining ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Training
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Real-time Inference
              </CardTitle>
              <CardDescription>
                Run predictions with your models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inference Status</span>
                  <Badge variant={isInference ? 'default' : 'secondary'}>
                    {isInference ? 'Running' : 'Idle'}
                  </Badge>
                </div>
                
                {inferenceResult && (
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Prediction Result</span>
                        <Badge variant="outline">
                          {(inferenceResult.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <p><strong>Predicted Class:</strong> {inferenceResult.className}</p>
                        <p><strong>Processing Time:</strong> {inferenceResult.processingTime.toFixed(2)}ms</p>
                        <p><strong>Model Used:</strong> {inferenceResult.modelUsed}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Class Probabilities:</span>
                      {Object.entries(inferenceResult.classProbabilities).map(([className, probability]) => (
                        <div key={className} className="flex items-center justify-between">
                          <span className="text-sm">{className}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={probability * 100} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">
                              {(probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={runInference}
                  disabled={isInference || availableModels.length === 0}
                  className="w-full"
                >
                  {isInference ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Inference
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Sample Inference
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Model Cache
              </CardTitle>
              <CardDescription>
                Manage cached models and storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Cache Size</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {cacheStats.totalSize.toFixed(1)} MB
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of {cacheStats.maxSize} MB ({cacheStats.usagePercentage.toFixed(1)}%)
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Models</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {cacheStats.totalModels}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of {cacheStats.maxModels} max
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cached Models</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCache}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
                
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {cachedModels.map((model) => (
                      <div
                        key={model.name}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Database className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{model.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(model.size / (1024 * 1024)).toFixed(1)} MB • {model.version}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {model.isPretrained && (
                            <Badge variant="secondary">Pretrained</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => modelCacheManager.removeFromCache(model.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor system performance and memory usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {(tf.memory().numBytes / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tf.memory().numTensors} tensors
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Backend</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {tf.getBackend()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      WebGL accelerated
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => tf.disposeVariables()}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Memory
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => tf.ready()}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    TensorFlow.js is running in the browser with WebGL acceleration. 
                    Performance may vary based on your device capabilities.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}