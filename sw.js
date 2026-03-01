// Seize PWA – Service Worker
// Usa rutas relativas al scope del SW para funcionar en cualquier subdirectorio
// (ej: github.io/seize/ o un dominio propio)

const CACHE_VER  = 'seize-v2';

// Construimos URLs absolutas a partir del scope del SW (funciona en cualquier ruta)
const BASE = self.registration.scope; // ej: "https://user.github.io/seize/"

const ASSETS = [
  BASE,
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'icons/icon-maskable-192.png',
  BASE + 'icons/icon-maskable-512.png',
];

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VER)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH – Network-first para HTML, cache-first para assets ───────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const isHtml = event.request.headers.get('Accept')?.includes('text/html');

  if (isHtml) {
    // Network-first: siempre intenta la red, usa caché solo si falla
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_VER).then(c => c.put(event.request, clone));
          return resp;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match(BASE)))
    );
  } else {
    // Cache-first para íconos y assets estáticos
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(resp => {
          if (resp && resp.status === 200) {
            caches.open(CACHE_VER).then(c => c.put(event.request, resp.clone()));
          }
          return resp;
        });
      })
    );
  }
});

// ── NOTIFICACIONES LOCALES (via postMessage desde la app) ─────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    const { title, body, delayMs } = event.data.payload;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon:    BASE + 'icons/icon-192.png',
        badge:   BASE + 'icons/icon-96.png',
        vibrate: [100, 50, 100],
        data:    { url: BASE },
        actions: [
          { action: 'open',    title: '✅ Ver hábitos' },
          { action: 'dismiss', title: '✕ Cerrar'       },
        ],
      });
    }, Math.max(0, delayMs));
  }
});

// ── CLICK EN NOTIFICACIÓN ─────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const target = event.notification.data?.url || BASE;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const win = list.find(c => c.focus);
      return win ? win.focus() : clients.openWindow(target);
    })
  );
});
