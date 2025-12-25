"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatRelativeTime } from "@/lib/utils"
import { type Message } from "@/hooks/useChat"
import { chatMessageFadeIn, fadeOutOnly } from "@/lib/animations"
import { useUser } from "@/contexts/user-context"

interface ChatStreamProps {
  messages: Message[]
  className?: string
  onSendMessage?: (content: string, replyToId?: string) => void
  isNativeResponding?: boolean
  channelType?: "team" | "direct" | "ai-assistant"
  channelName?: string | null
  aiError?: string | null
  onRetryAI?: () => void
  onRegenerate?: (message: Message) => void
  onFeedback?: (message: Message, value: "up" | "down") => void
}

/**
 * ChatStream - iOS Messages-style chat interface with streaming
 */
export function ChatStream({
  messages,
  className,
  onSendMessage,
  isNativeResponding,
  channelType = "team",
  channelName,
  aiError,
  onRetryAI,
  onRegenerate,
  onFeedback,
}: ChatStreamProps) {
  const { userId: currentUserId } = useUser()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [collapsedMessages, setCollapsedMessages] = React.useState<Set<string>>(new Set())
  const [inputValue, setInputValue] = React.useState("")
  const previousMessagesLength = React.useRef(messages.length)
  const [newestMessageId, setNewestMessageId] = React.useState<string | null>(null)
  const [allowAnimation, setAllowAnimation] = React.useState(true)
  const wasRespondingRef = React.useRef(false)
  const [justReplacedMessageId, setJustReplacedMessageId] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [showScrollToLatest, setShowScrollToLatest] = React.useState(false)
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null)
  const [feedbackMap, setFeedbackMap] = React.useState<Record<string, "up" | "down">>({})
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null)

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
    onSendMessage?.(trimmed, replyingTo?.id)
    setInputValue("")
    setReplyingTo(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault()
      inputRef.current?.focus()
      return
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed) return
      onSendMessage?.(trimmed, replyingTo?.id)
      setInputValue("")
      setReplyingTo(null)
    }

    if (event.key === "Escape" && replyingTo) {
      event.preventDefault()
      setReplyingTo(null)
      inputRef.current?.focus()
    }
  }

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  const resizeComposer = () => {
    if (!inputRef.current) return
    const el = inputRef.current
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  React.useEffect(() => {
    resizeComposer()
  }, [inputValue])

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const threshold = 120
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    setShowScrollToLatest(distanceFromBottom > threshold)
  }, [])

  const scrollToLatest = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    setShowScrollToLatest(false)
  }

  const placeholder = React.useMemo(() => {
    if (channelType === "team") {
      return "Chat with team — @native to loop in AI"
    }
    return "Direct message — @native to loop in AI"
  }, [channelType])

  const helperText = React.useMemo(() => {
    return "Enter to send; Shift+Enter newline; Cmd/Ctrl+K focus."
  }, [])

  const channelStatus = React.useMemo(() => {
    if (channelType === "team") {
      return {
        badge: "Team",
        text: "AI replies only when @native is mentioned.",
      }
    }
    return {
      badge: "DM",
      text: "AI joins when @native is mentioned.",
    }
  }, [channelType])

  const handleCopy = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedMessageId(message.id)
      setTimeout(() => setCopiedMessageId(null), 1500)
    } catch (error) {
      console.error("Copy failed", error)
    }
  }

  const handleFeedbackClick = (message: Message, value: "up" | "down") => {
    setFeedbackMap((prev) => ({ ...prev, [message.id]: value }))
    onFeedback?.(message, value)
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden py-6 pb-4 scroll-smooth minimal-scrollbar relative"
        style={{ scrollBehavior: "smooth", contain: "layout style paint" }}
        onScroll={handleScroll}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="px-5 space-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.length === 0 && (
              <motion.div
                layout
                className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-6 text-[var(--color-fg-secondary)] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] flex items-center justify-center font-semibold">
                    {channelType === "direct" ? "DM" : "Team"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                      {channelType === "team"
                        ? "Say hi to the team; @native when you want AI."
                        : "Start a direct message; @native to invite AI."}
                    </p>
                    <p className="text-xs text-[var(--color-fg-tertiary)]">
                      {channelName ? `Channel: ${channelName}` : "No history yet."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-dashed border-[var(--color-border-subtle)] px-3 py-2 bg-[var(--color-bg-subtle)]/60">
                    <p className="font-semibold text-[var(--color-fg-primary)]">Try</p>
                    <p className="text-[var(--color-fg-secondary)] mt-1">
                      {channelType === "team" ? "“@native summarize this thread”" : "“@native summarize today’s alerts”"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-dashed border-[var(--color-border-subtle)] px-3 py-2 bg-[var(--color-bg-subtle)]/60">
                    <p className="font-semibold text-[var(--color-fg-primary)]">Shortcuts</p>
                    <p className="text-[var(--color-fg-secondary)] mt-1">Enter send · Shift+Enter newline · Cmd/Ctrl+K focus</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-[var(--color-border-subtle)] px-3 py-2 bg-[var(--color-bg-subtle)]/60">
                    <p className="font-semibold text-[var(--color-fg-primary)]">Visibility</p>
                    <p className="text-[var(--color-fg-secondary)] mt-1">
                      {channelType === "direct" ? "Only participants see messages." : "Visible to everyone in this channel."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
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

              // Try to parse JSON content from Assistant
              let structuredData = null
              let displayContent = content

              if (isAssistant) {
                try {
                  // Clean up markdown code blocks if present (though system prompt says not to)
                  // Clean up markdown code blocks if present (more robustly)
                  const cleanJson = message.content.replace(/```json/g, "").replace(/```/g, "").trim()
                  const parsed = JSON.parse(cleanJson)
                  if (parsed.type && (parsed.type === 'insight' || parsed.type === 'text')) {
                    structuredData = parsed
                    displayContent = parsed.content
                    if (isCollapsed && shouldShowCollapse) {
                      displayContent = parsed.content.slice(0, 150) + "..."
                    }
                  }
                } catch (e) {
                  // Not JSON, treat as plain text
                }
              }

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
                  role="article"
                  aria-label={`Message from ${displayName}${message.reply_to ? ` replying to ${message.reply_to.author?.full_name || "message"}` : ""}`}
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
                        "rounded-lg px-4 py-3 relative group",
                        isSelf
                          ? "bg-[var(--color-chat-user-bg)] text-[var(--color-chat-user-text)]"
                          : "bg-[var(--color-chat-system-bg)] text-[var(--color-chat-system-text)] border border-[var(--color-border-subtle)]"
                      )}
                    >
                      {message.reply_to && (
                        <div
                          className={cn(
                            "mb-2 pl-3 border-l-2 rounded-sm",
                            isSelf
                              ? "border-white/40 bg-white/10"
                              : "border-[var(--color-accent)] bg-[var(--color-accent-muted)]/20"
                          )}
                          role="region"
                          aria-label={`Quoted message from ${message.reply_to.author?.full_name || "User"}`}
                        >
                          <p className="text-[11px] font-medium text-[var(--color-fg-secondary)] mb-1">
                            {message.reply_to.author?.full_name || "User"}
                          </p>
                          <p className="text-[12px] text-[var(--color-fg-secondary)] line-clamp-2">
                            {message.reply_to.content.length > 100
                              ? message.reply_to.content.slice(0, 100) + "..."
                              : message.reply_to.content}
                          </p>
                        </div>
                      )}
                      <motion.div
                        className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words mb-1"
                        animate={{ height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        {(!structuredData || structuredData.type !== 'insight') && displayContent}

                        {structuredData?.type === 'insight' && structuredData.data && (
                          <div className="mt-3 bg-[var(--color-bg-subtle)]/50 rounded-lg border-l-4 border-[var(--color-accent)] p-3 shadow-sm not-italic text-left">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-semibold text-[var(--color-fg-primary)] text-sm">{structuredData.data.title}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={cn("text-lg font-bold tracking-tight",
                                  (structuredData.data.trend === 'up' || structuredData.data.value.startsWith('+')) ? "text-emerald-600" :
                                    (structuredData.data.trend === 'down' || structuredData.data.value.startsWith('-')) ? "text-red-600" : "text-[var(--color-accent)]"
                                )}>{structuredData.data.value}</span>
                                {structuredData.data.change && (
                                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                                    (structuredData.data.change.startsWith('+') || structuredData.data.trend === 'up') ? "bg-emerald-500/10 text-emerald-600" :
                                      (structuredData.data.change.startsWith('-') || structuredData.data.trend === 'down') ? "bg-red-500/10 text-red-600" : "bg-gray-100 text-gray-600"
                                  )}>
                                    {structuredData.data.change}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Simple progress bar if value is a percentage */}
                            {structuredData.data.value && structuredData.data.value.includes('%') && (
                              <div className="mt-2 h-1.5 w-full bg-[var(--color-bg-base)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--color-accent)]"
                                  style={{ width: structuredData.data.value.replace('>', '').replace('<', '') }} // Simple cleanup
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>

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
                          aria-label={isCollapsed ? "Expand full answer" : "Show less"}
                        >
                          {isCollapsed ? "Expand full answer" : "Show less"}
                        </button>
                      )}

                      {!isAssistant && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(message)
                            inputRef.current?.focus()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setReplyingTo(message)
                              inputRef.current?.focus()
                            }
                          }}
                          className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity h-6 w-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] focus:bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 shadow-sm"
                          aria-label={`Reply to ${displayName}`}
                          tabIndex={0}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M6 2L2 6L6 10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
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
                    <div className="native-loader" aria-label="Native is thinking" role="status" aria-live="polite">
                      <span />
                      <span />
                      <span />
                    </div>
                    <p className="text-[11px] text-[var(--color-fg-secondary)] mt-2">Native is thinking (~5s)</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {showScrollToLatest && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={scrollToLatest}
              className="absolute bottom-6 right-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-md px-3 py-2 text-xs font-medium text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors"
              aria-label="Jump to latest message"
            >
              Jump to latest
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={handleSubmit}
        className="py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]"
      >
        <div className="px-4 space-y-2">
          {aiError && (
            <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 px-3 py-2 text-[12px] text-[var(--color-error)]"
              role="alert"
              aria-live="assertive"
            >
              <span className="font-semibold">Native issue</span>
              <span className="text-[var(--color-fg-secondary)] text-[11px]">{aiError}</span>
              {onRetryAI && (
                <button
                  type="button"
                  onClick={onRetryAI}
                  className="ml-auto rounded-md px-2 py-1 bg-[var(--color-accent)] text-white text-[11px] hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] px-3 py-2"
                role="status"
                aria-live="polite"
                id="reply-context"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[var(--color-accent)] mb-1">
                    Replying to {replyingTo.author?.full_name || "User"}
                  </p>
                  <p className="text-[12px] text-[var(--color-fg-secondary)] truncate">
                    {replyingTo.content.length > 60
                      ? replyingTo.content.slice(0, 60) + "..."
                      : replyingTo.content}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null)
                    inputRef.current?.focus()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setReplyingTo(null)
                      inputRef.current?.focus()
                    }
                  }}
                  className="h-6 w-6 rounded-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] focus:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
                  aria-label="Cancel reply"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Reply Suggestions (Reverse Prompts) */}
          {!isNativeResponding && messages.length > 0 && channelType === 'team' && (
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
              {[
                "Predict next Q1 metrics?",
                "Compare with last year",
                "Explain the decline"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputValue(`@native ${suggestion}`)
                    inputRef.current?.focus()
                  }}
                  className="flex-shrink-0 whitespace-nowrap rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 px-4 py-1.5 text-[11px] font-medium text-black dark:text-white hover:bg-[var(--color-accent)]/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start gap-3">
            <textarea
              ref={inputRef}
              className="flex-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 font-ui resize-none leading-5 no-scrollbar overflow-hidden"
              placeholder={placeholder}
              value={inputValue}
              rows={1}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onInput={resizeComposer}
              aria-label="Chat message composer"
              aria-describedby={replyingTo ? "reply-context" : undefined}
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ui inline-flex items-center gap-2"
              disabled={!inputValue.trim() || isNativeResponding}
              aria-label={isNativeResponding ? "Native is responding" : "Send message"}
            >
              {isNativeResponding ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  <span>Thinking…</span>
                </>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <div className="text-[11px] text-[var(--color-fg-tertiary)] font-ui flex items-center gap-2">
            <span className="inline-flex h-5 min-w-[24px] items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-2">
              {channelType === "direct" ? "DM" : channelType === "team" ? "Team" : "Native"}
            </span>
            <span className="truncate">
              {helperText}
            </span>
            {channelName && (
              <span className="ml-auto text-[var(--color-fg-secondary)] truncate">Channel: {channelName}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

