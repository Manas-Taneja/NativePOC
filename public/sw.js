const CACHE_NAME = "native-shell-v3"
const SHELL_ASSETS = ["/", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
    }),
  )
})

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "New message"
  const body = data.body || "You have a new notification"
  const icon = data.icon || "/NativeLogo.png"
  const tag = data.tag || "native-message"

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      tag,
      data,
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const client = clientList.find((c) => c.url.includes(self.origin))
      if (client) {
        client.focus()
        client.navigate(url)
        return
      }
      return self.clients.openWindow(url)
    }),
  )
})



