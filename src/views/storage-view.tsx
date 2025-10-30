'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  HardDrive,
  Image,
  Trash2,
  Download,
  RefreshCw,
  Zap,
  FolderOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react'

interface StorageStats {
  totalSize: number
  usedSize: number
  availableSize: number
  totalImages: number
  detectionImages: number
  trainingImages: number
  tempImages: number
  lastOptimized: string
}

interface StorageCategory {
  name: string
  count: number
  size: number
  color: string
  icon: any
  path: string
}

export default function StorageView() {
  const [stats, setStats] = useState<StorageStats>({
    totalSize: 0,
    usedSize: 0,
    availableSize: 0,
    totalImages: 0,
    detectionImages: 0,
    trainingImages: 0,
    tempImages: 0,
    lastOptimized: ''
  })
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)

  useEffect(() => {
    fetchStorageStats()
  }, [])

  const fetchStorageStats = async () => {
    try {
      const response = await fetch('/api/storage')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch storage stats:', error)
    }
  }

  const optimizeStorage = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      // Simulate optimization progress
      const interval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/storage/optimize', {
        method: 'POST'
      })

      if (response.ok) {
        setOptimizationProgress(100)
        setTimeout(() => {
          setIsOptimizing(false)
          setOptimizationProgress(0)
          fetchStorageStats()
        }, 1000)
      }
    } catch (error) {
      console.error('Optimization failed:', error)
      setIsOptimizing(false)
    }
  }

  const clearTempFiles = async () => {
    try {
      const response = await fetch('/api/storage/temp', {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStorageStats()
      }
    } catch (error) {
      console.error('Clear temp files failed:', error)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const usagePercentage = stats.totalSize > 0 ? (stats.usedSize / stats.totalSize) * 100 : 0

  const categories: StorageCategory[] = [
    {
      name: 'Detection Images',
      count: stats.detectionImages,
      size: stats.usedSize * 0.6, // Estimated
      color: 'from-purple-500 to-purple-700',
      icon: Image,
      path: '/uploads/images/detection'
    },
    {
      name: 'Training Dataset',
      count: stats.trainingImages,
      size: stats.usedSize * 0.35, // Estimated
      color: 'from-green-500 to-green-700',
      icon: Database,
      path: '/uploads/images/training'
    },
    {
      name: 'Temporary Files',
      count: stats.tempImages,
      size: stats.usedSize * 0.05, // Estimated
      color: 'from-orange-500 to-orange-700',
      icon: FileText,
      path: '/uploads/images/temp'
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
          Storage Management
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Monitor and optimize your local image storage system.
        </p>
      </motion.div>

      {/* Storage Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Storage
              </CardTitle>
              <HardDrive className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
              <p className="text-xs text-white/60 mt-1">
                {formatBytes(stats.usedSize)} used
              </p>
              <div className="mt-3">
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-white/50 mt-1">{usagePercentage.toFixed(1)}% used</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Images
              </CardTitle>
              <Image className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalImages}</div>
              <p className="text-xs text-white/60 mt-1">
                Stored locally
              </p>
              <div className="flex items-center gap-2 mt-3">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+12% this month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Last Optimized
              </CardTitle>
              <Clock className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {stats.lastOptimized ? 
                  new Date(stats.lastOptimized).toLocaleDateString() : 
                  'Never'
                }
              </div>
              <p className="text-xs text-white/60 mt-1">
                Storage optimization
              </p>
              <Button 
                size="sm" 
                className="mt-3 bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                onClick={optimizeStorage}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Optimizing
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 mr-1" />
                    Optimize
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Storage Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Storage Categories
            </CardTitle>
            <CardDescription className="text-white/60">
              Breakdown of image storage by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category, index) => {
                const Icon = category.icon
                const percentage = stats.usedSize > 0 ? (category.size / stats.usedSize) * 100 : 0
                
                return (
                  <div key={category.name} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-white/60">{category.path}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatBytes(category.size)}</p>
                        <p className="text-sm text-white/60">{category.count} files</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Usage</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Storage Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Storage Actions
            </CardTitle>
            <CardDescription className="text-white/60">
              Optimize and manage your storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Optimization Progress */}
            {isOptimizing && (
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Optimization Progress</span>
                  <span className="text-sm text-white/60">{optimizationProgress}%</span>
                </div>
                <Progress value={optimizationProgress} className="h-2 mb-3" />
                <p className="text-sm text-white/60">
                  Compressing images and cleaning up temporary files...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                onClick={optimizeStorage}
                disabled={isOptimizing}
              >
                <Zap className="w-4 h-4 mr-2" />
                Optimize Storage
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={clearTempFiles}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Temp Files
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={fetchStorageStats}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Stats
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Backup
              </Button>
            </div>

            {/* Storage Health */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Storage Health
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className="text-green-400">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Fragmentation:</span>
                    <span>Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Compression:</span>
                    <span>Optimized</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Recommendations
                </h3>
                <div className="space-y-2 text-sm text-white/60">
                  <p>• Consider optimizing storage monthly</p>
                  <p>• Clear temporary files regularly</p>
                  <p>• Monitor storage growth trends</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}