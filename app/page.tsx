"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { MetricTile } from "@/components/ui/metric-tile"
import { ChatStream } from "@/components/chat-stream"
import { ChannelSidebar } from "@/components/channel-sidebar"
import { BusinessInsights } from "@/components/sections/business-insights"
import InlineInsightCard from "@/components/inline-insight-card"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"
import {
  mockMessages,
  mockMetrics,
  mockInsights,
  mockChannels,
  mockMembers,
  mockSlaMetrics,
  generateNativeResponse,
} from "@/lib/mock-data"
import { useChat } from "@/hooks/useChat"
import type { Message } from "@/hooks/useChat"
import { InviteMemberModal } from "@/components/invite-member-modal"
import { NewDMModal } from "@/components/new-dm-modal"
import { useUser } from "@/contexts/user-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { logger } from "@/lib/logger"
import { ErrorMessage } from "@/components/error-message"

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const { userId: currentUserId } = useUser()
  const [organizationId, setOrganizationId] = React.useState<string | null>(null)
  const [organizationName, setOrganizationName] = React.useState<string>("NativeIQ")
  const [isNativeResponding, setIsNativeResponding] = React.useState(false)
  const [isRightColumnVisible, setIsRightColumnVisible] = React.useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)
  const [showInviteModal, setShowInviteModal] = React.useState(false)
  const [showNewDMModal, setShowNewDMModal] = React.useState(false)
  const [aiError, setAiError] = React.useState<string | null>(null)
  const lastPromptRef = React.useRef<string | null>(null)

  // Fetch organization ID and set current user
  React.useEffect(() => {
    async function fetchOrgId() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id)
        const { data: org } = await supabase.from("organizations").select("name").eq("id", profile.organization_id).single()
        if (org?.name) {
          setOrganizationName(org.name)
        }
      }
    }

    void fetchOrgId()
  }, [router])

  const { channels, members, messages, currentChannel, selectChannel, sendMessage, error: chatError, loading: chatLoading } = useChat({
    organizationId: organizationId || undefined,
  })

  const buildChatHistory = React.useCallback(() => {
    return messages.slice(-10).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }))
  }, [messages])

  const hasNativeMention = React.useCallback((text: string) => {
    return /(^|\s)@native\b/i.test(text)
  }, [])

  const requestAIResponse = React.useCallback(async (prompt: string) => {
    lastPromptRef.current = prompt
    setIsNativeResponding(true)
    setAiError(null)
    const history = buildChatHistory()
    history.push({ role: "user", content: prompt })

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history,
        }),
      })

      if (!response.ok) {
        const details = await response.json().catch(() => ({}))
        logger.warn("Chat request failed:", { status: response.status, details })
        const fallback = generateNativeResponse(prompt)
        await sendMessage(fallback, { isAI: true })
        setAiError("Native request failed. Using fallback — retry?")
        return
      }

      const data = await response.json()
      const assistantMessage = data.message ?? generateNativeResponse(prompt)
      await sendMessage(assistantMessage, { isAI: true })
      setAiError(null)
    } catch (error) {
      logger.error("Falling back to local AI:", error)
      setAiError("Native request failed. Using fallback — retry?")
      const fallback = generateNativeResponse(prompt)
      await sendMessage(fallback, { isAI: true })
    } finally {
      setIsNativeResponding(false)
    }
  }, [buildChatHistory, sendMessage])

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      await sendMessage(content)

      // Only call AI when explicitly mentioned
      const shouldCallAI = hasNativeMention(content)

      if (shouldCallAI) {
        await requestAIResponse(content)
      }
      // For direct channels, just send the message (no AI)
    },
    [requestAIResponse, sendMessage, currentChannel, hasNativeMention],
  )

  const handleRetryAI = React.useCallback(async () => {
    if (!lastPromptRef.current) return
    await requestAIResponse(lastPromptRef.current)
  }, [requestAIResponse])

  const handleRegenerate = React.useCallback(async (message: Message) => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    const prompt = lastUserMessage?.content || lastPromptRef.current
    if (!prompt) return
    await requestAIResponse(prompt)
  }, [messages, requestAIResponse])

  const handleFeedback = React.useCallback((message: Message, value: "up" | "down") => {
    logger.info("Assistant feedback", { messageId: message.id, value })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] relative">
      {organizationId ? (
        <ErrorBoundary>
          <ChannelSidebar
            channels={channels}
            currentChannel={currentChannel}
            members={members}
            organizationName={organizationName}
            onSelectChannel={(channel) => {
              void selectChannel(channel)
            }}
            onInvite={() => setShowInviteModal(true)}
            onNewDM={() => setShowNewDMModal(true)}
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        </ErrorBoundary>
      ) : (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-fg-tertiary)]">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
      <div className="relative z-10">
        <DashboardHeader 
          insights={mockInsights} 
          metrics={mockSlaMetrics}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 space-y-4">
          {chatError && (
            <ErrorMessage 
              error={chatError}
            />
          )}

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-4"
          >
            {/* Two Column Layout: Chat + Overview */}
            <motion.div
              variants={staggerItem}
              className={`grid grid-cols-1 gap-3 transition-all duration-300 ${isRightColumnVisible ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-1"
                }`}
            >
              {/* Left Column: Native Chat Stream */}
              <Card className="h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
                <div className="border-b border-[var(--color-border-subtle)] p-4 font-heading">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[var(--color-fg-primary)] font-heading tracking-wide">
                          {currentChannel?.type === "direct"
                            ? (() => {
                              const participants = currentChannel.metadata?.participants || []
                              const participantNames = currentChannel.metadata?.participantNames || {}
                              const otherUserId = participants.find((id: string) => id !== currentUserId)
                              return otherUserId ? participantNames[otherUserId] : currentChannel.name
                            })()
                            : currentChannel?.name || "Chat"
                          }
                        </h2>
                        <p className="text-sm text-[var(--color-fg-tertiary)] font-ui">
                          {currentChannel?.type === "direct"
                            ? "Direct message"
                            : currentChannel?.description || (currentChannel?.type === "ai-assistant" ? "AI Assistant" : `${members.length} members`)
                          }
                        </p>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <motion.button
                      onClick={() => setIsRightColumnVisible(!isRightColumnVisible)}
                      className="h-10 w-10 rounded-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Toggle sidebar"
                    >
                      <motion.svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[var(--color-fg-primary)]"
                        animate={{ rotate: isRightColumnVisible ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path
                          d="M8 4L12 10L8 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </motion.button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden">
                  {!currentChannel ? (
                    <div className="h-full flex items-center justify-center text-[var(--color-fg-tertiary)]">
                      <div className="text-center">
                        <p className="text-lg mb-2">No channel selected</p>
                        <p className="text-sm">Select a channel from the sidebar to start chatting</p>
                      </div>
                    </div>
                  ) : (
                    <ErrorBoundary>
                      <ChatStream
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isNativeResponding={isNativeResponding}
                        channelType={currentChannel?.type}
                        channelName={currentChannel?.name}
                        aiError={aiError}
                        onRetryAI={handleRetryAI}
                        onRegenerate={handleRegenerate}
                        onFeedback={handleFeedback}
                      />
                    </ErrorBoundary>
                  )}
                </div>
              </Card>

              {/* Right Column: Overview */}
              <AnimatePresence mode="wait">
                {isRightColumnVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {mockMetrics.map((metric, i) => (
                        <MetricTile
                          key={i}
                          label={metric.label}
                          value={metric.value}
                          trend={metric.trend}
                        />
                      ))}
                    </div>

                    {/* Insights */}
                    <div>
                      <h3 className="text-base font-semibold text-[var(--color-fg-primary)] mb-3 font-heading tracking-wide">
                        Key Insights
                      </h3>
                      <div className="space-y-2">
                        {mockInsights.map((insight) => (
                          <InlineInsightCard key={insight.id} insight={insight} />
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
          <ErrorBoundary>
            <BusinessInsights company="Native" insights={mockInsights} metrics={mockSlaMetrics} />
          </ErrorBoundary>
        </main>
      </div>

      {/* Invite Member Modal */}
      {organizationId && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationId={organizationId}
        />
      )}

      {/* New DM Modal */}
      {organizationId && currentUserId && (
        <NewDMModal
          isOpen={showNewDMModal}
          onClose={() => setShowNewDMModal(false)}
          organizationId={organizationId}
          currentUserId={currentUserId}
          onDMCreated={(channelId) => {
            // Find and select the newly created channel
            const channel = channels.find(c => c.id === channelId)
            if (channel) {
              void selectChannel(channel)
            }
          }}
        />
      )}
    </div>
  )
}
