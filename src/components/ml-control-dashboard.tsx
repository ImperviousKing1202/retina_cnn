/**
 * ML Control Dashboard for RETINA CNN System
 * Comprehensive machine learning control interface with normal eye condition management
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  Square,
  RotateCcw,
  BarChart3,
  Activity,
  Zap,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Cpu,
  Database,
  Settings,
  Filter,
  Grid3X3,
  List,
  Search,
  RefreshCw,
  Save,
  Trash2,
  Copy,
  Share2,
  FileImage,
  FolderOpen,
  Tag,
  Calendar,
  Clock,
  User,
  Hospital,
  Stethoscope,
  Microscope,
  Dna,
  TestTube,
  Beaker,
  FlaskConical
} from 'lucide-react';
import { RetinaCNN, TrainingProgress, DISEASE_CONFIGS, CLASS_NAMES } from '@/lib/cnn-model';
import { DataPreprocessor, ImageData } from '@/lib/data-preprocessor';
import { useOfflineStorage } from '@/lib/offline-storage';

interface MLControlProps {
  diseaseType: 'glaucoma' | 'retinopathy' | 'cataract';
}

interface NormalEyeData {
  id: string;
  image: HTMLImageElement;
  filename: string;
  uploadDate: string;
  patientInfo?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
  };
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  verified: boolean;
  notes?: string;
}

interface DatasetStats {
  totalImages: number;
  normalImages: number;
  abnormalImages: number;
  classDistribution: { [key: string]: number };
  qualityDistribution: { [key: string]: number };
  balance: number;
  lastUpdated: string;
}

export default function MLControlDashboard({ diseaseType }: MLControlProps) {
  // Core ML State
  const [model, setModel] = useState<RetinaCNN | null>(null);
  const [preprocessor, setPreprocessor] = useState<DataPreprocessor | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [gpuAvailable, setGpuAvailable] = useState(false);

  // Dataset Management
  const [normalEyes, setNormalEyes] = useState<NormalEyeData[]>([]);
  const [abnormalEyes, setAbnormalEyes] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Training Configuration
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: DISEASE_CONFIGS[diseaseType].epochs,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    augmentationEnabled: true,
    earlyStopping: true,
    patience: 10
  });

  // Data Augmentation
  const [augmentationConfig, setAugmentationConfig] = useState({
    rotation: true,
    flipHorizontal: true,
    flipVertical: false,
    zoom: true,
    brightness: true,
    contrast: true,
    noise: false,
    blur: false
  });

  // UI State
  const [activeTab, setActiveTab] = useState('dataset');
  const [uploadMode, setUploadMode] = useState<'normal' | 'abnormal'>('normal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const normalFileInputRef = useRef<HTMLInputElement>(null);
  const abnormalFileInputRef = useRef<HTMLInputElement>(null);

  // Offline storage
  const { saveModel, getAllModels } = useOfflineStorage();

  useEffect(() => {
    initializeML();
    loadStoredData();
  }, [diseaseType]);

  const initializeML = async () => {
    try {
      const config = DISEASE_CONFIGS[diseaseType];
      const cnnModel = new RetinaCNN(config);
      const dataPreprocessor = new DataPreprocessor();
      
      setModel(cnnModel);
      setPreprocessor(dataPreprocessor);
      setIsModelReady(true);
      
      // Check GPU availability
      const backends = await tf.ENV.get('BACKEND');
      setGpuAvailable(backends === 'webgl');
      
      // Set up training progress callback
      cnnModel.onTrainingProgress((progress) => {
        setTrainingProgress(progress);
      });
    } catch (error) {
      console.error('Failed to initialize ML:', error);
    }
  };

  const loadStoredData = async () => {
    try {
      // Load stored models and data
      const models = await getAllModels();
      console.log('Loaded models:', models);
      updateDatasetStats();
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  };

  const updateDatasetStats = () => {
    const stats: DatasetStats = {
      totalImages: normalEyes.length + abnormalEyes.length,
      normalImages: normalEyes.length,
      abnormalImages: abnormalEyes.length,
      classDistribution: {
        'Normal': normalEyes.length,
        ...abnormalEyes.reduce((acc, img) => {
          acc[img.label] = (acc[img.label] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      },
      qualityDistribution: normalEyes.reduce((acc, eye) => {
        acc[eye.quality] = (acc[eye.quality] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }),
      balance: 0,
      lastUpdated: new Date().toISOString()
    };
    
    // Calculate balance score
    const total = stats.totalImages;
    if (total > 0) {
      const distribution = Object.values(stats.classDistribution);
      const max = Math.max(...distribution);
      const min = Math.min(...distribution);
      stats.balance = total > 0 ? (1 - (max - min) / total) * 100 : 0;
    }
    
    setDatasetStats(stats);
  };

  const handleNormalEyeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const newNormalEyes: NormalEyeData[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageData = await processImageFile(file);
        
        const normalEye: NormalEyeData = {
          id: `normal_${Date.now()}_${i}`,
          image: imageData.image,
          filename: file.name,
          uploadDate: new Date().toISOString(),
          quality: await assessImageQuality(imageData.image),
          verified: false
        };
        
        newNormalEyes.push(normalEye);
      }
      
      setNormalEyes(prev => [...prev, ...newNormalEyes]);
      updateDatasetStats();
      
      // Analyze uploaded images
      if (model && preprocessor) {
        await analyzeUploadedImages(newNormalEyes);
      }
    } catch (error) {
      console.error('Failed to upload normal eyes:', error);
    }
  };

  const handleAbnormalEyeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !preprocessor) return;

    try {
      const labels = Array.from(files).map((file) => {
        const filename = file.name.toLowerCase();
        // Smart labeling based on filename
        if (diseaseType === 'glaucoma' && filename.includes('glaucoma')) {
          return 'Glaucoma';
        } else if (diseaseType === 'retinopathy') {
          if (filename.includes('mild')) return 'Mild DR';
          if (filename.includes('moderate')) return 'Moderate DR';
          if (filename.includes('severe')) return 'Severe DR';
          if (filename.includes('proliferative')) return 'Proliferative DR';
        } else if (diseaseType === 'cataract') {
          if (filename.includes('early')) return 'Early Cataract';
          if (filename.includes('advanced')) return 'Advanced Cataract';
        }
        return 'Abnormal';
      });

      const imageData = await preprocessor.loadImagesFromFiles(Array.from(files), labels);
      setAbnormalEyes(prev => [...prev, ...imageData]);
      updateDatasetStats();
    } catch (error) {
      console.error('Failed to upload abnormal eyes:', error);
    }
  };

  const processImageFile = (file: File): Promise<{ image: HTMLImageElement; tensor: tf.Tensor }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Convert to tensor for processing
          const tensor = tf.browser.fromPixels(img)
            .resizeBilinear([224, 224])
            .toFloat()
            .div(255.0)
            .expandDims(0);
          
          resolve({ image: img, tensor });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const assessImageQuality = async (image: HTMLImageElement): Promise<'excellent' | 'good' | 'fair' | 'poor'> => {
    // Simple quality assessment based on image characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'fair';
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate basic quality metrics
    let brightness = 0;
    let contrast = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);
    
    // Simple quality classification
    if (brightness > 200 || brightness < 50) return 'poor';
    if (brightness > 180 || brightness < 80) return 'fair';
    if (brightness > 160 || brightness < 100) return 'good';
    return 'excellent';
  };

  const analyzeUploadedImages = async (images: NormalEyeData[]) => {
    if (!model || !preprocessor) return;
    
    setIsAnalyzing(true);
    const results: any[] = [];
    
    try {
      for (const normalEye of images) {
        const prediction = await model.predict(normalEye.image, ['Normal', 'Abnormal']);
        results.push({
          id: normalEye.id,
          filename: normalEye.filename,
          prediction: prediction,
          isActuallyNormal: prediction.className === 'Normal' && prediction.confidence > 0.8
        });
      }
      
      setAnalysisResults(results);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startTraining = async () => {
    if (!model || !preprocessor || (normalEyes.length + abnormalEyes.length) < 10) return;
    
    setIsTraining(true);
    
    try {
      // Combine normal and abnormal data
      const allData: ImageData[] = [
        ...normalEyes.map(eye => ({
          image: eye.image,
          label: 'Normal',
          tensor: tf.browser.fromPixels(eye.image)
            .resizeBilinear([224, 224])
            .toFloat()
            .div(255.0)
            .expandDims(0)
        })),
        ...abnormalEyes
      ];
      
      // Preprocess dataset
      const { trainTensors, validationTensors } = await preprocessor.preprocessDataset(
        allData,
        ['Normal', ...Object.keys(abnormalEyes.reduce((acc, img) => {
          acc[img.label] = true;
          return acc;
        }, {} as { [key: string]: boolean }))],
        trainingConfig.validationSplit,
        0.1
      );
      
      // Update model config
      model.updateConfig({
        epochs: trainingConfig.epochs,
        batchSize: trainingConfig.batchSize,
        learningRate: trainingConfig.learningRate
      });
      
      // Start training
      await model.train(
        trainTensors.images,
        trainTensors.labels,
        validationTensors.images,
        validationTensors.labels
      );
      
      // Clean up tensors
      trainTensors.images.dispose();
      trainTensors.labels.dispose();
      validationTensors.images.dispose();
      validationTensors.labels.dispose();
      
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const deleteSelectedImages = () => {
    setNormalEyes(prev => prev.filter(eye => !selectedImages.includes(eye.id)));
    setAbnormalEyes(prev => prev.filter(img => !selectedImages.includes(img.id)));
    setSelectedImages([]);
    updateDatasetStats();
  };

  const exportDataset = () => {
    const dataset = {
      diseaseType,
      normalEyes: normalEyes.map(eye => ({
        id: eye.id,
        filename: eye.filename,
        uploadDate: eye.uploadDate,
        quality: eye.quality,
        verified: eye.verified,
        notes: eye.notes
      })),
      abnormalEyes: abnormalEyes.map(img => ({
        id: img.id,
        filename: img.filename,
        label: img.label
      })),
      stats: datasetStats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retina_${diseaseType}_dataset_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNormalEyes = normalEyes.filter(eye => {
    const matchesQuality = filterQuality === 'all' || eye.quality === filterQuality;
    const matchesSearch = eye.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuality && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            ML Control Dashboard - {diseaseType.charAt(0).toUpperCase() + diseaseType.slice(1)}
          </CardTitle>
          <CardDescription className="text-white/60">
            Comprehensive machine learning control with normal eye condition management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${isModelReady ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className="text-sm">Model: {isModelReady ? 'Ready' : 'Loading'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className={`w-4 h-4 ${gpuAvailable ? 'text-green-400' : 'text-gray-400'}`} />
              <span className="text-sm">GPU: {gpuAvailable ? 'Available' : 'CPU Only'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Dataset: {datasetStats?.totalImages || 0} images</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isTraining ? 'text-red-400' : 'text-gray-400'}`} />
              <span className="text-sm">Status: {isTraining ? 'Training' : 'Idle'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Control Panel */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-transparent border-white/20">
          <TabsTrigger value="dataset" className="text-white data-[state=active]:bg-white/10">
            <Database className="w-4 h-4 mr-2" />
            Dataset
          </TabsTrigger>
          <TabsTrigger value="training" className="text-white data-[state=active]:bg-white/10">
            <Play className="w-4 h-4 mr-2" />
            Training
          </TabsTrigger>
          <TabsTrigger value="augmentation" className="text-white data-[state=active]:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Augmentation
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="text-white data-[state=active]:bg-white/10">
            <BarChart3 className="w-4 h-4 mr-2" />
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="deployment" className="text-white data-[state=active]:bg-white/10">
            <Share2 className="w-4 h-4 mr-2" />
            Deployment
          </TabsTrigger>
        </TabsList>

        {/* Dataset Management Tab */}
        <TabsContent value="dataset" className="space-y-6">
          {/* Upload Controls */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Dataset Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Normal Eye Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold">Normal Eye Images</h3>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {normalEyes.length} images
                    </Badge>
                  </div>
                  <div className="border-2 border-dashed border-green-400/30 rounded-lg p-6 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-green-400/60" />
                    <p className="text-sm text-white/60 mb-3">
                      Upload normal eye condition images for training baseline
                    </p>
                    <input
                      ref={normalFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleNormalEyeUpload}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => normalFileInputRef.current?.click()}
                      className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Normal Eyes
                    </Button>
                  </div>
                </div>

                {/* Abnormal Eye Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold">Abnormal Eye Images</h3>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      {abnormalEyes.length} images
                    </Badge>
                  </div>
                  <div className="border-2 border-dashed border-red-400/30 rounded-lg p-6 text-center">
                    <EyeOff className="w-12 h-12 mx-auto mb-3 text-red-400/60" />
                    <p className="text-sm text-white/60 mb-3">
                      Upload abnormal eye images for disease detection
                    </p>
                    <input
                      ref={abnormalFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAbnormalEyeUpload}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => abnormalFileInputRef.current?.click()}
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Abnormal Eyes
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dataset Statistics */}
              {datasetStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-white/60">Total Images</p>
                    <p className="text-2xl font-bold">{datasetStats.totalImages}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">Normal</p>
                    <p className="text-2xl font-bold text-green-400">{datasetStats.normalImages}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">Abnormal</p>
                    <p className="text-2xl font-bold text-red-400">{datasetStats.abnormalImages}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">Balance</p>
                    <p className="text-2xl font-bold">{datasetStats.balance.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  Image Gallery
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select value={filterQuality} onValueChange={setFilterQuality}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                    <Input
                      placeholder="Search images..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredNormalEyes.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
                  <p className="text-white/60">No images uploaded yet</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
                  {filteredNormalEyes.map((eye) => (
                    <div
                      key={eye.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedImages.includes(eye.id)
                          ? 'border-blue-400 bg-blue-400/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        setSelectedImages(prev =>
                          prev.includes(eye.id)
                            ? prev.filter(id => id !== eye.id)
                            : [...prev, eye.id]
                        );
                      }}
                    >
                      <img
                        src={eye.image.src}
                        alt={eye.filename}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-1 left-1 right-1">
                          <p className="text-xs text-white truncate">{eye.filename}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${
                              eye.quality === 'excellent' ? 'bg-green-500/20 text-green-300' :
                              eye.quality === 'good' ? 'bg-blue-500/20 text-blue-300' :
                              eye.quality === 'fair' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {eye.quality}
                            </Badge>
                            {eye.verified && (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedImages.includes(eye.id) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              {selectedImages.length > 0 && (
                <div className="flex items-center justify-between mt-4 p-4 bg-white/5 rounded-lg">
                  <span className="text-sm text-white/60">
                    {selectedImages.length} images selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deleteSelectedImages}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportDataset}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Configuration Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Training Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={trainingConfig.epochs}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={trainingConfig.batchSize}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="learningRate">Learning Rate</Label>
                    <Input
                      id="learningRate"
                      type="number"
                      step="0.0001"
                      value={trainingConfig.learningRate}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="validationSplit">Validation Split</Label>
                    <Input
                      id="validationSplit"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="0.5"
                      value={trainingConfig.validationSplit}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, validationSplit: parseFloat(e.target.value) }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="augmentationEnabled"
                      checked={trainingConfig.augmentationEnabled}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, augmentationEnabled: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="augmentationEnabled">Enable Data Augmentation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="earlyStopping"
                      checked={trainingConfig.earlyStopping}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, earlyStopping: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="earlyStopping">Enable Early Stopping</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={startTraining}
                  disabled={isTraining || !isModelReady || (normalEyes.length + abnormalEyes.length) < 10}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                >
                  {isTraining ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-pulse" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => setTrainingConfig({
                    epochs: DISEASE_CONFIGS[diseaseType].epochs,
                    batchSize: 32,
                    learningRate: 0.001,
                    validationSplit: 0.2,
                    augmentationEnabled: true,
                    earlyStopping: true,
                    patience: 10
                  })}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
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
                    <p className="text-2xl font-bold">{trainingProgress.epoch}/{trainingConfig.epochs}</p>
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
                <Progress 
                  value={(trainingProgress.epoch / trainingConfig.epochs) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Augmentation Tab */}
        <TabsContent value="augmentation" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Data Augmentation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(augmentationConfig).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={(e) => setAugmentationConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Model Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Model evaluation features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Tab */}
        <TabsContent value="deployment" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Model Deployment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Share2 className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Model deployment features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}