/**
 * Service worker de KidVision: guarda todos los archivos de la app la primera
 * vez que se abre, para que después funcione sin internet.
 * La lista de archivos y la versión las completa vite.config.ts al compilar.
 */
const CACHE = 'kidvision-__VERSION__';
const ARCHIVOS = __ARCHIVOS__;
// Algunos servidores mandan «Vary: Origin»; sin esto el archivo guardado no se encuentra y la app queda en blanco sin internet.
const OPCIONES_MATCH = { ignoreVary: true };

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting()),
  );
});

// Al activar una versión nueva, borra las anteriores.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((n) => n.startsWith('kidvision-') && n !== CACHE).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

// Primero lo guardado; si no está, la red. Todas las pantallas son la misma página (rutas con #).
self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  if (pedido.mode === 'navigate') {
    evento.respondWith(caches.match('./index.html', OPCIONES_MATCH).then((r) => r || fetch(pedido)));
    return;
  }
  evento.respondWith(caches.match(pedido, OPCIONES_MATCH).then((r) => r || fetch(pedido)));
});
