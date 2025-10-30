'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Loader2,
  Eye,
  RefreshCw,
  Trash2,
  Download,
  Database,
  Settings,
  HardDrive
} from 'lucide-react'
import StorageManager from './storage-manager'

interface TrainingImage {
  id: string
  diseaseType: string
  label: string
  isVerified: boolean
  createdAt: string
  imageUrl: string
}

interface TrainingStats {
  totalImages: number
  verifiedImages: number
  pendingImages: number
  glaucomaCount: number
  retinopathyCount: number
  cataractCount: number
}

export default function TrainingInterface({ onClose }: { onClose: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [diseaseType, setDiseaseType] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [trainingImages, setTrainingImages] = useState<TrainingImage[]>([])
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [storageStats, setStorageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showStorageManager, setShowStorageManager] = useState(false)

  const fetchTrainingData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/train')
      if (response.ok) {
        const data = await response.json()
        setTrainingImages(data.images)
        setStorageStats(data.storageStats)
        
        // Calculate stats
        const stats: TrainingStats = {
          totalImages: data.images.length,
          verifiedImages: data.images.filter((img: TrainingImage) => img.isVerified).length,
          pendingImages: data.images.filter((img: TrainingImage) => !img.isVerified).length,
          glaucomaCount: data.images.filter((img: TrainingImage) => img.diseaseType === 'glaucoma').length,
          retinopathyCount: data.images.filter((img: TrainingImage) => img.diseaseType === 'retinopathy').length,
          cataractCount: data.images.filter((img: TrainingImage) => img.diseaseType === 'cataract').length
        }
        setStats(stats)
      }
    } catch (error) {
      setError('Failed to fetch training data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG or PNG)')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !diseaseType || !label) {
      setError('Please select a file, disease type, and label')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('diseaseType', diseaseType)
      formData.append('label', label)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/train', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        setSuccess('Training image uploaded successfully!')
        setSelectedFile(null)
        setDiseaseType('')
        setLabel('')
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Refresh training data
        await fetchTrainingData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/train?id=${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSuccess('Image deleted successfully')
        await fetchTrainingData() // Refresh the list
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete image')
      }
    } catch (error) {
      setError('Failed to delete image')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString()
  }

  const getDiseaseColor = (diseaseType: string) => {
    switch (diseaseType) {
      case 'glaucoma': return 'bg-purple-100 text-purple-800'
      case 'retinopathy': return 'bg-teal-100 text-teal-800'
      case 'cataract': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLabelColor = (label: string) => {
    return label === 'positive' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Training Center</h2>
                <p className="text-white/80">Improve detection accuracy with training data</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              ×
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalImages}</div>
                <div className="text-sm text-gray-600">Total Images</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.verifiedImages}</div>
                <div className="text-sm text-gray-600">Verified</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingImages}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {stats.totalImages > 0 ? Math.round((stats.verifiedImages / stats.totalImages) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Storage Stats */}
        {storageStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-blue-50">
            <Card>
              <CardContent className="p-4 text-center">
                <Database className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">{storageStats.totalImages}</div>
                <div className="text-sm text-gray-600">Stored Images</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <HardDrive className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">{storageStats.totalSizeMB} MB</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStorageManager(true)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Storage
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Training Data</TabsTrigger>
              <TabsTrigger value="manage">Manage Dataset</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Training Image
                  </CardTitle>
                  <CardDescription>
                    Upload retinal images with verified diagnoses to improve AI accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Select Image</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon className="w-4 h-4" />
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  {/* Disease Type */}
                  <div className="space-y-2">
                    <Label htmlFor="disease-type">Disease Type</Label>
                    <Select value={diseaseType} onValueChange={setDiseaseType} disabled={isUploading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select disease type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glaucoma">Glaucoma</SelectItem>
                        <SelectItem value="retinopathy">Diabetic Retinopathy</SelectItem>
                        <SelectItem value="cataract">Cataract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Label */}
                  <div className="space-y-2">
                    <Label htmlFor="label">Diagnosis Label</Label>
                    <Select value={label} onValueChange={setLabel} disabled={isUploading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diagnosis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive (Disease Detected)</SelectItem>
                        <SelectItem value="negative">Negative (No Disease)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || !diseaseType || !label || isUploading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        {success}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Training Dataset</CardTitle>
                      <CardDescription>
                        Manage and review uploaded training images
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={fetchTrainingData}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {trainingImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No training images uploaded yet</p>
                        <p className="text-sm">Start by uploading images in the Upload tab</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trainingImages.map((image) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getDiseaseColor(image.diseaseType)}>
                                  {image.diseaseType}
                                </Badge>
                                <Badge className={getLabelColor(image.label)}>
                                  {image.label}
                                </Badge>
                                {image.isVerified ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(image.createdAt)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteImage(image.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Storage Manager Modal */}
      {showStorageManager && (
        <StorageManager onClose={() => setShowStorageManager(false)} />
      )}
    </div>
  )
}