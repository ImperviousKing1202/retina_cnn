const CACHE_NAME = 'retina-cnn-v1';
const STATIC_CACHE_NAME = 'retina-static-v1';
const MODEL_CACHE_NAME = 'retina-models-v1';
const DATA_CACHE_NAME = 'retina-data-v1';

// Static assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/cnn-detection',
  '/cnn-training',
  '/cnn-models',
  '/offline',
  '/manifest.json',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Critical CSS and JS will be cached dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== MODEL_CACHE_NAME && 
                cacheName !== DATA_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Handle same-origin requests
    if (url.pathname.startsWith('/api/')) {
      // API requests - network first, fallback to cache
      event.respondWith(handleApiRequest(request));
    } else {
      // Static assets - cache first, fallback to network
      event.respondWith(handleStaticRequest(request));
    }
  } else {
    // Handle external requests (CDN, etc.)
    event.respondWith(handleExternalRequest(request));
  }
});

// Handle static asset requests (cache first)
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static request failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle API requests (network first, fallback to cache)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API request');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline - No cached data available',
      offline: true,
      timestamp: Date.now()
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle external requests (CDN, etc.)
async function handleExternalRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] External request failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline - External resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-cnn-data') {
    event.waitUntil(syncCnnData());
  } else if (event.tag === 'sync-model-data') {
    event.waitUntil(syncModelData());
  }
});

// Sync CNN detection and training data
async function syncCnnData() {
  try {
    // Get all pending data from IndexedDB
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      try {
        const response = await fetch('/api/cnn/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          await removePendingData(data.id);
          console.log('[SW] Synced data item:', data.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync data item:', data.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync model data
async function syncModelData() {
  try {
    const modelUpdates = await getPendingModelUpdates();
    
    for (const update of modelUpdates) {
      try {
        const response = await fetch('/api/models/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update)
        });
        
        if (response.ok) {
          await removePendingModelUpdate(update.id);
          console.log('[SW] Synced model update:', update.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync model update:', update.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Model sync failed:', error);
  }
}

// Handle push notifications for offline status updates
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open RETINA',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// IndexedDB helpers for offline data storage
async function getPendingData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RetinaOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingData'], 'readonly');
      const store = transaction.objectStore('pendingData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingData')) {
        db.createObjectStore('pendingData', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RetinaOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingData'], 'readwrite');
      const store = transaction.objectStore('pendingData');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function getPendingModelUpdates() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RetinaOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingModelUpdates'], 'readonly');
      const store = transaction.objectStore('pendingModelUpdates');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingModelUpdates')) {
        db.createObjectStore('pendingModelUpdates', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingModelUpdate(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RetinaOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingModelUpdates'], 'readwrite');
      const store = transaction.objectStore('pendingModelUpdates');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_MODELS':
      cacheModels(data.models);
      break;
    case 'CLEAR_CACHE':
      clearCache(data.cacheName);
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
      });
      break;
  }
});

// Cache CNN models for offline use
async function cacheModels(models) {
  try {
    const cache = await caches.open(MODEL_CACHE_NAME);
    for (const model of models) {
      if (model.url) {
        await cache.add(model.url);
      }
    }
    console.log('[SW] Models cached for offline use');
  } catch (error) {
    console.error('[SW] Failed to cache models:', error);
  }
}

// Clear specific cache
async function clearCache(cacheName) {
  try {
    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    console.log('[SW] Cache cleared');
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error);
  }
}

// Get cache status
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      status[name] = keys.length;
    }
    
    return status;
  } catch (error) {
    console.error('[SW] Failed to get cache status:', error);
    return {};
  }
}

console.log('[SW] Service worker loaded');