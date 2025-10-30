/**
 * Data Augmentation and Preprocessing Control Component
 * Advanced controls for data augmentation and image preprocessing
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Settings, 
  Sliders,
  Image,
  Eye,
  EyeOff,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Droplets,
  Move,
  Maximize2,
  Grid3X3,
  Layers,
  Filter,
  Wand2,
  Save,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Clock,
  Target,
  Crosshair,
  Scissors,
  Crop,
  Palette,
  Sparkles,
  Gauge,
  Stethoscope,
  X
} from 'lucide-react';

interface AugmentationConfig {
  // Geometric Transformations
  rotation: {
    enabled: boolean;
    angle: number; // -30 to 30 degrees
    probability: number; // 0 to 1
  };
  flip: {
    horizontal: boolean;
    vertical: boolean;
    probability: number;
  };
  zoom: {
    enabled: boolean;
    min: number; // 0.8 to 1.0
    max: number; // 1.0 to 1.2
    probability: number;
  };
  translation: {
    enabled: boolean;
    maxShift: number; // 0 to 0.2
    probability: number;
  };
  shear: {
    enabled: boolean;
    intensity: number; // 0 to 0.2
    probability: number;
  };
  
  // Color Transformations
  brightness: {
    enabled: boolean;
    min: number; // 0.7 to 1.3
    max: number; // 0.7 to 1.3
    probability: number;
  };
  contrast: {
    enabled: boolean;
    min: number; // 0.7 to 1.3
    max: number; // 0.7 to 1.3
    probability: number;
  };
  saturation: {
    enabled: boolean;
    min: number; // 0.7 to 1.3
    max: number; // 0.7 to 1.3
    probability: number;
  };
  hue: {
    enabled: boolean;
    maxShift: number; // 0 to 0.1
    probability: number;
  };
  
  // Noise and Blur
  gaussianNoise: {
    enabled: boolean;
    mean: number; // 0
    stdDev: number; // 0 to 0.1
    probability: number;
  };
  saltPepperNoise: {
    enabled: boolean;
    density: number; // 0 to 0.05
    probability: number;
  };
  gaussianBlur: {
    enabled: boolean;
    kernelSize: number; // 1 to 5
    sigma: number; // 0.5 to 2.0
    probability: number;
  };
  motionBlur: {
    enabled: boolean;
    kernelSize: number; // 3 to 15
    angle: number; // 0 to 360
    probability: number;
  };
  
  // Advanced Techniques
  cutout: {
    enabled: boolean;
    count: number; // 1 to 5
    size: number; // 0.1 to 0.5
    probability: number;
  };
  mixup: {
    enabled: boolean;
    alpha: number; // 0.2 to 0.8
    probability: number;
  };
  cutmix: {
    enabled: boolean;
    alpha: number; // 0.2 to 0.8
    probability: number;
  };
  gridMask: {
    enabled: boolean;
    d1: number; // 96 to 224
    d2: number; // 224 to 448
    ratio: number; // 0.3 to 0.7
    probability: number;
  };
}

interface PreprocessingConfig {
  // Basic Preprocessing
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    method: 'bilinear' | 'nearest' | 'bicubic';
  };
  normalize: {
    enabled: boolean;
    method: 'minmax' | 'zscore' | 'robust';
    range: [number, number]; // [0, 1] or [-1, 1]
  };
  centerCrop: {
    enabled: boolean;
    width: number;
    height: number;
  };
  randomCrop: {
    enabled: boolean;
    width: number;
    height: number;
    padding: number;
  };
  
  // Advanced Preprocessing
  histogramEqualization: {
    enabled: boolean;
    method: 'global' | 'adaptive';
  };
  clahe: {
    enabled: boolean;
    clipLimit: number; // 1.0 to 4.0
    tileGridSize: number; // 8 to 32
  };
  gammaCorrection: {
    enabled: boolean;
    gamma: number; // 0.5 to 2.0
  };
  edgeEnhancement: {
    enabled: boolean;
    strength: number; // 0 to 1
  };
  
  // Medical Image Specific
  vesselEnhancement: {
    enabled: boolean;
    method: 'frangi' | 'morphological';
    sensitivity: number; // 0.1 to 1.0
  };
  opticDiscDetection: {
    enabled: boolean;
    method: 'hough' | 'template';
  };
  illuminationCorrection: {
    enabled: boolean;
    method: 'retinex' | 'homomorphic';
  };
}

interface AugmentationResult {
  originalImage: HTMLImageElement;
  augmentedImages: HTMLImageElement[];
  config: AugmentationConfig;
  processingTime: number;
  augmentationCount: number;
}

export default function DataAugmentationControl() {
  // State Management
  const [activeTab, setActiveTab] = useState('augmentation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);
  const [augmentationResults, setAugmentationResults] = useState<AugmentationResult[]>([]);
  const [batchSize, setBatchSize] = useState(10);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png');
  
  // Configuration State
  const [augmentationConfig, setAugmentationConfig] = useState<AugmentationConfig>({
    rotation: { enabled: true, angle: 15, probability: 0.8 },
    flip: { horizontal: true, vertical: false, probability: 0.5 },
    zoom: { enabled: true, min: 0.9, max: 1.1, probability: 0.7 },
    translation: { enabled: true, maxShift: 0.1, probability: 0.6 },
    shear: { enabled: false, intensity: 0.1, probability: 0.5 },
    brightness: { enabled: true, min: 0.8, max: 1.2, probability: 0.7 },
    contrast: { enabled: true, min: 0.8, max: 1.2, probability: 0.7 },
    saturation: { enabled: true, min: 0.8, max: 1.2, probability: 0.6 },
    hue: { enabled: false, maxShift: 0.05, probability: 0.5 },
    gaussianNoise: { enabled: false, mean: 0, stdDev: 0.05, probability: 0.3 },
    saltPepperNoise: { enabled: false, density: 0.02, probability: 0.3 },
    gaussianBlur: { enabled: false, kernelSize: 3, sigma: 1.0, probability: 0.3 },
    motionBlur: { enabled: false, kernelSize: 7, angle: 0, probability: 0.3 },
    cutout: { enabled: false, count: 2, size: 0.2, probability: 0.5 },
    mixup: { enabled: false, alpha: 0.5, probability: 0.5 },
    cutmix: { enabled: false, alpha: 0.5, probability: 0.5 },
    gridMask: { enabled: false, d1: 160, d2: 320, ratio: 0.5, probability: 0.5 }
  });

  const [preprocessingConfig, setPreprocessingConfig] = useState<PreprocessingConfig>({
    resize: { enabled: true, width: 224, height: 224, method: 'bilinear' },
    normalize: { enabled: true, method: 'minmax', range: [0, 1] },
    centerCrop: { enabled: false, width: 224, height: 224 },
    randomCrop: { enabled: false, width: 224, height: 224, padding: 32 },
    histogramEqualization: { enabled: false, method: 'global' },
    clahe: { enabled: false, clipLimit: 2.0, tileGridSize: 8 },
    gammaCorrection: { enabled: false, gamma: 1.0 },
    edgeEnhancement: { enabled: false, strength: 0.5 },
    vesselEnhancement: { enabled: false, method: 'frangi', sensitivity: 0.5 },
    opticDiscDetection: { enabled: false, method: 'hough' },
    illuminationCorrection: { enabled: false, method: 'retinex' }
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper Functions
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await loadImageFile(file);
      setPreviewImage(image);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  // Augmentation Functions
  const applyRotation = (imageData: ImageData, angle: number): ImageData => {
    // Simplified rotation - in real implementation would use proper matrix transformation
    return imageData;
  };

  const applyFlip = (imageData: ImageData, horizontal: boolean, vertical: boolean): ImageData => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageData;

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    ctx.putImageData(imageData, 0, 0);
    
    ctx.save();
    if (horizontal) ctx.scale(-1, 1);
    if (vertical) ctx.scale(1, -1);
    ctx.drawImage(canvas, horizontal ? -canvas.width : 0, vertical ? -canvas.height : 0);
    ctx.restore();
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const applyBrightness = (imageData: ImageData, factor: number): ImageData => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);     // R
      data[i + 1] = Math.min(255, data[i + 1] * factor); // G
      data[i + 2] = Math.min(255, data[i + 2] * factor); // B
    }
    return imageData;
  };

  const applyContrast = (imageData: ImageData, factor: number): ImageData => {
    const data = imageData.data;
    const mean = data.reduce((sum, val, i) => {
      return i % 4 === 3 ? sum : sum + val;
    }, 0) / (data.length * 0.75);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - mean) * factor + mean));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - mean) * factor + mean));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - mean) * factor + mean));
    }
    return imageData;
  };

  const applyGaussianNoise = (imageData: ImageData, mean: number, stdDev: number): ImageData => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = mean + stdDev * (Math.random() - 0.5) * 2;
      data[i] = Math.min(255, Math.max(0, data[i] + noise * 255));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 255));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 255));
    }
    return imageData;
  };

  const imageToCanvas = (image: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    return canvas;
  };

  const canvasToImage = (canvas: HTMLCanvasElement): HTMLImageElement => {
    const img = new Image();
    img.src = canvas.toDataURL(`image/${outputFormat}`);
    return img;
  };

  const applyAugmentation = async (image: HTMLImageElement, count: number = 5): Promise<HTMLImageElement[]> => {
    const augmentedImages: HTMLImageElement[] = [];
    const canvas = imageToCanvas(image);
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < count; i++) {
      let imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
      );

      // Apply augmentations based on probability
      if (augmentationConfig.rotation.enabled && Math.random() < augmentationConfig.rotation.probability) {
        const angle = (Math.random() - 0.5) * 2 * augmentationConfig.rotation.angle;
        imageData = applyRotation(imageData, angle);
      }

      if ((augmentationConfig.flip.horizontal || augmentationConfig.flip.vertical) && 
          Math.random() < augmentationConfig.flip.probability) {
        imageData = applyFlip(imageData, 
          augmentationConfig.flip.horizontal && Math.random() < 0.5,
          augmentationConfig.flip.vertical && Math.random() < 0.5
        );
      }

      if (augmentationConfig.brightness.enabled && Math.random() < augmentationConfig.brightness.probability) {
        const factor = augmentationConfig.brightness.min + 
          Math.random() * (augmentationConfig.brightness.max - augmentationConfig.brightness.min);
        imageData = applyBrightness(imageData, factor);
      }

      if (augmentationConfig.contrast.enabled && Math.random() < augmentationConfig.contrast.probability) {
        const factor = augmentationConfig.contrast.min + 
          Math.random() * (augmentationConfig.contrast.max - augmentationConfig.contrast.min);
        imageData = applyContrast(imageData, factor);
      }

      if (augmentationConfig.gaussianNoise.enabled && Math.random() < augmentationConfig.gaussianNoise.probability) {
        imageData = applyGaussianNoise(imageData, augmentationConfig.gaussianNoise.mean, augmentationConfig.gaussianNoise.stdDev);
      }

      // Convert back to image
      ctx.putImageData(imageData, 0, 0);
      augmentedImages.push(canvasToImage(canvas));
    }

    return augmentedImages;
  };

  const runAugmentation = async () => {
    if (!previewImage) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const startTime = Date.now();
      const augmentedImages = await applyAugmentation(previewImage, batchSize);
      const processingTime = Date.now() - startTime;

      const result: AugmentationResult = {
        originalImage: previewImage,
        augmentedImages,
        config: augmentationConfig,
        processingTime,
        augmentationCount: augmentedImages.length
      };

      setAugmentationResults(prev => [...prev, result]);
      setProcessingProgress(100);
    } catch (error) {
      console.error('Augmentation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const runBatchAugmentation = async () => {
    // Implementation for batch processing multiple images
    console.log('Batch augmentation not implemented yet');
  };

  const saveConfiguration = () => {
    const config = {
      augmentation: augmentationConfig,
      preprocessing: preprocessingConfig
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `augmentation_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.augmentation) setAugmentationConfig(config.augmentation);
        if (config.preprocessing) setPreprocessingConfig(config.preprocessing);
      } catch (error) {
        console.error('Failed to load configuration:', error);
      }
    };
    reader.readAsText(file);
  };

  const resetConfiguration = () => {
    setAugmentationConfig({
      rotation: { enabled: true, angle: 15, probability: 0.8 },
      flip: { horizontal: true, vertical: false, probability: 0.5 },
      zoom: { enabled: true, min: 0.9, max: 1.1, probability: 0.7 },
      translation: { enabled: true, maxShift: 0.1, probability: 0.6 },
      shear: { enabled: false, intensity: 0.1, probability: 0.5 },
      brightness: { enabled: true, min: 0.8, max: 1.2, probability: 0.7 },
      contrast: { enabled: true, min: 0.8, max: 1.2, probability: 0.7 },
      saturation: { enabled: true, min: 0.8, max: 1.2, probability: 0.6 },
      hue: { enabled: false, maxShift: 0.05, probability: 0.5 },
      gaussianNoise: { enabled: false, mean: 0, stdDev: 0.05, probability: 0.3 },
      saltPepperNoise: { enabled: false, density: 0.02, probability: 0.3 },
      gaussianBlur: { enabled: false, kernelSize: 3, sigma: 1.0, probability: 0.3 },
      motionBlur: { enabled: false, kernelSize: 7, angle: 0, probability: 0.3 },
      cutout: { enabled: false, count: 2, size: 0.2, probability: 0.5 },
      mixup: { enabled: false, alpha: 0.5, probability: 0.5 },
      cutmix: { enabled: false, alpha: 0.5, probability: 0.5 },
      gridMask: { enabled: false, d1: 160, d2: 320, ratio: 0.5, probability: 0.5 }
    });
  };

  const updateAugmentationConfig = (path: string, value: any) => {
    setAugmentationConfig(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-6 h-6" />
            Data Augmentation & Preprocessing
          </CardTitle>
          <CardDescription className="text-white/60">
            Advanced controls for data augmentation and image preprocessing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Augmentation Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Preprocessing Controls</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveConfiguration}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetConfiguration}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-transparent border-white/20">
          <TabsTrigger value="augmentation" className="text-white data-[state=active]:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Augmentation
          </TabsTrigger>
          <TabsTrigger value="preprocessing" className="text-white data-[state=active]:bg-white/10">
            <Sliders className="w-4 h-4 mr-2" />
            Preprocessing
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-white data-[state=active]:bg-white/10">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="batch" className="text-white data-[state=active]:bg-white/10">
            <Layers className="w-4 h-4 mr-2" />
            Batch Process
          </TabsTrigger>
        </TabsList>

        {/* Augmentation Tab */}
        <TabsContent value="augmentation" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Geometric Transformations */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="w-5 h-5" />
                  Geometric Transformations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rotation</Label>
                    <Switch
                      checked={augmentationConfig.rotation.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('rotation.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.rotation.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Angle: ±{augmentationConfig.rotation.angle}°</Label>
                        <Slider
                          value={[augmentationConfig.rotation.angle]}
                          onValueChange={([value]) => updateAugmentationConfig('rotation.angle', value)}
                          max={30}
                          min={0}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Probability: {(augmentationConfig.rotation.probability * 100).toFixed(0)}%</Label>
                        <Slider
                          value={[augmentationConfig.rotation.probability * 100]}
                          onValueChange={([value]) => updateAugmentationConfig('rotation.probability', value / 100)}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Flip</Label>
                    <Switch
                      checked={augmentationConfig.flip.horizontal || augmentationConfig.flip.vertical}
                      onCheckedChange={(checked) => {
                        updateAugmentationConfig('flip.horizontal', checked);
                        updateAugmentationConfig('flip.vertical', false);
                      }}
                    />
                  </div>
                  {(augmentationConfig.flip.horizontal || augmentationConfig.flip.vertical) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={augmentationConfig.flip.horizontal}
                          onCheckedChange={(checked) => updateAugmentationConfig('flip.horizontal', checked)}
                        />
                        <Label className="text-xs">Horizontal</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={augmentationConfig.flip.vertical}
                          onCheckedChange={(checked) => updateAugmentationConfig('flip.vertical', checked)}
                        />
                        <Label className="text-xs">Vertical</Label>
                      </div>
                      <div>
                        <Label className="text-xs">Probability: {(augmentationConfig.flip.probability * 100).toFixed(0)}%</Label>
                        <Slider
                          value={[augmentationConfig.flip.probability * 100]}
                          onValueChange={([value]) => updateAugmentationConfig('flip.probability', value / 100)}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Zoom</Label>
                    <Switch
                      checked={augmentationConfig.zoom.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('zoom.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.zoom.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Range: {augmentationConfig.zoom.min.toFixed(1)} - {augmentationConfig.zoom.max.toFixed(1)}</Label>
                        <div className="flex gap-2">
                          <Slider
                            value={[augmentationConfig.zoom.min]}
                            onValueChange={([value]) => updateAugmentationConfig('zoom.min', value)}
                            max={augmentationConfig.zoom.max - 0.1}
                            min={0.8}
                            step={0.05}
                            className="flex-1"
                          />
                          <Slider
                            value={[augmentationConfig.zoom.max]}
                            onValueChange={([value]) => updateAugmentationConfig('zoom.max', value)}
                            max={1.2}
                            min={augmentationConfig.zoom.min + 0.1}
                            step={0.05}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Color Transformations */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Transformations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Brightness</Label>
                    <Switch
                      checked={augmentationConfig.brightness.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('brightness.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.brightness.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Range: {augmentationConfig.brightness.min.toFixed(1)} - {augmentationConfig.brightness.max.toFixed(1)}</Label>
                        <div className="flex gap-2">
                          <Slider
                            value={[augmentationConfig.brightness.min]}
                            onValueChange={([value]) => updateAugmentationConfig('brightness.min', value)}
                            max={augmentationConfig.brightness.max - 0.1}
                            min={0.7}
                            step={0.05}
                            className="flex-1"
                          />
                          <Slider
                            value={[augmentationConfig.brightness.max]}
                            onValueChange={([value]) => updateAugmentationConfig('brightness.max', value)}
                            max={1.3}
                            min={augmentationConfig.brightness.min + 0.1}
                            step={0.05}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Contrast</Label>
                    <Switch
                      checked={augmentationConfig.contrast.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('contrast.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.contrast.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Range: {augmentationConfig.contrast.min.toFixed(1)} - {augmentationConfig.contrast.max.toFixed(1)}</Label>
                        <div className="flex gap-2">
                          <Slider
                            value={[augmentationConfig.contrast.min]}
                            onValueChange={([value]) => updateAugmentationConfig('contrast.min', value)}
                            max={augmentationConfig.contrast.max - 0.1}
                            min={0.7}
                            step={0.05}
                            className="flex-1"
                          />
                          <Slider
                            value={[augmentationConfig.contrast.max]}
                            onValueChange={([value]) => updateAugmentationConfig('contrast.max', value)}
                            max={1.3}
                            min={augmentationConfig.contrast.min + 0.1}
                            step={0.05}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Saturation</Label>
                    <Switch
                      checked={augmentationConfig.saturation.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('saturation.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.saturation.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Range: {augmentationConfig.saturation.min.toFixed(1)} - {augmentationConfig.saturation.max.toFixed(1)}</Label>
                        <div className="flex gap-2">
                          <Slider
                            value={[augmentationConfig.saturation.min]}
                            onValueChange={([value]) => updateAugmentationConfig('saturation.min', value)}
                            max={augmentationConfig.saturation.max - 0.1}
                            min={0.7}
                            step={0.05}
                            className="flex-1"
                          />
                          <Slider
                            value={[augmentationConfig.saturation.max]}
                            onValueChange={([value]) => updateAugmentationConfig('saturation.max', value)}
                            max={1.3}
                            min={augmentationConfig.saturation.min + 0.1}
                            step={0.05}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Noise and Blur */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Noise & Blur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Gaussian Noise</Label>
                    <Switch
                      checked={augmentationConfig.gaussianNoise.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('gaussianNoise.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.gaussianNoise.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Std Dev: {augmentationConfig.gaussianNoise.stdDev.toFixed(2)}</Label>
                        <Slider
                          value={[augmentationConfig.gaussianNoise.stdDev * 100]}
                          onValueChange={([value]) => updateAugmentationConfig('gaussianNoise.stdDev', value / 100)}
                          max={10}
                          min={0}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Salt & Pepper Noise</Label>
                    <Switch
                      checked={augmentationConfig.saltPepperNoise.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('saltPepperNoise.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.saltPepperNoise.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Density: {(augmentationConfig.saltPepperNoise.density * 100).toFixed(1)}%</Label>
                        <Slider
                          value={[augmentationConfig.saltPepperNoise.density * 100]}
                          onValueChange={([value]) => updateAugmentationConfig('saltPepperNoise.density', value / 100)}
                          max={5}
                          min={0}
                          step={0.5}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Gaussian Blur</Label>
                    <Switch
                      checked={augmentationConfig.gaussianBlur.enabled}
                      onCheckedChange={(checked) => updateAugmentationConfig('gaussianBlur.enabled', checked)}
                    />
                  </div>
                  {augmentationConfig.gaussianBlur.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Kernel Size: {augmentationConfig.gaussianBlur.kernelSize}</Label>
                        <Slider
                          value={[augmentationConfig.gaussianBlur.kernelSize]}
                          onValueChange={([value]) => updateAugmentationConfig('gaussianBlur.kernelSize', value)}
                          max={5}
                          min={1}
                          step={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preprocessing Tab */}
        <TabsContent value="preprocessing" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Preprocessing */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Preprocessing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Resize</Label>
                    <Switch
                      checked={preprocessingConfig.resize.enabled}
                      onCheckedChange={(checked) => setPreprocessingConfig(prev => ({
                        ...prev,
                        resize: { ...prev.resize, enabled: checked }
                      }))}
                    />
                  </div>
                  {preprocessingConfig.resize.enabled && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={preprocessingConfig.resize.width}
                            onChange={(e) => setPreprocessingConfig(prev => ({
                              ...prev,
                              resize: { ...prev.resize, width: parseInt(e.target.value) }
                            }))}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={preprocessingConfig.resize.height}
                            onChange={(e) => setPreprocessingConfig(prev => ({
                              ...prev,
                              resize: { ...prev.resize, height: parseInt(e.target.value) }
                            }))}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Method</Label>
                        <Select
                          value={preprocessingConfig.resize.method}
                          onValueChange={(value) => setPreprocessingConfig(prev => ({
                            ...prev,
                            resize: { ...prev.resize, method: value as any }
                          }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bilinear">Bilinear</SelectItem>
                            <SelectItem value="nearest">Nearest</SelectItem>
                            <SelectItem value="bicubic">Bicubic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Normalize</Label>
                    <Switch
                      checked={preprocessingConfig.normalize.enabled}
                      onCheckedChange={(checked) => setPreprocessingConfig(prev => ({
                        ...prev,
                        normalize: { ...prev.normalize, enabled: checked }
                      }))}
                    />
                  </div>
                  {preprocessingConfig.normalize.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Method</Label>
                        <Select
                          value={preprocessingConfig.normalize.method}
                          onValueChange={(value) => setPreprocessingConfig(prev => ({
                            ...prev,
                            normalize: { ...prev.normalize, method: value as any }
                          }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minmax">Min-Max</SelectItem>
                            <SelectItem value="zscore">Z-Score</SelectItem>
                            <SelectItem value="robust">Robust</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Range</Label>
                        <Select
                          value={`${preprocessingConfig.normalize.range[0]},${preprocessingConfig.normalize.range[1]}`}
                          onValueChange={(value) => {
                            const [min, max] = value.split(',').map(Number);
                            setPreprocessingConfig(prev => ({
                              ...prev,
                              normalize: { ...prev.normalize, range: [min, max] }
                            }));
                          }}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0,1">[0, 1]</SelectItem>
                            <SelectItem value="-1,1">[-1, 1]</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical Image Specific */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Medical Image Specific
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Vessel Enhancement</Label>
                    <Switch
                      checked={preprocessingConfig.vesselEnhancement.enabled}
                      onCheckedChange={(checked) => setPreprocessingConfig(prev => ({
                        ...prev,
                        vesselEnhancement: { ...prev.vesselEnhancement, enabled: checked }
                      }))}
                    />
                  </div>
                  {preprocessingConfig.vesselEnhancement.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Method</Label>
                        <Select
                          value={preprocessingConfig.vesselEnhancement.method}
                          onValueChange={(value) => setPreprocessingConfig(prev => ({
                            ...prev,
                            vesselEnhancement: { ...prev.vesselEnhancement, method: value as any }
                          }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frangi">Frangi</SelectItem>
                            <SelectItem value="morphological">Morphological</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Sensitivity: {(preprocessingConfig.vesselEnhancement.sensitivity * 100).toFixed(0)}%</Label>
                        <Slider
                          value={[preprocessingConfig.vesselEnhancement.sensitivity * 100]}
                          onValueChange={([value]) => setPreprocessingConfig(prev => ({
                            ...prev,
                            vesselEnhancement: { ...prev.vesselEnhancement, sensitivity: value / 100 }
                          }))}
                          max={100}
                          min={10}
                          step={10}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Optic Disc Detection</Label>
                    <Switch
                      checked={preprocessingConfig.opticDiscDetection.enabled}
                      onCheckedChange={(checked) => setPreprocessingConfig(prev => ({
                        ...prev,
                        opticDiscDetection: { ...prev.opticDiscDetection, enabled: checked }
                      }))}
                    />
                  </div>
                  {preprocessingConfig.opticDiscDetection.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Method</Label>
                        <Select
                          value={preprocessingConfig.opticDiscDetection.method}
                          onValueChange={(value) => setPreprocessingConfig(prev => ({
                            ...prev,
                            opticDiscDetection: { ...prev.opticDiscDetection, method: value as any }
                          }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hough">Hough Transform</SelectItem>
                            <SelectItem value="template">Template Matching</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Illumination Correction</Label>
                    <Switch
                      checked={preprocessingConfig.illuminationCorrection.enabled}
                      onCheckedChange={(checked) => setPreprocessingConfig(prev => ({
                        ...prev,
                        illuminationCorrection: { ...prev.illuminationCorrection, enabled: checked }
                      }))}
                    />
                  </div>
                  {preprocessingConfig.illuminationCorrection.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Method</Label>
                        <Select
                          value={preprocessingConfig.illuminationCorrection.method}
                          onValueChange={(value) => setPreprocessingConfig(prev => ({
                            ...prev,
                            illuminationCorrection: { ...prev.illuminationCorrection, method: value as any }
                          }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retinex">Retinex</SelectItem>
                            <SelectItem value="homomorphic">Homomorphic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!previewImage ? (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                    <Image className="w-12 h-12 mx-auto mb-3 text-white/40" />
                    <p className="text-sm text-white/60 mb-3">
                      Upload an image to preview augmentations
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={previewImage.src}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg bg-black/20"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 border-white/30 text-white hover:bg-white/10"
                        onClick={() => setPreviewImage(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Batch Size</Label>
                        <Input
                          type="number"
                          value={batchSize}
                          onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                          className="w-20 bg-white/10 border-white/20 text-white"
                          min={1}
                          max={50}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Output Format</Label>
                        <Select
                          value={outputFormat}
                          onValueChange={(value) => setOutputFormat(value as 'png' | 'jpeg')}
                        >
                          <SelectTrigger className="w-24 bg-white/10 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={runAugmentation}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {isProcessing ? (
                        <>
                          <Activity className="w-4 h-4 mr-2 animate-pulse" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Apply Augmentations
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Augmentation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {augmentationResults.length === 0 ? (
                  <div className="text-center py-8">
                    <EyeOff className="w-12 h-12 mx-auto mb-3 text-white/20" />
                    <p className="text-sm text-white/60">
                      Apply augmentations to see results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {augmentationResults.map((result, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Result {index + 1}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Clock className="w-3 h-3" />
                            <span>{result.processingTime}ms</span>
                            <Image className="w-3 h-3" />
                            <span>{result.augmentationCount} images</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <img
                              src={result.originalImage.src}
                              alt="Original"
                              className="w-full h-20 object-cover rounded border border-white/20"
                            />
                            <p className="text-xs text-white/60 mt-1">Original</p>
                          </div>
                          {result.augmentedImages.slice(0, 2).map((img, imgIndex) => (
                            <div key={imgIndex} className="text-center">
                              <img
                                src={img.src}
                                alt={`Augmented ${imgIndex + 1}`}
                                className="w-full h-20 object-cover rounded border border-white/20"
                              />
                              <p className="text-xs text-white/60 mt-1">Aug {imgIndex + 1}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Activity className="w-6 h-6 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Processing Augmentations</span>
                      <span className="text-sm text-white/60">{processingProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Batch Process Tab */}
        <TabsContent value="batch" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Batch Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Layers className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Batch processing features coming soon</p>
                <p className="text-sm text-white/40 mt-2">
                  Process multiple images with the same augmentation pipeline
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}