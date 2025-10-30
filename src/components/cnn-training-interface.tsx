'use client'

import { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload,
  RotateCcw,
  BarChart3,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Cpu
} from 'lucide-react'
import { RetinaCNN, TrainingProgress, DISEASE_CONFIGS, CLASS_NAMES } from '@/lib/cnn-model'
import { DataPreprocessor, ImageData } from '@/lib/data-preprocessor'

interface CNNTrainingProps {
  diseaseType: 'glaucoma' | 'retinopathy' | 'cataract'
}

export default function CNNTrainingInterface({ diseaseType }: CNNTrainingProps) {
  const [model, setModel] = useState<RetinaCNN | null>(null)
  const [preprocessor, setPreprocessor] = useState<DataPreprocessor | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null)
  const [trainingHistory, setTrainingHistory] = useState<TrainingProgress[]>([])
  const [dataset, setDataset] = useState<ImageData[]>([])
  const [modelMetrics, setModelMetrics] = useState<{
    accuracy: number
    loss: number
    valAccuracy: number
    valLoss: number
  } | null>(null)
  const [isModelReady, setIsModelReady] = useState(false)
  const [gpuAvailable, setGpuAvailable] = useState(false)
  const [trainingTime, setTrainingTime] = useState(0)
  const trainingStartTime = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializeCNN()
    checkGPUAvailability()
    return () => {
      if (model) {
        model.dispose()
      }
    }
  }, [diseaseType])

  const initializeCNN = async () => {
    try {
      const config = DISEASE_CONFIGS[diseaseType]
      const cnnModel = new RetinaCNN(config)
      const dataPreprocessor = new DataPreprocessor()
      
      setModel(cnnModel)
      setPreprocessor(dataPreprocessor)
      setIsModelReady(true)
      
      // Set up training progress callback
      cnnModel.onTrainingProgress((progress) => {
        setTrainingProgress(progress)
        setTrainingHistory(prev => [...prev, progress])
        setModelMetrics({
          accuracy: progress.accuracy,
          loss: progress.loss,
          valAccuracy: progress.valAccuracy,
          valLoss: progress.valLoss
        })
      })
    } catch (error) {
      console.error('Failed to initialize CNN:', error)
    }
  }

  const checkGPUAvailability = async () => {
    try {
      const backends = await tf.ENV.get('BACKEND')
      setGpuAvailable(backends === 'webgl')
    } catch (error) {
      console.error('Failed to check GPU availability:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !preprocessor) return

    try {
      const labels = Array.from(files).map((_, index) => {
        // Simple labeling based on filename patterns
        const filename = files[index].name.toLowerCase()
        if (filename.includes('normal') || filename.includes('healthy')) {
          return CLASS_NAMES[diseaseType][0]
        } else if (diseaseType === 'glaucoma' && filename.includes('glaucoma')) {
          return CLASS_NAMES[diseaseType][1]
        } else if (diseaseType === 'retinopathy') {
          if (filename.includes('mild')) return CLASS_NAMES[diseaseType][1]
          if (filename.includes('moderate')) return CLASS_NAMES[diseaseType][2]
          if (filename.includes('severe')) return CLASS_NAMES[diseaseType][3]
          if (filename.includes('proliferative')) return CLASS_NAMES[diseaseType][4]
        } else if (diseaseType === 'cataract') {
          if (filename.includes('early')) return CLASS_NAMES[diseaseType][1]
          if (filename.includes('advanced')) return CLASS_NAMES[diseaseType][2]
        }
        return CLASS_NAMES[diseaseType][0] // Default to normal
      })

      const imageData = await preprocessor.loadImagesFromFiles(Array.from(files), labels)
      setDataset(imageData)
    } catch (error) {
      console.error('Failed to load images:', error)
    }
  }

  const startTraining = async () => {
    if (!model || !preprocessor || dataset.length === 0) return

    setIsTraining(true)
    setTrainingHistory([])
    trainingStartTime.current = Date.now()

    try {
      // Preprocess dataset
      const { trainTensors, validationTensors } = await preprocessor.preprocessDataset(
        dataset,
        CLASS_NAMES[diseaseType],
        0.2,
        0.1
      )

      // Start training
      await model.train(
        trainTensors.images,
        trainTensors.labels,
        validationTensors.images,
        validationTensors.labels
      )

      // Clean up tensors
      trainTensors.images.dispose()
      trainTensors.labels.dispose()
      validationTensors.images.dispose()
      validationTensors.labels.dispose()

    } catch (error) {
      console.error('Training failed:', error)
    } finally {
      setIsTraining(false)
      const endTime = Date.now()
      setTrainingTime((endTime - trainingStartTime.current) / 1000)
    }
  }

  const stopTraining = () => {
    setIsTraining(false)
  }

  const saveModel = async () => {
    if (!model) return
    try {
      await model.saveModel(`retina_${diseaseType}_model`)
      alert('Model saved successfully!')
    } catch (error) {
      console.error('Failed to save model:', error)
    }
  }

  const exportModel = async () => {
    if (!model) return
    try {
      const modelBlob = await model.exportModel()
      const url = URL.createObjectURL(modelBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `retina_${diseaseType}_model.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export model:', error)
    }
  }

  const resetTraining = () => {
    setTrainingProgress(null)
    setTrainingHistory([])
    setModelMetrics(null)
    setTrainingTime(0)
    initializeCNN()
  }

  const datasetStats = preprocessor ? preprocessor.calculateDatasetStats(dataset) : null

  return (
    <div className="space-y-6">
      {/* Model Status */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            CNN Model Status - {diseaseType.charAt(0).toUpperCase() + diseaseType.slice(1)}
          </CardTitle>
          <CardDescription className="text-white/60">
            Deep learning model for retinal disease detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${isModelReady ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className="text-sm">Model: {isModelReady ? 'Ready' : 'Initializing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className={`w-4 h-4 ${gpuAvailable ? 'text-green-400' : 'text-gray-400'}`} />
              <span className="text-sm">GPU: {gpuAvailable ? 'Available' : 'Not Available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isTraining ? 'text-red-400' : 'text-gray-400'}`} />
              <span className="text-sm">Status: {isTraining ? 'Training' : 'Idle'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-sm">Time: {trainingTime.toFixed(1)}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Management */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Dataset Management
          </CardTitle>
          <CardDescription className="text-white/60">
            Upload and manage training images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Training Images
            </Button>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {dataset.length} images loaded
            </Badge>
          </div>

          {datasetStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Total Images</p>
                <p className="text-lg font-semibold">{datasetStats.totalImages}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Classes</p>
                <p className="text-lg font-semibold">{Object.keys(datasetStats.classDistribution).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Balance</p>
                <p className="text-lg font-semibold">{(datasetStats.balance * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}

          {datasetStats && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Class Distribution:</p>
              {Object.entries(datasetStats.classDistribution).map(([className, count]) => (
                <div key={className} className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-sm">{className}</span>
                  <Badge variant="outline" className="border-white/30 text-white/80">
                    {count} images
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Controls */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Training Controls
          </CardTitle>
          <CardDescription className="text-white/60">
            Configure and start model training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={startTraining}
              disabled={isTraining || !isModelReady || dataset.length < 10}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Training
            </Button>
            <Button 
              onClick={stopTraining}
              disabled={!isTraining}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Training
            </Button>
            <Button 
              onClick={resetTraining}
              disabled={isTraining}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={saveModel}
              disabled={!model || isTraining}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Save Model
            </Button>
            <Button 
              onClick={exportModel}
              disabled={!model || isTraining}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Export Model
            </Button>
          </div>

          {dataset.length < 10 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                At least 10 training images are required to start training. Upload more images to begin.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Training Progress */}
      {trainingProgress && (
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-white/60">Epoch</p>
                <p className="text-2xl font-bold">{trainingProgress.epoch}/{DISEASE_CONFIGS[diseaseType].epochs}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/60">Loss</p>
                <p className="text-2xl font-bold">{trainingProgress.loss.toFixed(4)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/60">Accuracy</p>
                <p className="text-2xl font-bold">{(trainingProgress.accuracy * 100).toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/60">Val Accuracy</p>
                <p className="text-2xl font-bold">{(trainingProgress.valAccuracy * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>{((trainingProgress.epoch / DISEASE_CONFIGS[diseaseType].epochs) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(trainingProgress.epoch / DISEASE_CONFIGS[diseaseType].epochs) * 100} 
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60 mb-1">Training Accuracy</p>
                <Progress value={trainingProgress.accuracy * 100} className="h-2" />
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Validation Accuracy</p>
                <Progress value={trainingProgress.valAccuracy * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Metrics */}
      {modelMetrics && (
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Model Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5 text-center">
                <p className="text-sm text-white/60">Final Accuracy</p>
                <p className="text-2xl font-bold text-green-400">
                  {(modelMetrics.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 text-center">
                <p className="text-sm text-white/60">Final Loss</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {modelMetrics.loss.toFixed(4)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 text-center">
                <p className="text-sm text-white/60">Validation Accuracy</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(modelMetrics.valAccuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 text-center">
                <p className="text-sm text-white/60">Validation Loss</p>
                <p className="text-2xl font-bold text-orange-400">
                  {modelMetrics.valLoss.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}