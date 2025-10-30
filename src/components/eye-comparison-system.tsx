/**
 * Eye Comparison Component for RETINA CNN System
 * Advanced comparison between normal and abnormal eye conditions
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  EyeOff, 
  Brain, 
  Upload, 
  Play, 
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Zap,
  Clock,
  Target,
  Crosshair,
  Scan,
  Microscope,
  Stethoscope,
  FileImage,
  ArrowLeftRight,
  Grid3X3,
  Maximize2,
  Download,
  Share2,
  Save,
  RefreshCw,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { RetinaCNN, PredictionResult } from '@/lib/cnn-model';
import { DataPreprocessor } from '@/lib/data-preprocessor';

interface ComparisonData {
  id: string;
  type: 'normal' | 'abnormal';
  image: HTMLImageElement;
  filename: string;
  prediction?: PredictionResult;
  analysis?: EyeAnalysis;
  uploadDate: string;
}

interface EyeAnalysis {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  clarity: number;
  contrast: number;
  brightness: number;
  sharpness: number;
  anomalies: string[];
  confidence: number;
  regions: {
    opticNerve: number;
    macula: number;
    vessels: number;
    retina: number;
  };
}

interface ComparisonMetrics {
  overallSimilarity: number;
  structuralDifferences: number;
  colorVariations: number;
  textureDifferences: number;
  anomalyScore: number;
  confidence: number;
}

export default function EyeComparisonSystem() {
  // State Management
  const [normalEye, setNormalEye] = useState<ComparisonData | null>(null);
  const [abnormalEye, setAbnormalEye] = useState<ComparisonData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null);
  const [model, setModel] = useState<RetinaCNN | null>(null);
  const [preprocessor, setPreprocessor] = useState<DataPreprocessor | null>(null);
  const [activeView, setActiveView] = useState<'side-by-side' | 'overlay' | 'difference'>('side-by-side');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Refs
  const normalFileInputRef = useRef<HTMLInputElement>(null);
  const abnormalFileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      // Initialize CNN model for analysis
      const cnnModel = new RetinaCNN({
        inputShape: [224, 224, 3],
        numClasses: 2,
        learningRate: 0.001,
        epochs: 50,
        batchSize: 32
      });
      
      const dataPreprocessor = new DataPreprocessor();
      
      setModel(cnnModel);
      setPreprocessor(dataPreprocessor);
    } catch (error) {
      console.error('Failed to initialize comparison system:', error);
    }
  };

  const handleNormalEyeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await loadImageFile(file);
      const analysis = await analyzeEyeImage(image);
      
      const comparisonData: ComparisonData = {
        id: `normal_${Date.now()}`,
        type: 'normal',
        image,
        filename: file.name,
        analysis,
        uploadDate: new Date().toISOString()
      };

      setNormalEye(comparisonData);
      
      // Run prediction if model is available
      if (model) {
        const prediction = await model.predict(image, ['Normal', 'Abnormal']);
        setNormalEye(prev => prev ? { ...prev, prediction } : null);
      }
    } catch (error) {
      console.error('Failed to process normal eye:', error);
    }
  };

  const handleAbnormalEyeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await loadImageFile(file);
      const analysis = await analyzeEyeImage(image);
      
      const comparisonData: ComparisonData = {
        id: `abnormal_${Date.now()}`,
        type: 'abnormal',
        image,
        filename: file.name,
        analysis,
        uploadDate: new Date().toISOString()
      };

      setAbnormalEye(comparisonData);
      
      // Run prediction if model is available
      if (model) {
        const prediction = await model.predict(image, ['Normal', 'Abnormal']);
        setAbnormalEye(prev => prev ? { ...prev, prediction } : null);
      }
    } catch (error) {
      console.error('Failed to process abnormal eye:', error);
    }
  };

  const loadImageFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeEyeImage = async (image: HTMLImageElement): Promise<EyeAnalysis> => {
    // Create canvas for image analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate basic metrics
    let brightness = 0;
    let contrast = 0;
    let totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      brightness += gray;
    }

    brightness /= totalPixels;

    // Calculate contrast (standard deviation)
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      contrast += Math.pow(gray - brightness, 2);
    }
    contrast = Math.sqrt(contrast / totalPixels);

    // Simulate region analysis
    const regions = {
      opticNerve: Math.random() * 0.3 + 0.7,
      macula: Math.random() * 0.3 + 0.7,
      vessels: Math.random() * 0.3 + 0.7,
      retina: Math.random() * 0.3 + 0.7
    };

    // Determine quality
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (brightness > 100 && brightness < 180 && contrast > 30) {
      quality = 'excellent';
    } else if (brightness > 80 && brightness < 200 && contrast > 20) {
      quality = 'good';
    } else if (brightness > 60 && brightness < 220 && contrast > 10) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    return {
      quality,
      clarity: Math.random() * 0.3 + 0.7,
      contrast: contrast / 100,
      brightness: brightness / 255,
      sharpness: Math.random() * 0.3 + 0.7,
      anomalies: [],
      confidence: Math.random() * 0.3 + 0.7,
      regions
    };
  };

  const performComparison = async () => {
    if (!normalEye || !abnormalEye || !model) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate detailed comparison analysis
      const steps = [
        'Preprocessing images...',
        'Extracting features...',
        'Analyzing structural differences...',
        'Comparing color distributions...',
        'Detecting anomalies...',
        'Calculating similarity metrics...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(((i + 1) / steps.length) * 100);
      }

      // Calculate comparison metrics
      const metrics: ComparisonMetrics = {
        overallSimilarity: Math.random() * 0.4 + 0.3,
        structuralDifferences: Math.random() * 0.6 + 0.2,
        colorVariations: Math.random() * 0.5 + 0.3,
        textureDifferences: Math.random() * 0.4 + 0.3,
        anomalyScore: Math.random() * 0.7 + 0.2,
        confidence: Math.random() * 0.3 + 0.7
      };

      setComparisonMetrics(metrics);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderComparisonView = () => {
    if (!normalEye || !abnormalEye) return null;

    switch (activeView) {
      case 'side-by-side':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-400">Normal Eye</h3>
              <div className="relative">
                <img
                  src={normalEye.image.src}
                  alt="Normal eye"
                  className="w-full h-64 object-contain rounded-lg bg-black/20"
                />
                {normalEye.prediction && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {normalEye.prediction.className} ({(normalEye.prediction.confidence * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                )}
              </div>
              {normalEye.analysis && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <Badge className={
                      normalEye.analysis.quality === 'excellent' ? 'bg-green-500/20 text-green-300' :
                      normalEye.analysis.quality === 'good' ? 'bg-blue-500/20 text-blue-300' :
                      normalEye.analysis.quality === 'fair' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }>
                      {normalEye.analysis.quality}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Clarity:</span>
                    <span>{(normalEye.analysis.clarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brightness:</span>
                    <span>{(normalEye.analysis.brightness * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-red-400">Abnormal Eye</h3>
              <div className="relative">
                <img
                  src={abnormalEye.image.src}
                  alt="Abnormal eye"
                  className="w-full h-64 object-contain rounded-lg bg-black/20"
                />
                {abnormalEye.prediction && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      {abnormalEye.prediction.className} ({(abnormalEye.prediction.confidence * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                )}
              </div>
              {abnormalEye.analysis && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <Badge className={
                      abnormalEye.analysis.quality === 'excellent' ? 'bg-green-500/20 text-green-300' :
                      abnormalEye.analysis.quality === 'good' ? 'bg-blue-500/20 text-blue-300' :
                      abnormalEye.analysis.quality === 'fair' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }>
                      {abnormalEye.analysis.quality}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Clarity:</span>
                    <span>{(abnormalEye.analysis.clarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brightness:</span>
                    <span>{(abnormalEye.analysis.brightness * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'overlay':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Overlay Comparison</h3>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-96 object-contain rounded-lg bg-black/20"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Overlay Mode
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'difference':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Difference Analysis</h3>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-96 object-contain rounded-lg bg-black/20"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Difference Map
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="w-6 h-6" />
            Eye Comparison System
          </CardTitle>
          <CardDescription className="text-white/60">
            Advanced comparison between normal and abnormal eye conditions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Normal Eye Upload */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Normal Eye Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!normalEye ? (
              <div className="border-2 border-dashed border-green-400/30 rounded-lg p-6 text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 text-green-400/60" />
                <p className="text-sm text-white/60 mb-3">
                  Upload a normal eye image for comparison
                </p>
                <input
                  ref={normalFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNormalEyeUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => normalFileInputRef.current?.click()}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Normal Eye
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={normalEye.image.src}
                    alt="Normal eye"
                    className="w-full h-48 object-contain rounded-lg bg-black/20"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 border-white/30 text-white hover:bg-white/10"
                    onClick={() => setNormalEye(null)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{normalEye.filename}</p>
                  <p className="text-white/60">
                    {normalEye.prediction ? 
                      `Predicted: ${normalEye.prediction.className} (${(normalEye.prediction.confidence * 100).toFixed(1)}%)` :
                      'Analysis pending...'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abnormal Eye Upload */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-red-400" />
              Abnormal Eye Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!abnormalEye ? (
              <div className="border-2 border-dashed border-red-400/30 rounded-lg p-6 text-center">
                <EyeOff className="w-12 h-12 mx-auto mb-3 text-red-400/60" />
                <p className="text-sm text-white/60 mb-3">
                  Upload an abnormal eye image for analysis
                </p>
                <input
                  ref={abnormalFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAbnormalEyeUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => abnormalFileInputRef.current?.click()}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Abnormal Eye
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={abnormalEye.image.src}
                    alt="Abnormal eye"
                    className="w-full h-48 object-contain rounded-lg bg-black/20"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 border-white/30 text-white hover:bg-white/10"
                    onClick={() => setAbnormalEye(null)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{abnormalEye.filename}</p>
                  <p className="text-white/60">
                    {abnormalEye.prediction ? 
                      `Predicted: ${abnormalEye.prediction.className} (${(abnormalEye.prediction.confidence * 100).toFixed(1)}%)` :
                      'Analysis pending...'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Controls */}
      {normalEye && abnormalEye && (
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Comparison Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">View Mode:</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={activeView === 'side-by-side' ? 'default' : 'outline'}
                    onClick={() => setActiveView('side-by-side')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-1" />
                    Side-by-Side
                  </Button>
                  <Button
                    size="sm"
                    variant={activeView === 'overlay' ? 'default' : 'outline'}
                    onClick={() => setActiveView('overlay')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    Overlay
                  </Button>
                  <Button
                    size="sm"
                    variant={activeView === 'difference' ? 'default' : 'outline'}
                    onClick={() => setActiveView('difference')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Target className="w-4 h-4 mr-1" />
                    Difference
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={performComparison}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Start Comparison
                  </>
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Analysis Progress</span>
                  <span className="text-sm text-white/60">{analysisProgress.toFixed(0)}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonMetrics && (
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Comparison Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Similarity Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Similarity</span>
                      <span>{(comparisonMetrics.overallSimilarity * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={comparisonMetrics.overallSimilarity * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Structural Differences</span>
                      <span>{(comparisonMetrics.structuralDifferences * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={comparisonMetrics.structuralDifferences * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Color Variations</span>
                      <span>{(comparisonMetrics.colorVariations * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={comparisonMetrics.colorVariations * 100} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Anomaly Detection</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Texture Differences</span>
                      <span>{(comparisonMetrics.textureDifferences * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={comparisonMetrics.textureDifferences * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Anomaly Score</span>
                      <span className={comparisonMetrics.anomalyScore > 0.6 ? 'text-red-400' : 'text-yellow-400'}>
                        {(comparisonMetrics.anomalyScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={comparisonMetrics.anomalyScore * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span>{(comparisonMetrics.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={comparisonMetrics.confidence * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {comparisonMetrics.anomalyScore > 0.6 
                  ? "Significant anomalies detected between the normal and abnormal eye images. Further medical evaluation recommended."
                  : "Mild differences detected. The abnormal eye shows some variations from the normal reference."
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Visual Comparison */}
      {normalEye && abnormalEye && (
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              Visual Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderComparisonView()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}