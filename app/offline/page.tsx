// src/app/offline/page.tsx
import OfflineClient from './offline-client';

export const metadata = {
  title: 'Offline Mode — RETINA CNN System',
  description:
    'You are currently offline. RETINA CNN System continues to operate with cached models and limited functionality.',
  metadataBase: new URL('https://retina.ai'), // ✅ replace with your actual domain
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function OfflinePage() {
  return <OfflineClient />;
}
