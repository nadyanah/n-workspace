// ============================================================================
// SERVICE WORKER — sw.js
// ============================================================================
// Tugas utama:
//  1. Menerima event 'push' dari browser push service → tampilkan notifikasi
//     sistem (muncul walau tab/browser tertutup, selama device menyala & online)
//  2. Menangani klik pada notifikasi → fokus/buka tab app, lalu kirim pesan ke
//     halaman untuk navigasi ke halaman yang relevan (habit tracker, dst)
// ============================================================================

const APP_URL = './index.html';

self.addEventListener('install', (event) => {
  // Aktifkan service worker baru secepat mungkin
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Terima push dari server (dikirim via Web Push oleh Supabase Edge Function) ──
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Pengingat', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'n-workspace';
  const options = {
    body: payload.body || '',
    icon: payload.icon || './icon-192.png',
    badge: payload.badge || './icon-192.png',
    tag: payload.tag || undefined,
    renotify: !!payload.tag,
    data: {
      page: payload.page || null,
      habitId: payload.habitId || null,
      url: payload.url || APP_URL
    },
    vibrate: [120, 60, 120]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Klik notifikasi: fokus tab yang sudah terbuka, atau buka tab baru ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.url || APP_URL;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // Cari tab yang sudah terbuka untuk app ini
      const existing = clientsArr.find((c) => c.url.includes('index.html') || c.url.endsWith('/'));

      if (existing) {
        existing.focus();
        // Kirim pesan ke halaman supaya bisa navigasi ke page/habit yang relevan
        existing.postMessage({
          type: 'push-notif-click',
          page: data.page || null,
          habitId: data.habitId || null
        });
        return;
      }

      // Tidak ada tab terbuka → buka tab baru
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
