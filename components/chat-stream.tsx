"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatRelativeTime } from "@/lib/utils"
import { Message } from "@/lib/mock-data"
import { chatMessageFadeIn, fadeOutOnly } from "@/lib/animations"
import { useUser } from "@/contexts/user-context"

interface ChatStreamProps {
  messages: Message[]
  className?: string
  onSendMessage?: (content: string) => void
  isNativeResponding?: boolean
}

/**
 * ChatStream - iOS Messages-style chat interface with streaming
 */
export function ChatStream({ messages, className, onSendMessage, isNativeResponding }: ChatStreamProps) {
  const { userId: currentUserId } = useUser()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [collapsedMessages, setCollapsedMessages] = React.useState<Set<string>>(new Set())
  const [inputValue, setInputValue] = React.useState("")
  const previousMessagesLength = React.useRef(messages.length)
  const [newestMessageId, setNewestMessageId] = React.useState<string | null>(null)
  const [allowAnimation, setAllowAnimation] = React.useState(true)
  const wasRespondingRef = React.useRef(false)
  const [justReplacedMessageId, setJustReplacedMessageId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const wasResponding = wasRespondingRef.current
    wasRespondingRef.current = isNativeResponding ?? false

    if (!isNativeResponding && wasResponding && newestMessageId) {
      setJustReplacedMessageId(newestMessageId)
    } else if (isNativeResponding) {
      setJustReplacedMessageId(null)
    }
  }, [isNativeResponding, newestMessageId])

  React.useEffect(() => {
    if (scrollRef.current && messages.length > previousMessagesLength.current) {
      // New message added - disable animation temporarily
      const lastMessage = messages[messages.length - 1]
      setNewestMessageId(lastMessage.id)
      setAllowAnimation(false)

      // Force synchronous scroll
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }

      // Re-enable animation after scroll and layout settle
      const timer = setTimeout(() => {
        setAllowAnimation(true)
        setNewestMessageId(null)
      }, 150)

      previousMessagesLength.current = messages.length
      return () => clearTimeout(timer)
    }
  }, [messages])

  const toggleMessageCollapse = (messageId: string) => {
    setCollapsedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) newSet.delete(messageId)
      else newSet.add(messageId)
      return newSet
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSendMessage?.(trimmed)
    setInputValue("")
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 pb-4 space-y-4 scroll-smooth minimal-scrollbar relative"
        style={{ scrollBehavior: "smooth", contain: "layout style paint" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((message) => {
            const isCollapsed = collapsedMessages.has(message.id)
            const isAssistant = message.role === "assistant"
            // Check if this message is from the current user by comparing author_id
            const isSelf = message.author_id === currentUserId
            const shouldShowCollapse = isAssistant && message.content.length > 200
            const content = isCollapsed && shouldShowCollapse
              ? message.content.slice(0, 150) + "..."
              : message.content

            const isNewest = message.id === newestMessageId && !allowAnimation
            // Check if this is the first assistant message that just replaced the loading state
            const justReplacedLoading = isAssistant && message.id === justReplacedMessageId

            // Get display name
            const displayName = isAssistant
              ? "Native"
              : message.author?.full_name || "User"

            return (
              <motion.div
                key={message.id}
                layoutId={justReplacedLoading ? "native-message" : undefined}
                variants={chatMessageFadeIn}
                initial={isNewest ? false : "initial"}
                animate={isNewest ? false : "animate"}
                exit="exit"
                style={isNewest ? { transform: 'none' } : undefined}
                className={cn(
                  "flex items-start gap-3",
                  isSelf ? "justify-end" : "justify-start"
                )}
              >
                {!isSelf && (
                  <div className="flex-shrink-0 mt-1">
                    {isAssistant ? (
                      <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                        <span className="text-white font-bold text-xs">N</span>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[var(--color-avatar-bg)] flex items-center justify-center">
                        <span className="text-[var(--color-avatar-text)] font-medium text-xs">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className={cn("flex flex-col gap-1 max-w-[70%]", isSelf && "items-end text-right")}>
                  <span className="text-xs font-medium text-[var(--color-fg-secondary)] px-1">
                    {displayName}
                  </span>

                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 relative",
                      isSelf
                        ? "bg-[var(--color-chat-user-bg)] text-[var(--color-chat-user-text)]"
                        : "bg-[var(--color-chat-system-bg)] text-[var(--color-chat-system-text)] border border-[var(--color-border-subtle)]"
                    )}
                  >
                    <motion.p
                      className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words mb-1"
                      animate={{ height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      {content}
                    </motion.p>

                    <p
                      className="text-[11px] text-white/70"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(message.timestamp)}
                    </p>

                    {shouldShowCollapse && (
                      <button
                        onClick={() => toggleMessageCollapse(message.id)}
                        className="mt-2 flex items-center justify-center w-full text-[11px] text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)] transition-colors"
                        aria-label={isCollapsed ? "Expand message" : "Collapse message"}
                      >
                        <motion.svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          animate={{ rotate: isCollapsed ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {isNativeResponding && (
            <motion.div
              key="native-responding"
              layoutId="native-message"
              variants={fadeOutOnly}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-start gap-3 justify-start"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 max-w-[70%]">
                <span className="text-xs font-medium text-[var(--color-fg-secondary)] px-1 font-ui">
                  Native
                </span>
                <div className="rounded-lg px-4 py-3 bg-[var(--color-chat-system-bg)] text-[var(--color-chat-system-text)] border border-[var(--color-border-subtle)]">
                  <div className="native-loader" aria-label="Native is thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-5 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]"
      >
        <div className="flex items-center gap-3">
          <input
            className="flex-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-2 text-sm text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 font-ui"
            placeholder='Say something… start with "Native" for an AI assist'
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <button
            type="submit"
            className="h-10 px-5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ui"
            disabled={!inputValue.trim() || isNativeResponding}
          >
            {isNativeResponding ? "Thinking…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  )
}

