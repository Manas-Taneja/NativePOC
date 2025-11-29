"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface Channel {
  id: string
  organization_id: string
  name: string
  description: string | null
  type: "team" | "ai-assistant" | "direct"
  created_at: string
  metadata?: any // For storing DM participant info and other channel-specific data
}

export interface Message {
  id: string
  channel_id: string
  author_id: string | null
  content: string
  is_ai_response: boolean
  metadata: Record<string, unknown>
  created_at: string
  // UI compatible fields
  role: "assistant" | "user"
  timestamp: Date
  // Joined data
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface ChatMember {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface UseChatOptions {
  organizationId?: string
  fallback?: {
    channels?: Channel[]
    members?: ChatMember[]
    messages?: Message[]
  }
}

export function useChat(options: UseChatOptions = {}) {
  const supabase = createClient()

  const [channels, setChannels] = useState<Channel[]>(options.fallback?.channels || [])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>(options.fallback?.messages || [])
  const [members, setMembers] = useState<ChatMember[]>(options.fallback?.members || [])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const realtimeSubscription = useRef<RealtimeChannel | null>(null)

  // Fetch channels for organization
  const fetchChannels = useCallback(async (organizationId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("channels")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true })

      if (fetchError) throw fetchError

      setChannels(data || [])
      return data
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch channels"
      setError(message)
      console.error("Error fetching channels:", e)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch messages for a channel
  const fetchMessages = useCallback(async (channelId: string, limit = 50) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(`
          *,
          author:profiles!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(limit)

      if (fetchError) throw fetchError

      // Transform to include role and timestamp for UI compatibility
      const transformedMessages = (data || []).map((msg) => ({
        ...msg,
        role: msg.is_ai_response ? ("assistant" as const) : ("user" as const),
        timestamp: new Date(msg.created_at),
      }))

      setMessages(transformedMessages)
      return transformedMessages
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch messages"
      setError(message)
      console.error("Error fetching messages:", e)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch organization members
  const fetchMembers = useCallback(async (organizationId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("organization_id", organizationId)

      if (fetchError) throw fetchError

      setMembers(data || [])
      return data
    } catch (e) {
      console.error("Failed to fetch members:", e)
      return []
    }
  }, [supabase])

  // Send a message
  const sendMessage = useCallback(async (content: string, options?: { isAI?: boolean }) => {
    if (!currentChannel || !content.trim()) return

    console.log("📤 Sending message:", { content, channel: currentChannel.name, isAI: options?.isAI })
    setSending(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error: sendError } = await supabase
        .from("messages")
        .insert({
          channel_id: currentChannel.id,
          author_id: options?.isAI ? null : user?.id,
          content: content.trim(),
          is_ai_response: options?.isAI || false,
        })
        .select(`
          *,
          author:profiles!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (sendError) throw sendError

      console.log("✅ Message sent successfully:", data)
      // Message will be added via realtime subscription
      return data
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send message"
      setError(message)
      console.error("❌ Error sending message:", e)
      console.error("Error sending message:", e)
      throw e
    } finally {
      setSending(false)
    }
  }, [currentChannel, supabase])

  // Subscribe to real-time messages
  const subscribeToChannel = useCallback((channelId: string) => {
    console.log("🔔 Subscribing to channel:", channelId)
    // Unsubscribe from previous channel
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current)
      realtimeSubscription.current = null
    }

    // Subscribe to new channel
    realtimeSubscription.current = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          console.log("📨 Received new message via realtime:", payload.new)
          const newMessage = payload.new as Message

          // Fetch author details if needed
          if (newMessage.author_id) {
            const { data: author } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", newMessage.author_id)
              .single()

            if (author) {
              newMessage.author = author
            }
          }

          // Add role and timestamp for UI compatibility
          const transformedMessage = {
            ...newMessage,
            role: newMessage.is_ai_response ? ("assistant" as const) : ("user" as const),
            timestamp: new Date(newMessage.created_at),
          }

          console.log("✅ Adding message to state:", transformedMessage)
          // Add to messages if not already present
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) {
              console.log("⚠️ Message already exists, skipping")
              return prev
            }
            return [...prev, transformedMessage]
          })
        }
      )
      .subscribe()
  }, [supabase])

  // Unsubscribe from real-time
  const unsubscribe = useCallback(() => {
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current)
      realtimeSubscription.current = null
    }
  }, [supabase])

  // Select a channel
  const selectChannel = useCallback(async (channel: Channel) => {
    setCurrentChannel(channel)
    await fetchMessages(channel.id)
    subscribeToChannel(channel.id)
  }, [fetchMessages, subscribeToChannel])

  // Helper: Get user initials
  const getInitials = useCallback((name: string | null | undefined): string => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [])

  // Helper: Format timestamp
  const formatTime = useCallback((timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  // Computed values
  const isAIChannel = currentChannel?.type === "ai-assistant"
  const teamChannel = channels.find((c) => c.type === "team")
  const aiChannel = channels.find((c) => c.type === "ai-assistant")

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe()
    }
  }, [unsubscribe])

  // Initialize with organization ID if provided
  useEffect(() => {
    if (options.organizationId) {
      void fetchChannels(options.organizationId)
      void fetchMembers(options.organizationId)
    }
  }, [options.organizationId, fetchChannels, fetchMembers])

  return {
    channels,
    currentChannel,
    messages,
    members,
    loading,
    sending,
    error,
    isAIChannel,
    teamChannel,
    aiChannel,
    fetchChannels,
    fetchMessages,
    fetchMembers,
    sendMessage,
    selectChannel,
    subscribeToChannel,
    unsubscribe,
    getInitials,
    formatTime,
  }
}
