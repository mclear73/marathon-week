const CACHE = 'marathon-week-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network-first for the page (so plan updates land), cache fallback when offline. Cache-first for fonts.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(caches.open('fonts').then(c => c.match(e.request).then(r => r || fetch(e.request, e.request.mode === 'navigate' ? {cache: 'no-cache'} : {}).then(res => { c.put(e.request, res.clone()); return res; }).catch(() => r))));
    return;
  }
  e.respondWith(
    fetch(e.request, e.request.mode === 'navigate' ? {cache: 'no-cache'} : {}).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
