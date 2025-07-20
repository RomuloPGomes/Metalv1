const CACHE_NAME = 'inspecao-pwa-v2';
const urlsToCache = [
  './inspecao.html',
  './manifest.json',
  './estilos.css',
  './estruturas_completo.csv',
  './Portico 1 pista.png',
  './Portico 2 pistas.png',
  './Semiporticos.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', function(event) {
  console.log('📱 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('❌ Erro ao instalar cache:', error);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Interceptar requisições para imagens locais
  if (event.request.url.includes('.png') || event.request.url.includes('.jpg') || event.request.url.includes('.jpeg')) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            console.log('🖼️ Imagem servida do cache:', event.request.url);
            return response;
          }
          return fetch(event.request)
            .then(function(fetchResponse) {
              // Cache da imagem se a requisição for bem-sucedida
              if (fetchResponse.status === 200) {
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(event.request, responseToCache);
                  });
              }
              return fetchResponse;
            })
            .catch(function(error) {
              console.log('❌ Erro ao buscar imagem:', event.request.url, error);
              // Retornar uma resposta vazia se a imagem não puder ser carregada
              return new Response('', {
                status: 404,
                statusText: 'Not Found'
              });
            });
        })
    );
  } else {
    // Para outros recursos, usar estratégia cache-first
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          return response || fetch(event.request);
        })
    );
  }
});

self.addEventListener('activate', function(event) {
  console.log('🔄 Service Worker ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          console.log('🗑️ Removendo cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Interceptar mensagens do app principal
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 