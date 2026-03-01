// Seize PWA – Service Worker
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_NAME   = 'seize-v1';
const OFFLINE_URL  = '/';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH – Cache-first strategy ───────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// ── PUSH NOTIFICATIONS ─────────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'Seize', body: '¡Es hora de revisar tus hábitos!', icon: '/icons/icon-192.png' };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch(e) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon || '/icons/icon-192.png',
      badge:   '/icons/icon-96.png',
      vibrate: [100, 50, 100],
      data:    { url: data.url || '/' },
      actions: [
        { action: 'open',    title: '✅ Ver hábitos' },
        { action: 'dismiss', title: '✕ Cerrar'      },
      ],
    })
  );
});

// ── NOTIFICATION CLICK ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

// ── SCHEDULED LOCAL REMINDERS (via postMessage from app) ──────────────────
// The app sends { type:'SCHEDULE_REMINDER', payload:{title,body,delayMs} }
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    const { title, body, delayMs, icon } = event.data.payload;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon:    icon || '/icons/icon-192.png',
        badge:   '/icons/icon-96.png',
        vibrate: [80, 40, 80],
        data:    { url: '/' },
      });
    }, Math.max(0, delayMs));
  }
});
