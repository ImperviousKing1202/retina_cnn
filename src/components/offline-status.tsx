/**
 * Offline Status Components for RETINA CNN System
 * Provides UI components for offline status indication and management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, WifiOff, Database, Cloud, CloudOff, 
  Download, Upload, Trash2, RefreshCw, 
  CheckCircle, AlertCircle, Clock, Settings
} from 'lucide-react';
import { useOfflineStorage } from '@/lib/offline-storage';

interface OfflineStatusProps {
  className?: string;
}

export function OfflineStatus({ className }: OfflineStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const { storageUsage, refreshStorageUsage } = useOfflineStorage();

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    // Get connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setServiceWorkerReady(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (isOnline) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isOnline) return <Wifi className="h-4 w-4" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getConnectionBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive">Offline</Badge>;
    }

    const connectionColors: { [key: string]: string } = {
      '4g': 'bg-green-500',
      '3g': 'bg-yellow-500',
      '2g': 'bg-orange-500',
      'slow-2g': 'bg-red-500',
      'unknown': 'bg-gray-500'
    };

    return (
      <Badge className={connectionColors[connectionType] || 'bg-gray-500'}>
        {connectionType.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            Connection Status
          </span>
          {getConnectionBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-2 ${getStatusColor()}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-3 w-3" />
            {Object.values(storageUsage).reduce((a, b) => a + b, 0)} items cached
          </div>
        </div>

        {!isOnline && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Some features may be limited until you reconnect to the internet.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${serviceWorkerReady ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Service Worker</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Network Access</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OfflineManagerProps {
  className?: string;
}

export function OfflineManager({ className }: OfflineManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const { 
    storageUsage, 
    refreshStorageUsage,
    getUnsyncedDetectionResults,
    getUnsyncedTrainingSessions,
    getUnsyncedImages,
    clearOldEntries
  } = useOfflineStorage();

  const [unsyncedCounts, setUnsyncedCounts] = useState({
    detections: 0,
    training: 0,
    images: 0
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    updateUnsyncedCounts();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateUnsyncedCounts = async () => {
    try {
      const [detections, training, images] = await Promise.all([
        getUnsyncedDetectionResults(),
        getUnsyncedTrainingSessions(),
        getUnsyncedImages()
      ]);

      setUnsyncedCounts({
        detections: detections.length,
        training: training.length,
        images: images.length
      });
    } catch (error) {
      console.error('Failed to get unsynced counts:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) return;
    
    setSyncing(true);
    try {
      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-cnn-data');
        await registration.sync.register('sync-model-data');
      } else {
        // Fallback: manual sync
        await performManualSync();
      }
      
      await updateUnsyncedCounts();
      await refreshStorageUsage();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const performManualSync = async () => {
    // This would implement manual sync logic
    // For now, just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({ type: 'CLEAR_CACHE' });
      }
      
      await clearOldEntries(7); // Clear entries older than 7 days
      await refreshStorageUsage();
      await updateUnsyncedCounts();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setClearingCache(false);
    }
  };

  const totalUnsynced = unsyncedCounts.detections + unsyncedCounts.training + unsyncedCounts.images;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Offline Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {totalUnsynced} pending sync
                </span>
              </div>
            </div>

            {totalUnsynced > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You have {totalUnsynced} items that will sync when you're back online.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(storageUsage).map(([store, count]) => (
                <div key={store} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{store.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={clearingCache}
                className="w-full"
              >
                {clearingCache ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Clear Old Cache
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Detection Results</span>
                <Badge variant={unsyncedCounts.detections > 0 ? "destructive" : "default"}>
                  {unsyncedCounts.detections} pending
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Training Sessions</span>
                <Badge variant={unsyncedCounts.training > 0 ? "destructive" : "default"}>
                  {unsyncedCounts.training} pending
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Images</span>
                <Badge variant={unsyncedCounts.images > 0 ? "destructive" : "default"}>
                  {unsyncedCounts.images} pending
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleSync}
              disabled={!isOnline || syncing || totalUnsynced === 0}
              className="w-full"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>

            {!isOnline && (
              <p className="text-sm text-muted-foreground text-center">
                Connect to the internet to sync your data
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setShowOfflineBanner(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineBanner) return null;

  return (
    <Alert className={`m-4 ${className}`}>
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>You are currently offline. Some features may be limited.</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOfflineBanner(false)}
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default OfflineStatus;