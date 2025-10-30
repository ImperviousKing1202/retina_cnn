// src/app/page.tsx
import HomeClient from './home-client';

export const metadata = {
  title: 'RETINA CNN System Dashboard',
  description:
    'AI-powered retinal diagnostics, detection, and model management dashboard for the RETINA CNN System.',
  metadataBase: new URL('https://retina.ai'), // ✅ replace with your domain
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function Page() {
  return <HomeClient />;
}