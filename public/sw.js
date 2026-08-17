// public/sw.js — minimum pod instalację PWA: powłoka offline, nic więcej.
// Nawigacje idą network-first, więc nowy deploy widać od razu; cache to tylko koc na brak sieci.
const CACHE = 'lotos-shell-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add('/')).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Zapisujemy tylko powłokę — reszta tras i tak wraca do /index.html (_redirects).
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put('/', copy))
        return res
      })
      .catch(() => caches.match('/').then((r) => r ?? Response.error())),
  )
})
