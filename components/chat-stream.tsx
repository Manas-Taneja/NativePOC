"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatRelativeTime } from "@/lib/utils"
import { Message } from "@/lib/mock-data"
import { slideUpFadeIn } from "@/lib/animations"

interface ChatStreamProps {
  messages: Message[]
  className?: string
}

/**
 * ChatStream - iOS Messages-style chat interface with streaming
 */
export function ChatStream({ messages, className }: ChatStreamProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [displayedMessages, setDisplayedMessages] = React.useState<Message[]>([])
  const [streamingMessageId, setStreamingMessageId] = React.useState<string | null>(null)
  const [streamedContent, setStreamedContent] = React.useState("")
  const [collapsedMessages, setCollapsedMessages] = React.useState<Set<string>>(new Set())

  // Simulate streaming messages on mount
  React.useEffect(() => {
    let currentIndex = 0
    
    const showNextMessage = () => {
      if (currentIndex < messages.length) {
        const message = messages[currentIndex]
        
        if (message.role === "assistant" && message.content.length > 50) {
          // Stream assistant messages character by character
          setStreamingMessageId(message.id)
          setDisplayedMessages(prev => [...prev, message])
          
          let charIndex = 0
          const streamInterval = setInterval(() => {
            if (charIndex < message.content.length) {
              setStreamedContent(message.content.slice(0, charIndex + 1))
              charIndex++
            } else {
              clearInterval(streamInterval)
              setStreamingMessageId(null)
              setStreamedContent("")
              currentIndex++
              setTimeout(showNextMessage, 500)
            }
          }, 20) // 20ms per character for smooth streaming
        } else {
          // Show user messages instantly
          setDisplayedMessages(prev => [...prev, message])
          currentIndex++
          setTimeout(showNextMessage, 800)
        }
      }
    }

    // Start showing messages after a brief delay
    const timeout = setTimeout(showNextMessage, 500)
    return () => clearTimeout(timeout)
  }, [messages])

  // Auto-scroll to bottom when new messages appear
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayedMessages, streamedContent])

  // Toggle message collapse state
  const toggleMessageCollapse = (messageId: string) => {
    setCollapsedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-6 pb-32 space-y-4 scroll-smooth minimal-scrollbar"
          style={{ scrollBehavior: "smooth" }}
        >
        <AnimatePresence mode="popLayout">
          {displayedMessages.map((message, index) => {
            const isStreaming = streamingMessageId === message.id
            const isCollapsed = collapsedMessages.has(message.id)
            const isAssistant = message.role === "assistant"
            
            let content = isStreaming ? streamedContent : message.content
            const shouldShowCollapse = isAssistant && !isStreaming && content.length > 200
            
            // Truncate content if collapsed
            if (isCollapsed && shouldShowCollapse) {
              content = content.slice(0, 150) + "..."
            }
            
            return (
              <motion.div
                key={message.id}
                variants={slideUpFadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-start" : "justify-start"
                )}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {message.role === "assistant" ? (
                    <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">N</span>
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-muted)] flex items-center justify-center">
                      <span className="text-[var(--color-fg-secondary)] font-medium text-xs">
                        {message.userAvatar || "U"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 max-w-[70%]">
                  {/* User name for regular users, "Native" for AI */}
                  <span className="text-xs font-medium text-[var(--color-fg-secondary)] px-1">
                    {message.role === "assistant" ? "Native" : message.userName || "User"}
                  </span>

                  <div
                    className={cn(
                      "rounded-[20px] px-4 py-3 relative",
                      message.role === "user"
                        ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] border border-[var(--color-border-subtle)]"
                        : "bg-[var(--color-accent)]/10 text-[var(--color-fg-primary)] border border-[var(--color-accent)]/20"
                    )}
                  >
                  {/* Message Content */}
                  <motion.p 
                    className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words mb-1"
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    {content}
                    {isStreaming && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-[2px] h-[18px] bg-current ml-0.5 align-middle"
                      />
                    )}
                  </motion.p>
                  
                  {/* Timestamp inside bubble */}
                  {!isStreaming && (
                    <p
                      className={cn(
                        "text-[11px] text-[var(--color-fg-tertiary)]"
                      )}
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(message.timestamp)}
                    </p>
                  )}
                  
                  {/* Collapse/Expand button for AI messages */}
                  {shouldShowCollapse && (
                    <button
                      onClick={() => toggleMessageCollapse(message.id)}
                      className={cn(
                        "mt-2 flex items-center justify-center w-full text-[11px] text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)] transition-colors"
                      )}
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
        </AnimatePresence>
      </div>
    </div>
  )
}

