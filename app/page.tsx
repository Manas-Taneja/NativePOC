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
import { InviteMemberModal } from "@/components/invite-member-modal"
import { NewDMModal } from "@/components/new-dm-modal"

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [organizationId, setOrganizationId] = React.useState<string | null>(null)
  const [isNativeResponding, setIsNativeResponding] = React.useState(false)
  const [isRightColumnVisible, setIsRightColumnVisible] = React.useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true)
  const [showInviteModal, setShowInviteModal] = React.useState(false)
  const [showNewDMModal, setShowNewDMModal] = React.useState(false)
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)

  // Fetch organization ID and set current user
  React.useEffect(() => {
    async function fetchOrgId() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Store current user ID globally for message alignment
      ; (window as any).__currentUserId = user.id
      setCurrentUserId(user.id)

      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id)
      }
    }

    void fetchOrgId()
  }, [router])

  const { channels, members, messages, currentChannel, selectChannel, sendMessage } = useChat({
    organizationId: organizationId || undefined,
  })

  const buildChatHistory = React.useCallback(() => {
    return messages.slice(-10).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }))
  }, [messages])

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      await sendMessage(content)

      // Determine if AI should respond based on channel type
      const shouldCallAI =
        currentChannel?.type === "ai-assistant" || // Always respond in AI channel
        (currentChannel?.type === "team" && content.toLowerCase().includes("@native")) // Respond in team if mentioned

      if (shouldCallAI) {
        setIsNativeResponding(true)
        const history = buildChatHistory()
        history.push({ role: "user", content })

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              history,
            }),
          })

          if (!response.ok) {
            throw new Error("Chat request failed")
          }

          const data = await response.json()
          const assistantMessage = data.message ?? generateNativeResponse(content)
          await sendMessage(assistantMessage, { isAI: true })
        } catch (error) {
          console.error("Falling back to local AI:", error)
          const fallback = generateNativeResponse(content)
          await sendMessage(fallback, { isAI: true })
        } finally {
          setIsNativeResponding(false)
        }
      }
      // For direct channels, just send the message (no AI)
    },
    [buildChatHistory, sendMessage, currentChannel],
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] relative">
      {organizationId ? (
        <ChannelSidebar
          channels={channels}
          currentChannel={currentChannel}
          members={members}
          organizationName="NativeIQ"
          onSelectChannel={(channel) => {
            void selectChannel(channel)
          }}
          onInvite={() => setShowInviteModal(true)}
          onNewDM={() => setShowNewDMModal(true)}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      ) : (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-fg-tertiary)]">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
      <div className="relative z-10">
        <DashboardHeader insights={mockInsights} metrics={mockSlaMetrics} />
        <main className="max-w-[1800px] mx-auto px-5 md:px-8 py-4 space-y-6">

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Two Column Layout: Chat + Overview */}
            <motion.div
              variants={staggerItem}
              className={`grid grid-cols-1 gap-6 transition-all duration-300 ${isRightColumnVisible ? "lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]" : "lg:grid-cols-1"
                }`}
            >
              {/* Left Column: Native Chat Stream */}
              <Card className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                <div className="border-b border-[var(--color-border-subtle)] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
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
                        <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
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
                        <p className="text-sm text-[var(--color-fg-tertiary)]">
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
                <div className="flex-1 overflow-y-auto p-5">
                  {!currentChannel ? (
                    <div className="h-full flex items-center justify-center text-[var(--color-fg-tertiary)]">
                      <div className="text-center">
                        <p className="text-lg mb-2">No channel selected</p>
                        <p className="text-sm">Select a channel from the sidebar to start chatting</p>
                      </div>
                    </div>
                  ) : (
                    <ChatStream messages={messages} onSendMessage={handleSendMessage} isNativeResponding={isNativeResponding} />
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <h3 className="text-lg font-semibold text-[var(--color-fg-primary)] mb-4">
                        Key Insights
                      </h3>
                      <div className="space-y-4">
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
          <BusinessInsights company="Native" insights={mockInsights} metrics={mockSlaMetrics} />
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
