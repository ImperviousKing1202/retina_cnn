'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, WifiOff } from 'lucide-react';
import { RetinaLogo } from '@/components/retina-logo';

export default function NotFoundClient() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <RetinaLogo size="lg" showText={false} variant="dark" />

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              404 — Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              The page you’re looking for doesn’t exist or may have been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Home className="h-4 w-4" /> Go Home
                </Button>
              </Link>
              <Link href="/offline">
                <Button variant="outline" className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4" /> Offline Mode
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-500 mt-6">
          RETINA CNN System © {new Date().getFullYear()} — All Rights Reserved
        </p>
      </div>
    </div>
  );
}
