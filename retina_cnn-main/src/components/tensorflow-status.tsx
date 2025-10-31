'use client';

import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Cpu, 
  Zap,
  Database,
  BarChart3
} from 'lucide-react';

export default function TensorFlowStatus() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [backend, setBackend] = useState<string>('');
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState<string[]>([]);

  useEffect(() => {
    checkTensorFlowStatus();
  }, []);

  const checkTensorFlowStatus = async () => {
    try {
      // Check if TensorFlow is ready
      await tf.ready();
      
      // Get backend information
      const currentBackend = tf.getBackend();
      setBackend(currentBackend);
      
      // Get memory usage
      const memory = tf.memory();
      setMemoryUsage(memory);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('TensorFlow initialization failed:', error);
      setIsInitialized(false);
    }
  };

  const clearMemory = () => {
    tf.disposeVariables();
    checkTensorFlowStatus();
  };

  const testModel = async () => {
    try {
      // Create a simple test model
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [4], units: 10, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'softmax' })
        ]
      });

      // Compile the model
      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Create test data
      const testData = tf.randomNormal([10, 4]);
      const testLabels = tf.randomUniform([10, 3]);

      // Train for a few epochs
      await model.fit(testData, testLabels, {
        epochs: 5,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss}`);
          }
        }
      });

      // Clean up
      testData.dispose();
      testLabels.dispose();
      model.dispose();

      setModelsLoaded(prev => [...prev, `Test Model ${Date.now()}`]);
    } catch (error) {
      console.error('Model test failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            TensorFlow.js Status
          </CardTitle>
          <CardDescription>
            Offline machine learning capabilities with TensorFlow.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={isInitialized ? 'default' : 'destructive'}>
                {isInitialized ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Initialized
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Initialized
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backend</span>
              <Badge variant="outline">{backend || 'Unknown'}</Badge>
            </div>

            {memoryUsage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm">
                    {(memoryUsage.numBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tensors</span>
                  <span className="text-sm">{memoryUsage.numTensors}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkTensorFlowStatus}
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearMemory}
              >
                <Database className="w-4 h-4 mr-2" />
                Clear Memory
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={testModel}
              >
                <Zap className="w-4 h-4 mr-2" />
                Test Model
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {modelsLoaded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modelsLoaded.map((modelName, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{modelName}</span>
                  <Badge variant="outline">Loaded</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            TensorFlow Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Model Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create custom CNN models</li>
                <li>• Load pretrained models</li>
                <li>• Model versioning</li>
                <li>• Local storage</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Training Capabilities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Offline training</li>
                <li>• Real-time progress</li>
                <li>• Data augmentation</li>
                <li>• Model evaluation</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Inference Engine</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time predictions</li>
                <li>• Batch processing</li>
                <li>• Video stream analysis</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Cache Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Model caching</li>
                <li>• Storage optimization</li>
                <li>• Automatic cleanup</li>
                <li>• Performance tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}