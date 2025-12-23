"use client"

import { useEffect } from "react"
import { logger } from "@/lib/logger"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      logger.warn("Service worker not supported in this browser")
      return
    }

    const registerSW = async () => {
      // Only attempt registration on HTTPS or localhost
      const isSecureContext =
        typeof window !== "undefined" &&
        (window.location.protocol === "https:" || window.location.hostname === "localhost")
      if (!isSecureContext) {
        logger.warn("Skipping service worker registration: insecure context")
        return
      }

      // Register the worker
      let registration: ServiceWorkerRegistration | null = null
      try {
        registration = await navigator.serviceWorker.register("/sw.js")
        logger.info("Service worker registered", { scope: registration.scope })
      } catch (error) {
        logger.error("Service worker registration failed", error)
        return
      }

      // Optional push subscription
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey || !registration.pushManager) return

      try {
        const existing = await registration.pushManager.getSubscription()
        if (existing) return

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        })
      } catch (error) {
        // Don't fail registration on push errors; just log a warning
        logger.warn("Push subscription failed; continuing without push", error)
      }
    }

    registerSW()
  }, [])

  return null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}



