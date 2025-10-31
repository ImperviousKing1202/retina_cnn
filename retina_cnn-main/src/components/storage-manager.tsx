'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  Settings,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileImage,
  Zap
} from 'lucide-react'

interface StorageStats {
  totalImages: number
  totalSize: number
  totalSizeMB: string
  byCategory: Record<string, { count: number; size: number; sizeMB: string }>
}

interface StorageManagerProps {
  onClose: () => void
}

export default function StorageManager({ onClose }: StorageManagerProps) {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/storage?action=stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch storage statistics' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching storage statistics' })
    } finally {
      setIsLoading(false)
    }
  }

  const optimizeStorage = async () => {
    setIsOptimizing(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/storage?action=optimize')
      if (response.ok) {
        const data = await response.json()
        setMessage({ 
          type: 'success', 
          text: `Optimized ${data.imagesOptimized} images, saved ${data.spaceSavedMB} MB` 
        })
        await fetchStats() // Refresh stats
      } else {
        setMessage({ type: 'error', text: 'Failed to optimize storage' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error optimizing storage' })
    } finally {
      setIsOptimizing(false)
    }
  }

  const cleanupTemp = async () => {
    setIsCleaning(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/storage?action=cleanup')
      if (response.ok) {
        const data = await response.json()
        setMessage({ 
          type: 'success', 
          text: `Cleaned up ${data.deletedCount} temporary images` 
        })
        await fetchStats() // Refresh stats
      } else {
        setMessage({ type: 'error', text: 'Failed to cleanup temporary files' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cleaning up temporary files' })
    } finally {
      setIsCleaning(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatFileSize = (sizeInMB: string) => {
    const size = parseFloat(sizeInMB)
    if (size < 1) {
      return `${(size * 1024).toFixed(0)} KB`
    }
    return `${size.toFixed(2)} MB`
  }

  const getStorageColor = (sizeInMB: string) => {
    const size = parseFloat(sizeInMB)
    if (size < 100) return 'text-green-600'
    if (size < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Storage Manager</h2>
                <p className="text-white/80">Manage local image storage and optimization</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              ×
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Alert Messages */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <Alert className={message.type === 'error' ? 'bg-red-50 border-red-200' : 
                               message.type === 'success' ? 'bg-green-50 border-green-200' : 
                               'bg-blue-50 border-blue-200'}>
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription className={message.type === 'error' ? 'text-red-700' : 
                                           message.type === 'success' ? 'text-green-700' : 
                                           'text-blue-700'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {stats ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileImage className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">{stats.totalImages}</div>
                        <div className="text-sm text-gray-600">Total Images</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className={`text-2xl font-bold ${getStorageColor(stats.totalSizeMB)}`}>
                          {formatFileSize(stats.totalSizeMB)}
                        </div>
                        <div className="text-sm text-gray-600">Total Storage</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">
                          {stats.totalImages > 0 ? Math.round(stats.totalSize / stats.totalImages / 1024) : 0}
                        </div>
                        <div className="text-sm text-gray-600">Avg Size (KB)</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Storage Usage Bar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />
                        Storage Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Used Space</span>
                          <span className={getStorageColor(stats.totalSizeMB)}>
                            {formatFileSize(stats.totalSizeMB)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((parseFloat(stats.totalSizeMB) / 1024) * 100, 100)} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-600">
                          1 GB available • {formatFileSize(stats.totalSizeMB)} used
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
                  <p className="text-gray-600">Loading storage statistics...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              {stats && Object.entries(stats.byCategory).length > 0 ? (
                <div className="grid gap-4">
                  {Object.entries(stats.byCategory).map(([category, data]) => (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              category === 'detection' ? 'bg-purple-100' :
                              category === 'training' ? 'bg-teal-100' :
                              'bg-gray-100'
                            }`}>
                              <ImageIcon className={`w-5 h-5 ${
                                category === 'detection' ? 'text-purple-600' :
                                category === 'training' ? 'text-teal-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-medium capitalize">{category}</h3>
                              <p className="text-sm text-gray-600">
                                {data.count} images • {formatFileSize(data.sizeMB)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {data.sizeMB}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No images stored yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Storage Optimization
                  </CardTitle>
                  <CardDescription>
                    Optimize and clean up your image storage to save space
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <Button
                      onClick={optimizeStorage}
                      disabled={isOptimizing || !stats || stats.totalImages === 0}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      {isOptimizing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Optimize Images
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={cleanupTemp}
                      disabled={isCleaning}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      {isCleaning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Cleaning...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cleanup Temporary Files
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={fetchStats}
                      disabled={isLoading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Statistics
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• <strong>Optimize Images:</strong> Compress and resize images to save space</p>
                    <p>• <strong>Cleanup Temporary:</strong> Remove temporary files older than 24 hours</p>
                    <p>• <strong>Refresh Stats:</strong> Update storage usage information</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}