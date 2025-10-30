/**
 * PWA Install Prompt Component for RETINA CNN System
 * Handles Progressive Web App installation prompts
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, X, Smartphone, Monitor, 
  CheckCircle, Info, ArrowRight
} from 'lucide-react';
import { RetinaLogo } from '@/components/retina-logo';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    // Check if iOS device
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallCard(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallCard(false);
      setDeferredPrompt(null);
    };

    checkInstalled();
    checkIOS();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallCard(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallCard(false);
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't show if already installed, standalone mode, or dismissed
  if (typeof window !== 'undefined' && (isInstalled || isStandalone || 
      (showInstallCard === false && sessionStorage.getItem('pwa-install-dismissed')))) {
    return null;
  }

  // iOS install instructions
  if (isIOS) {
    return (
      <Alert className="m-4 bg-blue-50 border-blue-200">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium mb-2">Install RETINA on your iOS device</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Tap the Share button <span className="font-mono bg-gray-200 px-1 rounded">⎋</span> in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install RETINA</li>
              </ol>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Android/Desktop install prompt
  if (deferredPrompt && showInstallCard) {
    return (
      <Card className="m-4 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-green-800">
            <span className="flex items-center gap-2">
              <RetinaLogo size="sm" showText={false} variant="dark" />
              Install RETINA App
            </span>
            <Badge variant="secondary" className="bg-green-200 text-green-800">
              Available Offline
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-700">
            <p className="mb-2">
              Install RETINA on your device for:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Offline access to CNN models</li>
              <li>Faster loading and performance</li>
              <li>Native app experience</li>
              <li>Automatic data synchronization</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Maybe Later
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-green-600">
            <Info className="h-3 w-3" />
            <span>Free • No registration required • Works offline</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function PWAInstallButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone;
      setIsInstalled(isStandaloneMode);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  );
}

export function PWAStatusIndicator() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkPWAStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkPWAStatus();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    return () => {
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CheckCircle className="h-3 w-3 text-green-600" />
      <span>App Installed</span>
    </div>
  );
}

export default PWAInstallPrompt;