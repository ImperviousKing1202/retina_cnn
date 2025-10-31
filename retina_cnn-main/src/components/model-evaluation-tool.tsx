/**
 * Model Evaluation and Comparison Tool for RETINA CNN System
 * Comprehensive model evaluation, comparison, and analysis tools
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
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Brain,
  Activity,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu,
  Database,
  FileImage,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Square,
  Eye,
  EyeOff,
  Gauge,
  Award,
  Trophy,
  Star,
  Hash,
  LineChart,
  PieChart,
  ScatterChart,
  Heatmap,
  Layers,
  GitBranch,
  GitMerge,
  GitCommit,
  Calendar,
  Filter,
  Search,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowLeftRight,
  Minus,
  Plus,
  ChevronUp,
  ChevronDown,
  Info,
  HelpCircle,
  Lightbulb,
  Flag,
  Bookmark,
  Share2,
  Save,
  Trash2,
  Copy,
  Archive
} from 'lucide-react';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  specificity: number;
  sensitivity: number;
  loss: number;
  valLoss: number;
  valAccuracy: number;
  trainingTime: number;
  inferenceTime: number;
  modelSize: number;
  parameters: number;
  flops: number;
  memoryUsage: number;
}

interface ModelVersion {
  id: string;
  name: string;
  version: string;
  description: string;
  diseaseType: 'glaucoma' | 'retinopathy' | 'cataract';
  architecture: string;
  createdAt: string;
  trainedAt: string;
  metrics: ModelMetrics;
  status: 'training' | 'completed' | 'failed' | 'deployed';
  isBest: boolean;
  tags: string[];
  dataset: string;
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    optimizer: string;
  };
  confusionMatrix?: number[][];
  rocCurve?: { fpr: number[]; tpr: number[]; auc: number };
  precisionRecallCurve?: { precision: number[]; recall: number[]; auc: number };
  classMetrics?: { [className: string]: Partial<ModelMetrics> };
}

interface ComparisonResult {
  model1: ModelVersion;
  model2: ModelVersion;
  comparison: {
    accuracyDiff: number;
    precisionDiff: number;
    recallDiff: number;
    f1ScoreDiff: number;
    aucDiff: number;
    speedDiff: number;
    sizeDiff: number;
    winner: 'model1' | 'model2' | 'tie';
    confidence: number;
  };
  recommendations: string[];
}

interface EvaluationDataset {
  id: string;
  name: string;
  description: string;
  size: number;
  split: 'train' | 'validation' | 'test';
  diseaseType: string;
  createdAt: string;
  balanced: boolean;
  classDistribution: { [className: string]: number };
}

export default function ModelEvaluationTool() {
  // State Management
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<EvaluationDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('accuracy');
  const [filterDisease, setFilterDisease] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Chart State
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar'>('bar');
  const [selectedMetric, setSelectedMetric] = useState<keyof ModelMetrics>('accuracy');

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // Load sample models
    const sampleModels: ModelVersion[] = [
      {
        id: 'model_1',
        name: 'GlaucomaNet v2.1',
        version: '2.1.0',
        description: 'Enhanced glaucoma detection with attention mechanism',
        diseaseType: 'glaucoma',
        architecture: 'ResNet-50 + Attention',
        createdAt: new Date().toISOString(),
        trainedAt: new Date().toISOString(),
        metrics: {
          accuracy: 0.942,
          precision: 0.938,
          recall: 0.946,
          f1Score: 0.942,
          auc: 0.982,
          specificity: 0.935,
          sensitivity: 0.946,
          loss: 0.156,
          valLoss: 0.178,
          valAccuracy: 0.938,
          trainingTime: 3600,
          inferenceTime: 45,
          modelSize: 45.2,
          parameters: 25600000,
          flops: 4200000000,
          memoryUsage: 128
        },
        status: 'deployed',
        isBest: true,
        tags: ['glaucoma', 'attention', 'resnet', 'production'],
        dataset: 'glaucoma_dataset_v3',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          epochs: 50,
          optimizer: 'Adam'
        }
      },
      {
        id: 'model_2',
        name: 'RetinaNet v1.5',
        version: '1.5.0',
        description: 'Diabetic retinopathy classification with multi-scale features',
        diseaseType: 'retinopathy',
        architecture: 'EfficientNet-B3',
        createdAt: new Date().toISOString(),
        trainedAt: new Date().toISOString(),
        metrics: {
          accuracy: 0.928,
          precision: 0.925,
          recall: 0.931,
          f1Score: 0.928,
          auc: 0.971,
          specificity: 0.918,
          sensitivity: 0.931,
          loss: 0.201,
          valLoss: 0.234,
          valAccuracy: 0.922,
          trainingTime: 4800,
          inferenceTime: 62,
          modelSize: 38.7,
          parameters: 21000000,
          flops: 3800000000,
          memoryUsage: 96
        },
        status: 'completed',
        isBest: true,
        tags: ['retinopathy', 'efficientnet', 'multi-class'],
        dataset: 'retinopathy_dataset_v2',
        hyperparameters: {
          learningRate: 0.0005,
          batchSize: 64,
          epochs: 75,
          optimizer: 'AdamW'
        }
      },
      {
        id: 'model_3',
        name: 'CataractNet v1.0',
        version: '1.0.0',
        description: 'Cataract detection using transfer learning',
        diseaseType: 'cataract',
        architecture: 'MobileNetV2',
        createdAt: new Date().toISOString(),
        trainedAt: new Date().toISOString(),
        metrics: {
          accuracy: 0.895,
          precision: 0.891,
          recall: 0.898,
          f1Score: 0.894,
          auc: 0.945,
          specificity: 0.887,
          sensitivity: 0.898,
          loss: 0.287,
          valLoss: 0.312,
          valAccuracy: 0.889,
          trainingTime: 2400,
          inferenceTime: 28,
          modelSize: 14.3,
          parameters: 3500000,
          flops: 600000000,
          memoryUsage: 64
        },
        status: 'completed',
        isBest: false,
        tags: ['cataract', 'mobilenet', 'lightweight'],
        dataset: 'cataract_dataset_v1',
        hyperparameters: {
          learningRate: 0.002,
          batchSize: 128,
          epochs: 40,
          optimizer: 'SGD'
        }
      }
    ];

    setModels(sampleModels);

    // Load sample datasets
    const sampleDatasets: EvaluationDataset[] = [
      {
        id: 'dataset_1',
        name: 'Glaucoma Test Set',
        description: 'Balanced test set for glaucoma detection',
        size: 2000,
        split: 'test',
        diseaseType: 'glaucoma',
        createdAt: new Date().toISOString(),
        balanced: true,
        classDistribution: { 'Normal': 1000, 'Glaucoma': 1000 }
      },
      {
        id: 'dataset_2',
        name: 'DR Validation Set',
        description: 'Multi-class diabetic retinopathy validation',
        size: 1500,
        split: 'validation',
        diseaseType: 'retinopathy',
        createdAt: new Date().toISOString(),
        balanced: false,
        classDistribution: { 'No DR': 600, 'Mild': 300, 'Moderate': 300, 'Severe': 200, 'Proliferative': 100 }
      }
    ];

    setDatasets(sampleDatasets);
    setSelectedDataset(sampleDatasets[0].id);
  };

  const runEvaluation = async (modelId: string) => {
    setIsEvaluating(true);
    setEvaluationProgress(0);

    try {
      // Simulate evaluation process
      const steps = [
        'Loading model...',
        'Preparing dataset...',
        'Running inference...',
        'Calculating metrics...',
        'Generating visualizations...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvaluationProgress(((i + 1) / steps.length) * 100);
      }

      // Update model status
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'completed' as const }
          : model
      ));

    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const compareModels = (model1Id: string, model2Id: string) => {
    const model1 = models.find(m => m.id === model1Id);
    const model2 = models.find(m => m.id === model2Id);
    
    if (!model1 || !model2) return;

    const comparison: ComparisonResult = {
      model1,
      model2,
      comparison: {
        accuracyDiff: model1.metrics.accuracy - model2.metrics.accuracy,
        precisionDiff: model1.metrics.precision - model2.metrics.precision,
        recallDiff: model1.metrics.recall - model2.metrics.recall,
        f1ScoreDiff: model1.metrics.f1Score - model2.metrics.f1Score,
        aucDiff: model1.metrics.auc - model2.metrics.auc,
        speedDiff: model2.metrics.inferenceTime - model1.metrics.inferenceTime,
        sizeDiff: model2.metrics.modelSize - model1.metrics.modelSize,
        winner: model1.metrics.accuracy > model2.metrics.accuracy ? 'model1' : 'model2',
        confidence: Math.abs(model1.metrics.accuracy - model2.metrics.accuracy) * 100
      },
      recommendations: generateRecommendations(model1, model2)
    };

    setComparisonResults(prev => [...prev, comparison]);
  };

  const generateRecommendations = (model1: ModelVersion, model2: ModelVersion): string[] => {
    const recommendations: string[] = [];
    
    if (model1.metrics.accuracy > model2.metrics.accuracy) {
      recommendations.push(`${model1.name} shows better overall accuracy (${(model1.metrics.accuracy * 100).toFixed(1)}% vs ${(model2.metrics.accuracy * 100).toFixed(1)}%)`);
    } else {
      recommendations.push(`${model2.name} shows better overall accuracy (${(model2.metrics.accuracy * 100).toFixed(1)}% vs ${(model1.metrics.accuracy * 100).toFixed(1)}%)`);
    }

    if (model1.metrics.inferenceTime < model2.metrics.inferenceTime) {
      recommendations.push(`${model1.name} is faster for inference (${model1.metrics.inferenceTime}ms vs ${model2.metrics.inferenceTime}ms)`);
    } else {
      recommendations.push(`${model2.name} is faster for inference (${model2.metrics.inferenceTime}ms vs ${model1.metrics.inferenceTime}ms)`);
    }

    if (model1.metrics.modelSize < model2.metrics.modelSize) {
      recommendations.push(`${model1.name} has a smaller model size (${model1.metrics.modelSize}MB vs ${model2.metrics.modelSize}MB)`);
    } else {
      recommendations.push(`${model2.name} has a smaller model size (${model2.metrics.modelSize}MB vs ${model1.metrics.modelSize}MB)`);
    }

    return recommendations;
  };

  const getMetricColor = (value: number, metric: keyof ModelMetrics): string => {
    const thresholds: { [key in keyof ModelMetrics]: { good: number; excellent: number } } = {
      accuracy: { good: 0.8, excellent: 0.9 },
      precision: { good: 0.8, excellent: 0.9 },
      recall: { good: 0.8, excellent: 0.9 },
      f1Score: { good: 0.8, excellent: 0.9 },
      auc: { good: 0.85, excellent: 0.95 },
      specificity: { good: 0.8, excellent: 0.9 },
      sensitivity: { good: 0.8, excellent: 0.9 },
      loss: { good: 0.3, excellent: 0.1 },
      valLoss: { good: 0.3, excellent: 0.1 },
      valAccuracy: { good: 0.8, excellent: 0.9 },
      trainingTime: { good: 3600, excellent: 1800 },
      inferenceTime: { good: 100, excellent: 50 },
      modelSize: { good: 50, excellent: 20 },
      parameters: { good: 20000000, excellent: 10000000 },
      flops: { good: 5000000000, excellent: 2000000000 },
      memoryUsage: { good: 128, excellent: 64 }
    };

    const threshold = thresholds[metric];
    const isLowerBetter = ['loss', 'valLoss', 'trainingTime', 'inferenceTime', 'modelSize', 'parameters', 'flops', 'memoryUsage'].includes(metric);

    if (isLowerBetter) {
      if (value <= threshold.excellent) return 'text-green-400';
      if (value <= threshold.good) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= threshold.excellent) return 'text-green-400';
      if (value >= threshold.good) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const formatMetric = (value: number, metric: keyof ModelMetrics): string => {
    switch (metric) {
      case 'accuracy':
      case 'precision':
      case 'recall':
      case 'f1Score':
      case 'auc':
      case 'specificity':
      case 'sensitivity':
      case 'valAccuracy':
        return (value * 100).toFixed(1) + '%';
      case 'loss':
      case 'valLoss':
        return value.toFixed(3);
      case 'trainingTime':
        return (value / 3600).toFixed(1) + 'h';
      case 'inferenceTime':
        return value.toFixed(0) + 'ms';
      case 'modelSize':
        return value.toFixed(1) + 'MB';
      case 'parameters':
        return (value / 1000000).toFixed(1) + 'M';
      case 'flops':
        return (value / 1000000000).toFixed(1) + 'G';
      case 'memoryUsage':
        return value.toFixed(0) + 'MB';
      default:
        return value.toString();
    }
  };

  const filteredModels = models.filter(model => {
    const matchesDisease = filterDisease === 'all' || model.diseaseType === filterDisease;
    const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
    return matchesDisease && matchesStatus;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    const aValue = a.metrics[sortBy as keyof ModelMetrics];
    const bValue = b.metrics[sortBy as keyof ModelMetrics];
    const isLowerBetter = ['loss', 'valLoss', 'trainingTime', 'inferenceTime', 'modelSize', 'parameters', 'flops', 'memoryUsage'].includes(sortBy);
    
    if (isLowerBetter) {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const renderMetricChart = () => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = sortedModels.map(model => model.metrics[selectedMetric]);
    const labels = sortedModels.map(model => model.name);
    
    // Simple bar chart implementation
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    // Draw axes
    ctx.strokeStyle = '#ffffff30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    data.forEach((value, index) => {
      const barHeight = ((value - minValue) / range) * chartHeight;
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = canvas.height - padding - barHeight;

      // Bar color based on performance
      const color = getMetricColor(value, selectedMetric);
      ctx.fillStyle = color.includes('green') ? '#10b981' : color.includes('yellow') ? '#eab308' : '#ef4444';
      ctx.fillRect(x, y, barWidth, barHeight);

      // Value label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatMetric(value, selectedMetric), x + barWidth / 2, y - 5);
    });

    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2;
      ctx.save();
      ctx.translate(x, canvas.height - padding + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(label.substring(0, 15), 0, 0);
      ctx.restore();
    });

    return null;
  };

  useEffect(() => {
    renderMetricChart();
  }, [sortedModels, selectedMetric, chartType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Model Evaluation & Comparison
          </CardTitle>
          <CardDescription className="text-white/60">
            Comprehensive model evaluation, comparison, and analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{models.length} models</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-sm">{datasets.length} datasets</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm">{comparisonResults.length} comparisons</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => selectedModels.forEach(id => runEvaluation(id))}
                disabled={isEvaluating || selectedModels.length === 0}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
              >
                {isEvaluating ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Evaluate Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-transparent border-white/20">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">
            <Gauge className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="models" className="text-white data-[state=active]:bg-white/10">
            <Brain className="w-4 h-4 mr-2" />
            Models
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-white data-[state=active]:bg-white/10">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/10">
            <LineChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-white data-[state=active]:bg-white/10">
            <FileImage className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">
                  {models.filter(m => m.isBest).length}
                </div>
                <p className="text-sm text-white/60">Best Models</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">
                  {models.length > 0 ? (Math.max(...models.map(m => m.metrics.accuracy)) * 100).toFixed(1) : '0'}%
                </div>
                <p className="text-sm text-white/60">Best Accuracy</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">
                  {models.length > 0 ? Math.min(...models.map(m => m.metrics.inferenceTime)).toFixed(0) : '0'}ms
                </div>
                <p className="text-sm text-white/60">Fastest Inference</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Layers className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold">
                  {models.length > 0 ? (models.reduce((sum, m) => sum + m.metrics.modelSize, 0) / models.length).toFixed(1) : '0'}MB
                </div>
                <p className="text-sm text-white/60">Avg Model Size</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Model Performance Overview
                </span>
                <div className="flex items-center gap-2">
                  <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as keyof ModelMetrics)}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="precision">Precision</SelectItem>
                      <SelectItem value="recall">Recall</SelectItem>
                      <SelectItem value="f1Score">F1 Score</SelectItem>
                      <SelectItem value="auc">AUC</SelectItem>
                      <SelectItem value="inferenceTime">Inference Time</SelectItem>
                      <SelectItem value="modelSize">Model Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-96 bg-black/20 rounded-lg"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          {/* Filters and Controls */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white/60" />
                  <Select value={filterDisease} onValueChange={setFilterDisease}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Diseases</SelectItem>
                      <SelectItem value="glaucoma">Glaucoma</SelectItem>
                      <SelectItem value="retinopathy">Retinopathy</SelectItem>
                      <SelectItem value="cataract">Cataract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="f1Score">F1 Score</SelectItem>
                    <SelectItem value="auc">AUC</SelectItem>
                    <SelectItem value="inferenceTime">Inference Time</SelectItem>
                    <SelectItem value="modelSize">Model Size</SelectItem>
                    <SelectItem value="trainingTime">Training Time</SelectItem>
                  </SelectContent>
                </Select>

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

                {selectedModels.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-white/60">
                      {selectedModels.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (selectedModels.length === 2) {
                          compareModels(selectedModels[0], selectedModels[1]);
                          setActiveTab('comparison');
                        }
                      }}
                      disabled={selectedModels.length !== 2}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Models Grid/List */}
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedModels.map((model) => (
              <Card
                key={model.id}
                className={`backdrop-blur-md bg-white/10 border-white/20 text-white cursor-pointer transition-all hover:bg-white/15 ${
                  selectedModels.includes(model.id) ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => {
                  setSelectedModels(prev =>
                    prev.includes(model.id)
                      ? prev.filter(id => id !== model.id)
                      : [...prev, model.id]
                  );
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {model.name}
                        {model.isBest && <Trophy className="w-4 h-4 text-yellow-400" />}
                      </CardTitle>
                      <CardDescription className="text-white/60 text-sm">
                        {model.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={
                        model.status === 'deployed' ? 'bg-green-500/20 text-green-300' :
                        model.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                        model.status === 'training' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }>
                        {model.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Accuracy:</span>
                      <span className={`ml-2 font-semibold ${getMetricColor(model.metrics.accuracy, 'accuracy')}`}>
                        {formatMetric(model.metrics.accuracy, 'accuracy')}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">F1 Score:</span>
                      <span className={`ml-2 font-semibold ${getMetricColor(model.metrics.f1Score, 'f1Score')}`}>
                        {formatMetric(model.metrics.f1Score, 'f1Score')}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Inference:</span>
                      <span className={`ml-2 font-semibold ${getMetricColor(model.metrics.inferenceTime, 'inferenceTime')}`}>
                        {formatMetric(model.metrics.inferenceTime, 'inferenceTime')}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Size:</span>
                      <span className={`ml-2 font-semibold ${getMetricColor(model.metrics.modelSize, 'modelSize')}`}>
                        {formatMetric(model.metrics.modelSize, 'modelSize')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {model.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {model.tags.length > 3 && (
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                        +{model.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>v{model.version}</span>
                    <span>{new Date(model.trainedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        runEvaluation(model.id);
                      }}
                      disabled={isEvaluating}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Evaluate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Deploy model
                      }}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {comparisonResults.length === 0 ? (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardContent className="text-center py-12">
                <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Select two models to compare</p>
                <p className="text-sm text-white/40 mt-2">
                  Go to the Models tab and select exactly 2 models, then click "Compare"
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {comparisonResults.map((result, index) => (
                <Card key={index} className="backdrop-blur-md bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5" />
                      Model Comparison: {result.model1.name} vs {result.model2.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Winner Announcement */}
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        <span className="text-lg font-semibold">
                          Winner: {result.comparison.winner === 'model1' ? result.model1.name : result.model2.name}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">
                        Confidence: {result.comparison.confidence.toFixed(1)}%
                      </p>
                    </div>

                    {/* Metrics Comparison */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-400">{result.model1.name}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Accuracy:</span>
                            <span className={getMetricColor(result.model1.metrics.accuracy, 'accuracy')}>
                              {formatMetric(result.model1.metrics.accuracy, 'accuracy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">F1 Score:</span>
                            <span className={getMetricColor(result.model1.metrics.f1Score, 'f1Score')}>
                              {formatMetric(result.model1.metrics.f1Score, 'f1Score')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Inference Time:</span>
                            <span className={getMetricColor(result.model1.metrics.inferenceTime, 'inferenceTime')}>
                              {formatMetric(result.model1.metrics.inferenceTime, 'inferenceTime')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Model Size:</span>
                            <span className={getMetricColor(result.model1.metrics.modelSize, 'modelSize')}>
                              {formatMetric(result.model1.metrics.modelSize, 'modelSize')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-blue-400">{result.model2.name}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Accuracy:</span>
                            <span className={getMetricColor(result.model2.metrics.accuracy, 'accuracy')}>
                              {formatMetric(result.model2.metrics.accuracy, 'accuracy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">F1 Score:</span>
                            <span className={getMetricColor(result.model2.metrics.f1Score, 'f1Score')}>
                              {formatMetric(result.model2.metrics.f1Score, 'f1Score')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Inference Time:</span>
                            <span className={getMetricColor(result.model2.metrics.inferenceTime, 'inferenceTime')}>
                              {formatMetric(result.model2.metrics.inferenceTime, 'inferenceTime')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Model Size:</span>
                            <span className={getMetricColor(result.model2.metrics.modelSize, 'modelSize')}>
                              {formatMetric(result.model2.metrics.modelSize, 'modelSize')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-white/80">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <LineChart className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Advanced analytics features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Evaluation Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileImage className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Report generation features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evaluation Progress */}
      {isEvaluating && (
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="w-6 h-6 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Evaluating Models</span>
                  <span className="text-sm text-white/60">{evaluationProgress.toFixed(0)}%</span>
                </div>
                <Progress value={evaluationProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}