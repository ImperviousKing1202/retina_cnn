'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('[SW] Service worker registered successfully:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('A new version of RETINA is available. Would you like to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
          
          // Handle messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_UPDATED') {
              console.log('[SW] Cache updated:', event.data.data);
            }
          });
          
        } catch (error) {
          console.error('[SW] Service worker registration failed:', error);
        }
      };
      
      // Register service worker after page load
      window.addEventListener('load', registerServiceWorker);
      
      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
  }, []);
  
  return null;
}