'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Upload,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Activity,
  Zap,
  BarChart3,
  ChevronRight,
  Plus,
  Image as ImageIcon
} from 'lucide-react'

interface DiseaseCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
  status: 'idle' | 'training' | 'completed' | 'error'
  progress: number
  accuracy?: string
  epochs: number
  currentEpoch: number
  samples: number
  lastUpdated: string
}

export default function MobileTrainingDashboard() {
  const [categories, setCategories] = useState<DiseaseCategory[]>([
    {
      id: 'glaucoma',
      name: 'Glaucoma',
      description: 'Glaucoma detection model',
      icon: Eye,
      color: 'from-purple-500 to-purple-700',
      status: 'idle',
      progress: 0,
      accuracy: '94.2%',
      epochs: 50,
      currentEpoch: 0,
      samples: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'retinopathy',
      name: 'Diabetic Retinopathy',
      description: 'Diabetic retinopathy screening',
      icon: Activity,
      color: 'from-teal-500 to-teal-700',
      status: 'idle',
      progress: 0,
      accuracy: '92.8%',
      epochs: 60,
      currentEpoch: 0,
      samples: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'cataract',
      name: 'Cataract',
      description: 'Cataract detection model',
      icon: Brain,
      color: 'from-green-500 to-green-700',
      status: 'idle',
      progress: 0,
      accuracy: '95.1%',
      epochs: 40,
      currentEpoch: 0,
      samples: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'normal',
      name: 'Normal Eyes',
      description: 'Normal eye condition baseline',
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-700',
      status: 'idle',
      progress: 0,
      accuracy: '96.5%',
      epochs: 30,
      currentEpoch: 0,
      samples: 0,
      lastUpdated: 'Never'
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('glaucoma')
  const [isTraining, setIsTraining] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleStartTraining = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, status: 'training', progress: 0, currentEpoch: 0 }
        : cat
    ))
    setIsTraining(true)
    
    // Simulate training progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                status: 'completed', 
                progress: 100, 
                currentEpoch: cat.epochs,
                lastUpdated: new Date().toLocaleTimeString()
              }
            : cat
        ))
        setIsTraining(false)
      } else {
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                progress: Math.min(progress, 99), 
                currentEpoch: Math.floor((progress / 100) * cat.epochs),
                samples: Math.floor((progress / 100) * 1000)
              }
            : cat
        ))
      }
    }, 500)
  }

  const handlePauseTraining = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, status: 'idle' }
        : cat
    ))
    setIsTraining(false)
  }

  const handleResetTraining = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            status: 'idle', 
            progress: 0, 
            currentEpoch: 0,
            samples: 0,
            lastUpdated: 'Never'
          }
        : cat
    ))
    setIsTraining(false)
  }

  const getStatusColor = (status: DiseaseCategory['status']) => {
    switch (status) {
      case 'training': return 'text-yellow-400'
      case 'completed': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadge = (status: DiseaseCategory['status']) => {
    switch (status) {
      case 'training': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <div className="space-y-4 px-3 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-xl font-bold text-white mb-2">
          Training Dashboard
        </h1>
        <p className="text-xs text-white/70">
          Manage all disease models and normal eye baseline
        </p>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent border-white/20 h-12">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10 text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="details" className="text-white data-[state=active]:bg-white/10 text-sm">
            Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 mt-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Active Models</p>
                    <p className="text-xl font-bold">
                      {categories.filter(cat => cat.status === 'training').length}
                    </p>
                  </div>
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Completed</p>
                    <p className="text-xl font-bold">
                      {categories.filter(cat => cat.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Cards */}
          <div className="space-y-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className="cursor-pointer"
              >
                <Card className={`backdrop-blur-md border-white/20 text-white transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? 'bg-transparent border-white/40' 
                    : 'bg-transparent hover:bg-white/5'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                          <category.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xs">{category.name}</h3>
                          <p className="text-xs text-white/60">{category.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/40" />
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`text-xs ${getStatusBadge(category.status)}`}>
                        {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                      </Badge>
                      {category.accuracy && (
                        <span className="text-xs text-white/60">
                          Target: {category.accuracy}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {category.status !== 'idle' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Progress</span>
                          <span>{Math.round(category.progress)}%</span>
                        </div>
                        <Progress value={category.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Epoch {category.currentEpoch}/{category.epochs}</span>
                          <span>{category.samples} samples</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2">
                      {category.status === 'idle' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartTraining(category.id)
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {category.status === 'training' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePauseTraining(category.id)
                          }}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white h-8"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      
                      {(category.status === 'completed' || category.status === 'error') && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResetTraining(category.id)
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white h-8"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-3 mt-4">
          {selectedCategoryData && (
            <>
              {/* Selected Category Header */}
              <Card className="backdrop-blur-md bg-transparent border-white/40 text-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedCategoryData.color} flex items-center justify-center`}>
                      <selectedCategoryData.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold">{selectedCategoryData.name}</h2>
                      <p className="text-sm text-white/70">{selectedCategoryData.description}</p>
                    </div>
                    <Badge className={getStatusBadge(selectedCategoryData.status)}>
                      {selectedCategoryData.status.charAt(0).toUpperCase() + selectedCategoryData.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Training Progress */}
              <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Training Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(selectedCategoryData.progress)}%</span>
                    </div>
                    <Progress value={selectedCategoryData.progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded bg-transparent border border-white/10">
                      <p className="text-white/60 text-xs">Current Epoch</p>
                      <p className="font-semibold">{selectedCategoryData.currentEpoch}/{selectedCategoryData.epochs}</p>
                    </div>
                    <div className="p-3 rounded bg-transparent border border-white/10">
                      <p className="text-white/60 text-xs">Samples Processed</p>
                      <p className="font-semibold">{selectedCategoryData.samples}</p>
                    </div>
                    <div className="p-3 rounded bg-transparent border border-white/10">
                      <p className="text-white/60 text-xs">Target Accuracy</p>
                      <p className="font-semibold">{selectedCategoryData.accuracy}</p>
                    </div>
                    <div className="p-3 rounded bg-transparent border border-white/10">
                      <p className="text-white/60 text-xs">Last Updated</p>
                      <p className="font-semibold text-xs">{selectedCategoryData.lastUpdated}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Configuration */}
              <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                      <span className="text-white/60">Input Shape</span>
                      <span>224×224×3</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                      <span className="text-white/60">Architecture</span>
                      <span>CNN 6-layer</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                      <span className="text-white/60">Optimizer</span>
                      <span>Adam</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                      <span className="text-white/60">Learning Rate</span>
                      <span>0.001</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-transparent border border-white/10">
                      <span className="text-white/60">Batch Size</span>
                      <span>32</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white h-10">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Training Images
                  </Button>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-10">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    View Dataset
                  </Button>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-10">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}