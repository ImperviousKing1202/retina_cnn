// src/app/_not-found/page.tsx
import NotFoundClient from './not-found-client';

export const metadata = {
  title: 'Page Not Found — RETINA CNN System',
  description:
    'The page you are looking for could not be found. Please return to the RETINA CNN System dashboard.',
  metadataBase: new URL('https://retina.ai'), // 🔧 replace with your production URL
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function NotFoundPage() {
  return <NotFoundClient />;
}
