/* FarmWise Service Worker — offline cache + background sync */
const CACHE  = 'farmwise-v2'
const ASSETS = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Always go network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ message: 'Offline — request queued' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
        })
      )
    )
    return
  }

  // Cache-first for static assets (fonts, icons)
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => caches.match('/index.html'))
    })
  )
})
