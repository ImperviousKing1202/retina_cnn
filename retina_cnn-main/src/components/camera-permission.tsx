/**
 * Camera Permission Component
 * Handles camera access requests and permissions for mobile devices
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  CameraOff, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Smartphone,
  Shield,
  Settings
} from 'lucide-react';
import { RetinaLogo } from '@/components/retina-logo';

interface CameraPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  onCameraStream: (stream: MediaStream) => void;
}

type PermissionState = 'prompt' | 'granted' | 'denied' | 'error' | 'checking';

export function CameraPermission({ 
  onPermissionGranted, 
  onPermissionDenied, 
  onCameraStream 
}: CameraPermissionProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    checkInitialPermission();
    
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkInitialPermission = async () => {
    try {
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('error');
        setErrorMessage('Camera API is not available in this browser');
        return;
      }

      // Try to get permission state
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permission.state === 'granted') {
        setPermissionState('granted');
        requestCameraAccess();
      } else if (permission.state === 'denied') {
        setPermissionState('denied');
        onPermissionDenied();
      } else {
        setPermissionState('prompt');
      }

      // Listen for permission changes
      permission.addEventListener('change', () => {
        if (permission.state === 'granted') {
          setPermissionState('granted');
          requestCameraAccess();
        } else if (permission.state === 'denied') {
          setPermissionState('denied');
          onPermissionDenied();
        }
      });
    } catch (error) {
      // Permission API not available, just show prompt
      setPermissionState('prompt');
    }
  };

  const requestCameraAccess = async () => {
    setPermissionState('checking');
    setErrorMessage('');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      setPermissionState('granted');
      onCameraStream(mediaStream);
      onPermissionGranted();

      // Set video stream to preview if video element exists
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage('Camera permission was denied. Please enable camera access in your browser settings.');
        onPermissionDenied();
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionState('error');
        setErrorMessage('No camera device found. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setPermissionState('error');
        setErrorMessage('Camera is already in use by another application.');
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        setPermissionState('error');
        setErrorMessage('Camera constraints cannot be satisfied. Please try again.');
      } else {
        setPermissionState('error');
        setErrorMessage(`Camera access failed: ${error.message}`);
      }
    }
  };

  const handleRetry = () => {
    setPermissionState('prompt');
    setErrorMessage('');
  };

  const handleOpenSettings = () => {
    // Open browser settings for mobile devices
    if (isMobile) {
      // For iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        window.open('app-settings:', '_blank');
      } else {
        // For Android - try to open settings
        window.open('chrome://settings/content/camera', '_blank');
      }
    } else {
      // For desktop - open browser settings
      window.open('chrome://settings/content/camera', '_blank');
    }
  };

  if (permissionState === 'checking') {
    return (
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-white/60 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Checking Camera Access</h3>
          <p className="text-white/70">Please wait while we check camera permissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (permissionState === 'granted') {
    return (
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Camera Access Granted
          </CardTitle>
          <CardDescription className="text-white/70">
            Your camera is ready for retinal image capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video bg-black/20 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white">
                <Camera className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Shield className="w-4 h-4" />
            <span>Camera is active and ready for capture</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permissionState === 'denied') {
    return (
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraOff className="w-5 h-5 text-red-400" />
            Camera Permission Denied
          </CardTitle>
          <CardDescription className="text-white/70">
            Camera access is required for retinal image capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage || 'Camera permission was denied. Please enable camera access to continue.'}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <p className="text-sm text-white/80">
              To enable camera access:
            </p>
            
            {isMobile ? (
              <div className="space-y-2 text-sm text-white/70">
                <p><strong>iPhone/iPad:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to Settings → Privacy & Security</li>
                  <li>Tap on Camera</li>
                  <li>Enable access for this browser</li>
                  <li>Return to this page and refresh</li>
                </ol>
                
                <p className="pt-2"><strong>Android:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to Settings → Apps → Browser</li>
                  <li>Tap on Permissions</li>
                  <li>Enable Camera permission</li>
                  <li>Return to this page and refresh</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-white/70">
                <p><strong>Desktop:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Click the camera icon in the address bar</li>
                  <li>Select "Allow" for camera access</li>
                  <li>Refresh the page if needed</li>
                </ol>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            {isMobile && (
              <Button
                onClick={handleOpenSettings}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Open Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permissionState === 'error') {
    return (
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Camera Error
          </CardTitle>
          <CardDescription className="text-white/70">
            Unable to access camera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial prompt state
  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <RetinaLogo size="lg" showText={false} variant="light" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          Camera Access Required
        </CardTitle>
        <CardDescription className="text-white/70">
          Allow camera access to capture retinal images for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white/10 rounded-full">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Why we need camera access:</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Capture retinal images for analysis</li>
              <li>• AI-powered disease detection</li>
              <li>• Real-time processing</li>
              <li>• No images stored without permission</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <Shield className="w-3 h-3" />
            <span>Your privacy is protected - images are processed locally</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={requestCameraAccess}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Allow Camera Access
          </Button>
          
          <p className="text-xs text-center text-white/50">
            You can revoke this permission at any time in your browser settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CameraPermission;