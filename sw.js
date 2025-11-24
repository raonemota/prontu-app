const CACHE_NAME = 'prontu-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  'https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/Untitled_Project-removebg-preview.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Usa addAll mas com catch para não falhar tudo se um arquivo falhar
        return Promise.all(
            urlsToCache.map(url => {
                return cache.add(url).catch(err => console.warn('Failed to cache:', url, err));
            })
        );
      })
  );
});

// Estratégia de Cache: Network First
self.addEventListener('fetch', (event) => {
  // Apenas requisições GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, clona e atualiza o cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Se falhar a rede, tenta o cache
        return caches.match(event.request);
      })
  );
});

// Atualização do Service Worker e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});