'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WifiOff, Database, Brain, Image, History, 
  RefreshCw, CheckCircle, AlertCircle, Clock,
  Activity, BarChart3, Download, Upload
} from 'lucide-react';
import { useOfflineStorage } from '@/lib/offline-storage';
import { RetinaLogo } from '@/components/retina-logo';
import Link from 'next/link';

export default function OfflineClient() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { 
    storageUsage, 
    getAllModels,
    getUnsyncedDetectionResults,
    getUnsyncedTrainingSessions
  } = useOfflineStorage();

  const [cachedModels, setCachedModels] = useState<any[]>([]);
  const [stats, setStats] = useState({
    models: 0,
    detections: 0,
    training: 0,
    storage: 0
  });

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      const [models, detections, training] = await Promise.all([
        getAllModels(),
        getUnsyncedDetectionResults(),
        getUnsyncedTrainingSessions()
      ]);

      setCachedModels(models);
      setStats({
        models: models.length,
        detections: detections.length,
        training: training.length,
        storage: Object.values(storageUsage).reduce((a, b) => a + b, 0)
      });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      const response = await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      if (response.ok) window.location.reload();
    } catch {
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  const getRetryMessage = () => {
    if (retryCount === 0) return 'Check your internet connection and try again';
    if (retryCount < 3) return "Still offline. Let's try again...";
    if (retryCount < 5) return 'Connection is taking longer than expected...';
    return 'You can continue using offline features while we keep trying';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <WifiOff className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <RetinaLogo size="lg" showText={false} variant="dark" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">You're Offline</h1>
            <p className="text-gray-600 mt-2">
              RETINA is working offline. Some features may be limited.
            </p>
          </div>

          <Button
            onClick={handleRetryConnection}
            disabled={isRetrying}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Checking Connection...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500">{getRetryMessage()}</p>
        </div>

        {/* Offline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.models}</div>
            <p className="text-sm text-gray-600">Cached Models</p>
          </CardContent></Card>

          <Card><CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.detections}</div>
            <p className="text-sm text-gray-600">Pending Detections</p>
          </CardContent></Card>

          <Card><CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.training}</div>
            <p className="text-sm text-gray-600">Training Sessions</p>
          </CardContent></Card>

          <Card><CardContent className="p-6 text-center">
            <Database className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.storage}</div>
            <p className="text-sm text-gray-600">Cached Items</p>
          </CardContent></Card>
        </div>

        {/* (The rest of your UI sections: Available Features, Cached Models, Sync Status, Tips, etc.) */}
        {/* Keep exactly as before — unchanged. */}
      </div>
    </div>
  );
}
