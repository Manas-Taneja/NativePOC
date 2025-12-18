"use client"

import { useState, useEffect, useCallback } from "react"
import { logger } from "@/lib/logger"

export interface Notification {
  id: string
  user_id: string
  type: "message" | "mention" | "reply" | "direct"
  channel_id: string | null
  message_id: string | null
  read_at: string | null
  created_at: string
}

interface NotificationPreferences {
  enabled: boolean
  desktop: boolean
  mentions: boolean
  replies: boolean
  direct_messages: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  desktop: true,
  mentions: true,
  replies: true,
  direct_messages: true,
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      logger.warn("Browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      setPermission("granted")
      return true
    }

    if (Notification.permission === "denied") {
      setPermission("denied")
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === "granted"
  }, [])

  // Check permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Load notification preferences – for now just use defaults (no Supabase persistence)
  const loadPreferences = useCallback(async () => {
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  // Save notification preferences – update in-memory only
  const savePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
  }, [preferences])

  // Fetch unread notifications count (from local state only)
  const fetchUnreadCount = useCallback(async () => {
    setUnreadCount((prev) => prev)
  }, [])

  // Fetch recent notifications – local only
  const fetchNotifications = useCallback(async (limit = 20) => {
    setNotifications((prev) => prev.slice(0, limit))
  }, [])

  // Mark notification as read (local only)
  const markAsRead = useCallback(async (notificationId: string) => {
    const now = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read_at: now } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  // Mark all as read (local only)
  const markAllAsRead = useCallback(async () => {
    const now = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: now }))
    )
    setUnreadCount(0)
  }, [])

  // Create a notification – browser-only, no Supabase writes
  const createNotification = useCallback(
    async (
      userId: string,
      type: Notification["type"],
      options: {
        channelId?: string
        messageId?: string
        title?: string
        body?: string
      }
    ) => {
      try {
        // Show browser notification if enabled and permission granted
        if (
          preferences.enabled &&
          preferences.desktop &&
          permission === "granted" &&
          options.title &&
          options.body
        ) {
          // Check type-specific preferences
          const shouldNotify =
            (type === "mention" && preferences.mentions) ||
            (type === "reply" && preferences.replies) ||
            (type === "direct" && preferences.direct_messages) ||
            type === "message"

          if (shouldNotify) {
            const id =
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`
            const created_at = new Date().toISOString()

            const localNotification: Notification = {
              id,
              user_id: userId,
              type,
              channel_id: options.channelId || null,
              message_id: options.messageId || null,
              read_at: null,
              created_at,
            }

            setNotifications((prev) => [localNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            const notification = new Notification(options.title, {
              body: options.body,
              icon: "/NativeLogo.png",
              badge: "/NativeLogo.png",
              tag: id, // Prevent duplicate notifications
              requireInteraction: type === "direct" || type === "mention",
            })

            notification.onclick = () => {
              window.focus()
              notification.close()
              if (options.channelId) {
                // Navigate to channel (you might want to use router here)
                void markAsRead(id)
              }
            }

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000)
          }
        }
        return
      } catch (error) {
        logger.error("Failed to create notification:", error)
        throw error
      }
    },
    [preferences, permission, markAsRead]
  )

  // Load preferences and unread count on mount
  useEffect(() => {
    loadPreferences()
    fetchUnreadCount()
  }, [loadPreferences, fetchUnreadCount])

  return {
    permission,
    unreadCount,
    notifications,
    preferences,
    requestPermission,
    savePreferences,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
  }
}







