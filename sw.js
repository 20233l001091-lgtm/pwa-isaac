const CACHE_NAME = 'leyendas-v11';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './ronaldinho.jpg',
  './neymar.jpg',
  './cr7.jpg',
  './raul.jpg',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});

// Evento SYNC
self.addEventListener('sync', (event) => {
  console.log('¡Evento sync activado! Etiqueta:', event.tag);

  if (event.tag === 'nuevo-post-sync' || event.tag === 'mi-primer-sync') {
    event.waitUntil(notificarSincronizacion(event.tag));
  }
});

async function notificarSincronizacion(tag) {
  const ventanas = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  ventanas.forEach(client => {
    client.postMessage(`✅ Sync completado: conexión restablecida (${tag})`);
  });
}