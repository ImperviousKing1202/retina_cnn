'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Database,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Cpu,
  Zap,
  BarChart3,
  Settings,
  Eye,
  Target,
  Layers,
  BarChart2,
  Smartphone
} from 'lucide-react'
import CNNTrainingInterface from '@/components/cnn-training-interface'
import MLControlDashboard from '@/components/ml-control-dashboard'
import EyeComparisonSystem from '@/components/eye-comparison-system'
import DatasetManagementSystem from '@/components/dataset-management'
import DataAugmentationControl from '@/components/data-augmentation-control'
import ModelEvaluationTool from '@/components/model-evaluation-tool'
import TensorFlowStatus from '@/components/tensorflow-status'
import MobileTrainingDashboard from '@/components/mobile-training-dashboard'
import { RetinaCNN, DISEASE_CONFIGS } from '@/lib/cnn-model'

export default function TrainingView() {
  const [selectedDisease, setSelectedDisease] = useState<'glaucoma' | 'retinopathy' | 'cataract' | 'normal'>('glaucoma')
  const [cnnModel, setCnnModel] = useState<RetinaCNN | null>(null)
  const [isModelInitialized, setIsModelInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState('mobile')
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile')

  const diseases = [
    {
      id: 'glaucoma' as const,
      name: 'Glaucoma Detection',
      description: 'CNN model for glaucoma detection',
      icon: Brain,
      color: 'from-purple-500 to-purple-700',
      epochs: DISEASE_CONFIGS.glaucoma.epochs,
      accuracy: '94.2%'
    },
    {
      id: 'retinopathy' as const,
      name: 'Diabetic Retinopathy',
      description: 'CNN model for diabetic retinopathy screening',
      icon: Brain,
      color: 'from-teal-500 to-teal-700',
      epochs: DISEASE_CONFIGS.retinopathy.epochs,
      accuracy: '92.8%'
    },
    {
      id: 'cataract' as const,
      name: 'Cataract Analysis',
      description: 'CNN model for cataract detection',
      icon: Brain,
      color: 'from-green-500 to-green-700',
      epochs: DISEASE_CONFIGS.cataract.epochs,
      accuracy: '95.1%'
    },
    {
      id: 'normal' as const,
      name: 'Normal Eyes',
      description: 'Baseline model for normal eye conditions',
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-700',
      epochs: 30,
      accuracy: '96.5%'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          ML Control Center
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Comprehensive machine learning control with normal eye condition management, data augmentation, and model evaluation.
        </p>
        
        {/* View Mode Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="bg-transparent border border-white/20 rounded-lg p-1 flex">
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('mobile')
                setActiveTab('mobile')
              }}
              className={`${
                viewMode === 'mobile' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile View
            </Button>
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('desktop')
                setActiveTab('training')
              }}
              className={`${
                viewMode === 'desktop' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Desktop View
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mobile View */}
      {viewMode === 'mobile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MobileTrainingDashboard />
        </motion.div>
      )}

      {/* Desktop View */}
      {viewMode === 'desktop' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-transparent border-white/20">
              <TabsTrigger value="training" className="text-white data-[state=active]:bg-white/10">
                <Brain className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
              <TabsTrigger value="ml-control" className="text-white data-[state=active]:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                ML Control
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-white data-[state=active]:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="dataset" className="text-white data-[state=active]:bg-white/10">
                <Database className="w-4 h-4 mr-2" />
                Dataset
              </TabsTrigger>
              <TabsTrigger value="augmentation" className="text-white data-[state=active]:bg-white/10">
                <Layers className="w-4 h-4 mr-2" />
                Augmentation
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="text-white data-[state=active]:bg-white/10">
                <BarChart2 className="w-4 h-4 mr-2" />
                Evaluation
              </TabsTrigger>
              <TabsTrigger value="tensorflow" className="text-white data-[state=active]:bg-white/10">
                <Cpu className="w-4 h-4 mr-2" />
                TensorFlow
              </TabsTrigger>
            </TabsList>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-8">
            {/* Model Selection */}
            <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Select Disease Model
                </CardTitle>
                <CardDescription className="text-white/60">
                  Choose which disease detection model to train
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedDisease} onValueChange={(value) => setSelectedDisease(value as any)}>
                  <TabsList className="grid w-full grid-cols-4 bg-transparent border-white/20">
                    {diseases.map((disease) => (
                      <TabsTrigger 
                        key={disease.id}
                        value={disease.id}
                        className="data-[state=active]:bg-white/10 text-white data-[state=active]:text-white"
                      >
                        {disease.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {diseases.map((disease) => (
                    <TabsContent key={disease.id} value={disease.id} className="mt-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {diseases.map((d, index) => (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`h-full cursor-pointer ${
                              selectedDisease === d.id ? 'ring-2 ring-white/50' : ''
                            }`}
                            onClick={() => setSelectedDisease(d.id)}
                          >
                            <Card className={`h-full backdrop-blur-md ${
                              selectedDisease === d.id 
                                ? 'bg-transparent border-white/40' 
                                : 'bg-transparent border-white/20'
                            } text-white hover:bg-transparent/10 transition-all duration-300`}>
                              <CardHeader className="text-center">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${d.color} flex items-center justify-center`}>
                                  <d.icon className="w-8 h-8 text-white" />
                                </div>
                                <CardTitle className="text-lg font-semibold">{d.name}</CardTitle>
                                <CardDescription className="text-white/70 text-sm">
                                  {d.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="text-center space-y-3">
                                <div className="flex justify-around text-sm">
                                  <div>
                                    <p className="text-white/60">Epochs</p>
                                    <p className="font-semibold">{d.epochs}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/60">Accuracy</p>
                                    <p className="font-semibold">{d.accuracy}</p>
                                  </div>
                                </div>
                                <Badge className={`${
                                  selectedDisease === d.id 
                                    ? 'bg-transparent/20 text-green-300 border-green-500/30'
                                    : 'bg-transparent text-white/70 border-white/20'
                                }`}>
                                  {selectedDisease === d.id ? 'Selected' : 'Select'}
                                </Badge>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* CNN Training Interface */}
            <CNNTrainingInterface diseaseType={selectedDisease} />

            {/* Model Architecture Info */}
            <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  CNN Architecture
                </CardTitle>
                <CardDescription className="text-white/60">
                  Deep learning model architecture for {diseases.find(d => d.id === selectedDisease)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Model Features
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Input Shape</span>
                        <span>224×224×3</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Convolutional Layers</span>
                        <span>6 layers</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Filters</span>
                        <span>32-256</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Dense Layers</span>
                        <span>2 layers</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Activation</span>
                        <span>ReLU + Softmax</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Regularization</span>
                        <span>Dropout + BatchNorm</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Training Configuration
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Optimizer</span>
                        <span>Adam</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Learning Rate</span>
                        <span>{DISEASE_CONFIGS[selectedDisease].learningRate}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Batch Size</span>
                        <span>{DISEASE_CONFIGS[selectedDisease].batchSize}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Loss Function</span>
                        <span>Categorical Crossentropy</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Validation Split</span>
                        <span>20%</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                        <span>Test Split</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-transparent border border-white/10">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Training Recommendations
                  </h3>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Use at least 100 images per class for optimal performance</li>
                    <li>• Ensure balanced dataset across all classes</li>
                    <li>• Apply data augmentation to improve generalization</li>
                    <li>• Monitor validation loss to prevent overfitting</li>
                    <li>• Use GPU acceleration for faster training</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ML Control Tab */}
          <TabsContent value="ml-control">
            <MLControlDashboard diseaseType={selectedDisease} />
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <EyeComparisonSystem />
          </TabsContent>

          {/* Dataset Tab */}
          <TabsContent value="dataset">
            <DatasetManagementSystem />
          </TabsContent>

          {/* Augmentation Tab */}
          <TabsContent value="augmentation">
            <DataAugmentationControl />
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation">
            <ModelEvaluationTool />
          </TabsContent>

          {/* TensorFlow Tab */}
          <TabsContent value="tensorflow">
            <TensorFlowStatus />
          </TabsContent>
        </Tabs>
        </motion.div>
      )}
    </div>
  )
}