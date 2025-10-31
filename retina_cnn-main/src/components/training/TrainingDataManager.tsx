'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FolderOpen, 
  Image as ImageIcon, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  TrainingDataset, 
  TrainingImage, 
  trainingDataManager,
  TRAINING_DATA_CONFIG 
} from '@/lib/training-data';

export default function TrainingDataManager() {
  const [dataset, setDataset] = useState<TrainingDataset>(TRAINING_DATA_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    validateData();
  }, [dataset]);

  const validateData = () => {
    const validation = trainingDataManager.validateStructure();
    setValidation(validation);
  };

  const getStatistics = () => {
    return trainingDataManager.getStatistics();
  };

  const stats = getStatistics();

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDataset({ ...dataset, updated: new Date().toISOString() });
      setIsLoading(false);
    }, 1000);
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(dataset, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'training-data-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Data Manager</h1>
          <p className="text-muted-foreground">
            Manage and organize your eye illness detection training dataset
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {!validation.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Validation Issues Found:</p>
              <ul className="list-disc list-inside text-sm">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Different conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Set</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.splitCounts.training}</div>
            <p className="text-xs text-muted-foreground">
              {(dataset.splitRatios.training * 100).toFixed(1)}% of data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.isValid ? 'Valid' : 'Issues'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dataset validation
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dataset Info */}
            <Card>
              <CardHeader>
                <CardTitle>Dataset Information</CardTitle>
                <CardDescription>Current training dataset configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">{dataset.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Version</label>
                    <p className="text-sm text-muted-foreground">{dataset.version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(dataset.created).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Updated</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(dataset.updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{dataset.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Data Split */}
            <Card>
              <CardHeader>
                <CardTitle>Data Split Configuration</CardTitle>
                <CardDescription>Training, validation, and testing split ratios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Training</label>
                    <span className="text-sm text-muted-foreground">
                      {stats.splitCounts.training} images ({(dataset.splitRatios.training * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={dataset.splitRatios.training * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Validation</label>
                    <span className="text-sm text-muted-foreground">
                      {stats.splitCounts.validation} images ({(dataset.splitRatios.validation * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={dataset.splitRatios.validation * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Testing</label>
                    <span className="text-sm text-muted-foreground">
                      {stats.splitCounts.testing} images ({(dataset.splitRatios.testing * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={dataset.splitRatios.testing * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Distribution of images across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge variant="secondary">{category.count} images</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                    </div>
                    <Progress value={parseFloat(category.percentage)} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataset.categories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Path:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{category.path}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Images:</span>
                      <Badge variant={category.count > 0 ? "default" : "secondary"}>
                        {category.count}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={category.count > 0 ? "default" : "outline"}>
                        {category.count > 0 ? "Ready" : "Empty"}
                      </Badge>
                    </div>
                    {category.count > 0 && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Images
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Data Setup Guide</CardTitle>
              <CardDescription>
                Follow these steps to add your training images after downloading the code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <h4 className="font-medium">Create Folder Structure</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create the following folder structure in your project:
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <code className="text-xs">
                        /public/training-data/<br/>
                        ├── normal/<br/>
                        ├── illness/<br/>
                        │   ├── diabetic-retinopathy/<br/>
                        │   ├── glaucoma/<br/>
                        │   ├── cataract/<br/>
                        │   └── amd/<br/>
                        └── metadata/
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <h4 className="font-medium">Add Training Images</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Place your retinal images in the appropriate folders:
                    </p>
                    <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Normal/healthy images in <code className="bg-muted px-1 rounded">/normal/</code></li>
                      <li>Diabetic retinopathy images in <code className="bg-muted px-1 rounded">/illness/diabetic-retinopathy/</code></li>
                      <li>Glaucoma images in <code className="bg-muted px-1 rounded">/illness/glaucoma/</code></li>
                      <li>Cataract images in <code className="bg-muted px-1 rounded">/illness/cataract/</code></li>
                      <li>AMD images in <code className="bg-muted px-1 rounded">/illness/amd/</code></li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <h4 className="font-medium">Update Configuration</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Edit <code className="bg-muted px-1 rounded">src/lib/training-data.ts</code> to add your image metadata:
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <code className="text-xs">
                        {'// Add your images like this:'}<br/>
                        {'{'}<br/>
                        {'  id: "normal-001",'}<br/>
                        {'  filename: "healthy-001.jpg",'}<br/>
                        {'  category: "normal",'}<br/>
                        {'  label: "Healthy Retina",'}<br/>
                        {'  metadata: { age: 45, gender: "female" }'}<br/>
                        {'}'}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <h4 className="font-medium">Verify Setup</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check the validation status and ensure all images are properly configured.
                      The validation will alert you to any missing information or structural issues.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommended:</strong> Start with at least 100 images per category for better model performance.
                  Ensure diverse representation across age groups, genders, and condition severity levels.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}