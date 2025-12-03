"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Channel, ChatMember } from "@/hooks/useChat"
import { useUser } from "@/contexts/user-context"

type ChannelSidebarProps = {
  channels: Channel[]
  currentChannel: Channel | null
  members: ChatMember[]
  organizationName?: string
  onSelectChannel?: (channel: Channel) => void
  onInvite?: () => void
  onToggleCollapse?: () => void
  collapsed?: boolean
  className?: string
  onNewDM?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const iconMap: Record<Channel["type"], string> = {
  "ai-assistant": "✨",
  team: "#",
  direct: "→",
}

const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

export function ChannelSidebar({
  channels,
  currentChannel,
  members,
  organizationName = "NativeIQ",
  onSelectChannel,
  onInvite,
  onNewDM,
  onToggleCollapse,
  collapsed = false,
  className,
  isMobileOpen = false,
  onMobileClose,
}: ChannelSidebarProps) {
  const { userId: currentUserId } = useUser()
  const [isHovered, setIsHovered] = React.useState(false)
  const isExpanded = !collapsed || isHovered

  const handleChannelSelect = (channel: Channel) => {
    onSelectChannel?.(channel)
    onMobileClose?.()
  }

  const renderSidebarContent = (showCloseButton = false) => (
    <>
      {showCloseButton && (
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-fg-primary)] z-50"
          aria-label="Close sidebar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {onToggleCollapse && !showCloseButton && (
        <button
          type="button"
          className="absolute -right-3 top-10 z-50 h-8 w-8 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] shadow-sm flex items-center justify-center"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggleCollapse}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isExpanded ? "rotate-180" : ""}
          >
            <path
              d="M12 4L8 10L12 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <header className="border-b border-[var(--color-border-subtle)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-bg-highlight)] flex items-center justify-center font-semibold text-[var(--color-bg-base)]">
            {organizationName[0] ?? "N"}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-fg-primary)]">{organizationName}</p>
            <span className="text-xs text-[var(--color-fg-tertiary)]">{members.length} members</span>
          </div>
        </div>
      </header>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
          {/* AI Assistant */}
          <section className="mb-6">
            <h4 className="px-5 mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">
              Native AI
            </h4>
            <ul>
              {channels
                .filter((ch) => ch.type === "ai-assistant")
                .map((channel) => (
                  <li key={channel.id}>
                    <button
                      onClick={() => handleChannelSelect(channel)}
                      className={cn(
                        "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3",
                        currentChannel?.id === channel.id
                          ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                      <span>{channel.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          {/* Team Chat */}
          <section className="mb-6">
            <h4 className="px-5 mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">
              Team Chat (with AI)
            </h4>
            <ul>
              {channels
                .filter((ch) => ch.type === "team")
                .map((channel) => (
                  <li key={channel.id}>
                    <button
                      onClick={() => handleChannelSelect(channel)}
                      className={cn(
                        "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3",
                        currentChannel?.id === channel.id
                          ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{channel.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          {/* Direct Messages */}
          <section className="mb-6">
            <div className="flex items-center justify-between px-5 mb-2">
              <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">
                Direct Messages
              </h4>
              <button
                type="button"
                className="h-6 w-6 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)] text-sm hover:bg-[var(--color-bg-subtle)] transition-colors"
                onClick={() => onNewDM?.()}
                aria-label="New direct message"
              >
                +
              </button>
            </div>
            <ul>
              {channels
                .filter((ch) => ch.type === "direct")
                .slice(0, 5) // Show only 5 most recent
                .map((channel) => {
                  // For DM channels, show the OTHER person's name
                  const participants = channel.metadata?.participants || []
                  const participantNames = channel.metadata?.participantNames || {}

                  // Find the other user's ID
                  const otherUserId = participants.find((id: string) => id !== currentUserId)
                  // Get the other user's name
                  const displayName = otherUserId ? participantNames[otherUserId] : channel.name

                  return (
                    <li key={channel.id}>
                      <button
                        onClick={() => handleChannelSelect(channel)}
                        className={cn(
                          "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3",
                          currentChannel?.id === channel.id
                            ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] font-medium"
                            : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                        )}
                      >
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{displayName}</span>
                      </button>
                    </li>
                  )
                })}
            </ul>
          </section>

          {/* Team Members */}
          <section>
            <div className="flex items-center justify-between px-5 mb-2">
              <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">Team Members</h4>
              <button
                type="button"
                className="h-6 w-6 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)] text-sm hover:bg-[var(--color-bg-subtle)] transition-colors"
                onClick={() => onInvite?.()}
                aria-label="Invite team member"
              >
                +
              </button>
            </div>
            <ul>
              {members.map((member) => (
                <li key={member.id} className="px-5 py-2 flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-[var(--color-bg-subtle)] text-[0.7rem] font-semibold flex items-center justify-center text-[var(--color-fg-secondary)]">
                    {getInitials(member.full_name)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-fg-primary)]">{member.full_name}</p>
                  </div>
                  {member.role === "owner" && (
                    <span className="text-[0.6rem] uppercase tracking-wide text-[var(--color-accent)]">Owner</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-2xl transition-transform duration-300 ease-in-out pointer-events-auto z-[65] rounded-r-3xl",
            isExpanded ? "translate-x-0" : "translate-x-[calc(-100%+16px)]",
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderSidebarContent(false)}
        </aside>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              aria-hidden="true"
            />
            {/* Mobile Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-2xl z-[65] lg:hidden"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

